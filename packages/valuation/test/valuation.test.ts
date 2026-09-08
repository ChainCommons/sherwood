import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import {
  amount, Decimal, fromBaseUnits, hashJson, instant, toJSON, VALUATION_METHODS
} from '../../core/src/index.ts'
import type { Amount, ValuationMissReason } from '../../core/src/index.ts'
import { loadSchemas } from '../../validate/src/schema-registry.ts'
import {
  comparisonSpread, ENGINE_VERSION, isValuationMiss, MockPriceProvider, ValuationEngine
} from '../src/index.ts'
import type {
  PriceProvider, Quote, QuoteQuery, Valuation, ValuationResult, ValueInput
} from '../src/index.ts'

const timestamp = instant('2021-06-15T23:40:00Z')
const generatedAt = instant('2026-01-10T09:00:07Z')
const query: QuoteQuery = {
  asset: { chain: 'tezos', symbol: 'XTZ' }, timestamp, targetCurrency: 'EUR'
}
const input: ValueInput = { ...query, quantity: amount('100') }
const quote = (price = '2.41', overrides: Partial<Quote> = {}): Quote => ({
  ...query, method: 'nearest_trade', unit_price: amount(price), provider_market: 'XTZ/EUR',
  time_resolution: 'PT5M', raw_source_reference: 'synthetic://xtz-eur/2021-06-15T23:40:00Z',
  confidence: 0.8, raw_payload: { price, source_timestamp: timestamp }, ...overrides
})
const provider = (id = 'primary', price = '2.41', q: QuoteQuery = query, response = quote(price, q)) =>
  new MockPriceProvider(id, [{ query: q, response }])
const engine = (...providers: PriceProvider[]) =>
  new ValuationEngine(providers, { now: () => generatedAt })
const valued = (result: ValuationResult): Valuation => {
  if (isValuationMiss(result)) throw new Error(`Expected a valuation, got ${result.reason}`)
  return result
}
const registry = loadSchemas(fileURLToPath(new URL('../../../', import.meta.url)))
const validate = (result: ValuationResult) => {
  const path = isValuationMiss(result) ? 'valuation-miss' : 'valuation'
  const check = registry.byPath.get(`schemas/valuation/${path}.schema.json`)!
  expect(check(JSON.parse(JSON.stringify(result))), JSON.stringify(check.errors)).toBe(true)
}

describe('AC-005: historical quote provenance and decimal precision', () => {
  it('values the operation instant with inspectable source, method and version', async () => {
    const result = valued(await engine(provider()).value(input))
    expect(result).toMatchObject({
      quantity: '100', unit_price: '2.41', total_value: '241', provider: 'primary',
      timestamp, target_currency: 'EUR', method: 'nearest_trade', time_resolution: 'PT5M',
      raw_source_reference: quote().raw_source_reference, raw_payload_hash: hashJson(quote().raw_payload!),
      generated_at: generatedAt, engine_version: ENGINE_VERSION, schema_version: '0.1.0',
      fallback_used: false, fallback_chain: ['primary']
    })
    validate(result)
  })

  it('preserves native quantity precision without rounding to fiat cents', async () => {
    const result = valued(await engine(provider('primary', '0.123456789012345678')).value({
      ...input, quantity: fromBaseUnits('1234567890123456789', 18)
    }))
    expect(result.quantity).toBe('1.234567890123456789')
    // Integer product 1234567890123456789 * 123456789012345678, scaled by 10^36.
    expect(result.total_value).toBe('0.152415787532388366390794098763907942')
    expect(valued(await engine(provider('primary', '2.41')).value({
      ...input, quantity: fromBaseUnits('1', 6)
    })).total_value).toBe('0.00000241')
  })

  it('passes UTC block time through even when the local date is the next day', async () => {
    const p = provider()
    const spy = vi.spyOn(p, 'quote')
    const result = valued(await engine(p).value({
      ...input, timestamp: instant('2021-06-16T01:40:00+02:00')
    }))
    expect(spy.mock.calls[0]![0].timestamp).toBe(timestamp)
    expect(result.timestamp).toBe(timestamp)
  })

  it.each(VALUATION_METHODS)('preserves explicit %s methodology', async (method) => {
    const q = { ...query, method }
    const result = valued(await engine(provider('method', '2.41', q, quote('2.41', {
      ...q, time_resolution: method === 'daily' ? 'P1D; UTC calendar date' : 'PT5M'
    }))).value({ ...input, method }))
    expect(result.method).toBe(method)
    expect(result.timestamp).toBe(timestamp)
    validate(result)
  })

  it.each([
    [{ asset_id: 'fiat-eur' }, 'USD'],
    [{ chain: 'synthetic', symbol: 'TOKEN' }, 'BTC']
  ] as const)('does not restrict providers to one chain or fiat pair: %j / %s', async (asset, targetCurrency) => {
    const q = { ...query, asset, targetCurrency }
    const result = valued(await engine(provider('pair', '0.1', q)).value({ ...q, quantity: amount('3') }))
    expect(result.total_value).toBe('0.3')
    validate(result)
  })

  it('reproduces byte-identical records with the same quote and generation instant', async () => {
    const a = await engine(provider()).value(input)
    const b = await engine(provider()).value(input)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })
})

describe('recorded fallback and UNKNOWN', () => {
  it('records every attempted provider and stops on the first successful quote', async () => {
    const unused = provider('unused')
    const spy = vi.spyOn(unused, 'quote')
    const result = valued(await engine(
      new MockPriceProvider('first', [], { reason: 'network' }), provider('second'), unused
    ).value(input))
    expect(result.provider).toBe('second')
    expect(result.fallback_used).toBe(true)
    expect(result.fallback_chain).toEqual(['first', 'second'])
    expect(spy).not.toHaveBeenCalled()
    validate(result)
  })

  it('honors the caller-specified provider order and subset', async () => {
    const result = valued(await engine(provider('a', '0.9'), provider('b', '0.93')).value({
      ...input, providers: ['b', 'a']
    }))
    expect(result.provider).toBe('b')
    expect(result.unit_price).toBe('0.93')
    expect(result.fallback_chain).toEqual(['b'])
  })

  it('keeps every miss reason and never adds price fields when all providers miss', async () => {
    const reasons: ValuationMissReason[] = ['network', 'hole', 'unsupported_asset', 'no_market']
    const result = await engine(...reasons.map((reason) =>
      new MockPriceProvider(reason, [], { reason, detail: `Fixture ${reason}` })
    )).value(input)
    expect(isValuationMiss(result)).toBe(true)
    if (!isValuationMiss(result)) throw new Error('Expected a miss')
    expect(result.reason).toBe('no_market')
    expect(result.providers_tried).toEqual(reasons)
    expect(JSON.parse(result.detail)).toEqual(reasons.map((reason) => ({
      provider: reason, reason, detail: `Fixture ${reason}`
    })))
    expect(result).not.toHaveProperty('unit_price')
    expect(result).not.toHaveProperty('total_value')
    validate(result)
  })

  it.each([
    { chain: 'tezos', contract: 'KT1SyntheticNft', token_id: '42' },
    { chain: 'synthetic', symbol: 'USDC' },
    { asset_id: 'fiat-eur' }
  ])('does not invent NFT floors, stablecoin parity or same-currency parity for %j', async (asset) => {
    const result = await engine(new MockPriceProvider('empty', [], { reason: 'no_market' })).value({
      ...input, asset
    })
    expect(isValuationMiss(result)).toBe(true)
    validate(result)
  })

  it('distinguishes a sourced zero price and zero quantity from a miss', async () => {
    const zeroPrice = valued(await engine(provider('zero', '0')).value(input))
    const zeroQuantity = valued(await engine(provider()).value({ ...input, quantity: amount('0') }))
    expect(zeroPrice.total_value).toBe('0')
    expect(zeroPrice.raw_source_reference).toBeTruthy()
    expect(zeroQuantity.total_value).toBe('0')
    expect(isValuationMiss(await engine(new MockPriceProvider('empty')).value({
      ...input, quantity: amount('0')
    }))).toBe(true)
  })

  it('propagates unexpected provider errors instead of hiding them as missing prices', async () => {
    const failure = new Error('Adapter programming error')
    await expect(engine({ id: 'broken', quote: async () => { throw failure } }).value(input)).rejects.toBe(failure)
  })
})

describe('multi-provider comparison', () => {
  it('keeps ordered selection, alternatives, full provenance, misses and decimal spread', async () => {
    const result = await engine(
      new MockPriceProvider('offline', [], { reason: 'network' }),
      provider('b', '0.93'), provider('a', '0.91'), provider('c', '0.90')
    ).compare(input)
    expect(result.status).toBe('VALUED')
    const selected = valued(result.selected)
    expect(selected.provider).toBe('b')
    expect(selected.fallback_chain).toEqual(['offline', 'b'])
    expect(selected.fallback_used).toBe(true)
    expect(selected.alternatives?.map((v) => v.provider)).toEqual(['a', 'c'])
    expect(result.misses).toEqual([{ provider: 'offline', reason: 'network' }])
    expect(result.valuations.map((v) => v.unit_price)).toEqual(['0.93', '0.91', '0.9'])
    expect(result.spread).toBe('3.333333333333333333333333333333333333333')
    expect(selected.spread).toBe(result.spread)
    result.valuations.forEach(validate)
    validate(selected)
    expect(result.valuations[1]!.fallback_chain).toEqual(['a'])
  })

  it('returns UNKNOWN and no spread when every provider misses', async () => {
    const result = await engine(new MockPriceProvider('empty')).compare(input)
    expect(result.status).toBe('UNKNOWN')
    expect(isValuationMiss(result.selected)).toBe(true)
    expect(result.valuations).toEqual([])
    expect(result).not.toHaveProperty('spread')
    validate(result.selected)
  })

  it('does not mistake a failed comparison after selection for fallback', async () => {
    const result = await engine(provider(), new MockPriceProvider('empty')).compare(input)
    expect(valued(result.selected).fallback_used).toBe(false)
    expect(valued(result.selected).fallback_chain).toEqual(['primary'])
    expect(result).not.toHaveProperty('spread')
    expect(result.misses).toEqual([{ provider: 'empty', reason: 'hole' }])
  })

  it.each([
    [[], undefined], [['1'], undefined], [['0', '1'], undefined],
    [['0', '0'], undefined], [['0.9', '0.9'], '0'], [['0.8', '1'], '25']
  ] as const)('defines spread edge cases %j as %s', (prices, expected) => {
    const spread = comparisonSpread(prices.map((price) => amount(price)))
    expect(spread === undefined ? undefined : toJSON(spread)).toBe(expected)
  })
})

describe('provider boundary and mock isolation', () => {
  it.each(['wrong currency', 'wrong asset', 'wrong time', 'missing source', 'invalid confidence', 'negative price']) (
    'rejects %s rather than materializing an unsupported valuation', async (problem) => {
      const overrides: Record<string, Partial<Quote>> = {
        'wrong currency': { targetCurrency: 'USD' },
        'wrong asset': { asset: { chain: 'different-chain', symbol: 'XTZ' } },
        'wrong time': { timestamp: instant('2021-06-15T00:00:00Z') },
        'missing source': { raw_source_reference: '' },
        'invalid confidence': { confidence: Number.NaN },
        'negative price': { unit_price: amount('-1') }
      }
      await expect(engine(provider('bad', '1', query, quote('1', overrides[problem]))).value(input)).rejects.toThrow()
    }
  )

  it('does not silently substitute a daily quote for an explicit exact method', async () => {
    const q: QuoteQuery = { ...query, method: 'exact_timestamp' }
    await expect(engine(provider('bad', '1', q, quote('1', { method: 'daily' }))).value({
      ...input, method: 'exact_timestamp'
    })).rejects.toThrow(/method/)
  })

  it.each([0.1, '0.1', new Decimal('NaN'), amount('-1')])('rejects invalid quantity %s', async (quantity) => {
    await expect(engine(provider()).value({ ...input, quantity: quantity as Amount })).rejects.toThrow(/quantity/)
  })

  it('rejects bare numeric prices at the provider boundary', async () => {
    const p: PriceProvider = { id: 'bad', quote: async () => quote('1', { unit_price: 0.1 as unknown as Amount }) }
    await expect(engine(p).value(input)).rejects.toThrow(/unit_price/)
  })

  it('rejects empty, duplicate or unregistered provider policies', async () => {
    expect(() => engine()).toThrow(/At least one/)
    expect(() => engine(provider(), provider())).toThrow(/unique/)
    for (const providers of [[], ['primary', 'primary'], ['missing']]) {
      await expect(engine(provider()).value({ ...input, providers })).rejects.toThrow(/policy/)
    }
  })

  it('only matches configured queries, including method and exact instant', async () => {
    const p = provider()
    for (const q of [
      { ...query, timestamp: instant('2021-06-15T23:40:01Z') },
      { ...query, targetCurrency: 'USD' },
      { ...query, method: 'daily' as const }
    ]) expect(await p.quote(q)).toEqual({ reason: 'hole' })
    expect(() => new MockPriceProvider('duplicate', [
      { query, response: quote() }, { query, response: quote() }
    ])).toThrow(/Duplicate/)
  })

  it('snapshots supplied fixtures and isolates returned payloads from later mutation', async () => {
    const payload = { price: '2.41' }
    const fixture = quote('2.41', { raw_payload: payload })
    const p = provider('snapshot', '2.41', query, fixture)
    payload.price = '999'
    const first = await p.quote(query) as Quote
    expect(first.raw_payload).toEqual({ price: '2.41' })
    ;(first.raw_payload as { price: string }).price = '888'
    expect((await p.quote(query) as Quote).raw_payload).toEqual({ price: '2.41' })
  })
})
