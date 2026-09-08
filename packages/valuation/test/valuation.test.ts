import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import {
  VALUATION_METHODS, VALUATION_MISS_REASONS, amount, fromBaseUnits,
  hashJson, instant, toJSON
} from '../../core/src/index.ts'
import type { Amount, Instant } from '../../core/src/index.ts'
import { loadSchemas } from '../../validate/src/schema-registry.ts'
import { MockPriceProvider, ValuationEngine, relativeSpread } from '../src/index.ts'
import type { PriceProvider, Quote, QuoteQuery, ValuationResult, ValueInput } from '../src/index.ts'

const timestamp = instant('2021-06-15T23:40:00Z')
const generated = instant('2026-01-10T09:00:00Z')
const query: QuoteQuery = {
  asset: { chain: 'synthetic-chain', symbol: 'COIN' }, timestamp,
  targetCurrency: 'EUR', method: 'exact_timestamp'
}
const input: ValueInput = { ...query, quantity: amount('100.000001') }
const options = { now: () => generated, createId: () => 'synthetic-valuation' }
const quote = (price = '2.41', changes: Partial<Quote> = {}): Quote => ({
  ...query, asset: { ...query.asset }, unitPrice: amount(price), sourceTimestamp: timestamp,
  providerMarket: 'COIN/EUR', timeResolution: 'PT1S',
  rawSourceReference: 'synthetic://quote/2021-06-15T23:40:00Z',
  rawPayloadHash: hashJson({ price, timestamp }), confidence: 0.8, ...changes
})
const mock = (id = 'mock', price = '2.41', q = query, changes: Partial<Quote> = {}) =>
  new MockPriceProvider(id, [{ query: q, response: quote(price, { ...q, ...changes }) }])
const engine = (providers: readonly PriceProvider[] = [mock()]) => new ValuationEngine(providers, options)
const valued = (result: ValuationResult) => {
  expect(result.status).toBe('VALUED')
  if (result.status !== 'VALUED') throw new Error(result.miss.detail)
  return result.valuation
}
const registry = loadSchemas(fileURLToPath(new URL('../../../', import.meta.url)))
function validates(result: ValuationResult): void {
  const name = result.status === 'VALUED' ? 'valuation' : 'valuation-miss'
  const validate = registry.byPath.get(`schemas/valuation/${name}.schema.json`)!
  const record = result.status === 'VALUED' ? result.valuation : result.miss
  expect(validate(JSON.parse(JSON.stringify(record))), JSON.stringify(validate.errors)).toBe(true)
}

describe('AC-005 historical valuation', () => {
  it('exposes provenance and multiplies native quantity precision using core decimals', async () => {
    const result = await engine().value(input)
    const record = valued(result)
    expect(record).toMatchObject({
      quantity: '100.000001', unit_price: '2.41', total_value: '241.00000241',
      timestamp, provider: 'mock', method: 'exact_timestamp', target_currency: 'EUR',
      generated_at: generated, engine_version: 'valuation@0.0.0', schema_version: '0.1.0',
      provider_market: 'COIN/EUR', raw_source_reference: quote().rawSourceReference,
      raw_payload_hash: quote().rawPayloadHash, fallback_used: false, fallback_chain: ['mock']
    })
    validates(result)
    const small = valued(await engine([mock('mock', '0.123456789012345678')]).value({
      ...input, quantity: fromBaseUnits('1', 18)
    }))
    expect(small.total_value).toBe('0.000000000000000000123456789012345678')
  })

  it('replays deterministically with injected generation metadata and local mock data', async () => {
    const first = await engine().value(input)
    expect(await engine().value(input)).toEqual(first)
    expect(JSON.parse(JSON.stringify(first))).toEqual(JSON.parse(JSON.stringify(await engine().value(input))))
  })

  it('preserves UTC block time across a local date boundary', async () => {
    const record = valued(await engine().value({
      ...input, timestamp: '2021-06-16T01:40:00+02:00' as Instant
    }))
    expect(record.timestamp).toBe('2021-06-15T23:40:00.000Z')
  })

  it.each(VALUATION_METHODS)('records the explicit %s method without legal classification', async method => {
    const q: QuoteQuery = {
      ...query, method, ...(method === 'nearest_trade' ? { maxDistanceMs: 300_000 } : {})
    }
    const record = valued(await engine([mock('mock', '2.41', q)]).value({ ...input, ...q }))
    expect(record.method).toBe(method)
    expect(record).not.toHaveProperty('classification')
  })

  it('supports fiat and crypto target currencies through explicit quotes', async () => {
    for (const [asset, targetCurrency] of [
      [{ asset_id: 'fiat-eur' }, 'USD'], [{ chain: 'synthetic-chain', symbol: 'COIN' }, 'BTC']
    ] as const) {
      const q = { ...query, asset, targetCurrency }
      const result = await engine([mock('mock', '0.5', q)]).value({ ...input, ...q })
      expect(valued(result).total_value).toBe('50.0000005')
      validates(result)
    }
  })
})

describe('miss, fallback and provider boundaries', () => {
  it.each(VALUATION_MISS_REASONS)('records %s as UNKNOWN without price fields', async reason => {
    const provider = new MockPriceProvider('missing', [{ query, response: { reason } }])
    const result = await engine([provider]).value(input)
    expect(result.status).toBe('UNKNOWN')
    if (result.status !== 'UNKNOWN') throw new Error('expected miss')
    expect(result.miss).toMatchObject({ reason, providers_tried: ['missing'], timestamp })
    expect(result.miss).not.toHaveProperty('unit_price')
    expect(result.miss).not.toHaveProperty('total_value')
    validates(result)
  })

  it('records ordered misses and stops after the first successful fallback', async () => {
    const unused = { id: 'unused', quote: vi.fn().mockRejectedValue(new Error('must not run')) }
    const result = await engine([mock('success'), new MockPriceProvider('missing'), unused]).value({
      ...input, providers: ['missing', 'success', 'unused']
    })
    expect(valued(result)).toMatchObject({
      provider: 'success', fallback_used: true, fallback_chain: ['missing', 'success']
    })
    expect(result.attempts.map(item => item.status)).toEqual(['MISSED', 'QUOTED'])
    expect(unused.quote).not.toHaveBeenCalled()
  })

  it('records network failure and every miss, without persisting thrown messages', async () => {
    const broken = { id: 'broken', quote: async (): Promise<Quote> => { throw new Error('secret=private') } }
    const result = await engine([broken, new MockPriceProvider('missing')]).value(input)
    expect(result.status).toBe('UNKNOWN')
    expect(result.attempts).toMatchObject([
      { provider: 'broken', miss: { reason: 'network' } },
      { provider: 'missing', miss: { reason: 'hole' } }
    ])
    expect(JSON.stringify(result)).not.toContain('secret')
    validates(result)
    expect(valued(await engine([broken, mock()]).value(input)).fallback_used).toBe(true)
  })

  it('never assumes stablecoin parity or NFT floor prices, including zero quantities', async () => {
    for (const asset of [
      { asset_id: 'synthetic-stablecoin' },
      { chain: 'synthetic-chain', contract: 'synthetic-nft', token_id: '42' }
    ]) {
      const result = await engine().value({ ...input, asset, quantity: amount('0') })
      expect(result.status).toBe('UNKNOWN')
    }
  })

  it.each([
    { unitPrice: -1 as unknown as Amount },
    { unitPrice: amount('-1') },
    { confidence: NaN },
    { targetCurrency: 'USD' },
    { asset: { chain: 'different-chain', symbol: 'COIN' } },
    { sourceTimestamp: instant('2021-06-15T23:39:59Z') },
    { timestamp: instant('2021-06-15T23:39:59Z') },
    { timestamp: '2021-06-15T23:40:00' as Instant },
    { method: 'daily' as const },
    { rawSourceReference: '' },
    { timeResolution: '' },
    { confidence: 1.1 }
  ])('rejects invalid or mismatched quote %j as a hole', async changes => {
    const provider: PriceProvider = { id: 'bad', quote: async () => quote('1', changes) }
    const result = await engine([provider]).value(input)
    expect(result.attempts).toMatchObject([{ status: 'MISSED', miss: { reason: 'hole' } }])
    expect(result.status).toBe('UNKNOWN')
  })

  it('rejects malformed responses and isolates provider mutation of the query', async () => {
    const malformed: PriceProvider = { id: 'bad', quote: async () => null as unknown as Quote }
    const mutating: PriceProvider = {
      id: 'mutating', quote: async q => {
        Object.assign(q.asset, { chain: 'wrong-chain' })
        return quote('1', q)
      }
    }
    const result = await engine([malformed, mutating, mock()]).value(input)
    expect(valued(result).fallback_chain).toEqual(['bad', 'mutating', 'mock'])
    expect(input.asset.chain).toBe('synthetic-chain')
  })

  it('accepts evidenced zero prices, without turning a missing quote into zero', async () => {
    const result = await engine([mock('zero', '0')]).value(input)
    expect(valued(result).total_value).toBe('0')
    validates(result)
  })

  it('rejects ambiguous policies, invalid amounts, and timezone-less instants', async () => {
    expect(() => engine([])).toThrow()
    expect(() => engine([mock(), mock()])).toThrow()
    for (const changes of [
      { providers: [] }, { providers: ['missing'] }, { providers: ['mock', 'mock'] },
      { quantity: amount('-1') }, { quantity: 1 as unknown as Amount },
      { timestamp: '2021-06-15T23:40:00' as Instant }, { targetCurrency: 'eur' },
      { method: 'nearest_trade' as const }, { maxDistanceMs: -1 }
    ]) await expect(engine().value({ ...input, ...changes })).rejects.toThrow()
  })
})

describe('time resolution', () => {
  it('accepts nearest trade only within an explicit bounded distance', async () => {
    const q = { ...query, method: 'nearest_trade' as const, maxDistanceMs: 60_000 }
    for (const [sourceTimestamp, status] of [
      [instant('2021-06-15T23:39:00Z'), 'VALUED'],
      [instant('2021-06-15T23:41:00Z'), 'VALUED'],
      [instant('2021-06-15T23:38:59Z'), 'UNKNOWN']
    ]) {
      const result = await engine([mock('mock', '1', q, { sourceTimestamp: sourceTimestamp as Instant })])
        .value({ ...input, ...q })
      expect(result.status).toBe(status)
    }
  })

  it('uses the UTC day only when daily is explicitly requested', async () => {
    const q = { ...query, method: 'daily' as const }
    const provider = mock('daily', '1', q, {
      sourceTimestamp: instant('2021-06-15T00:00:00Z'), timeResolution: 'P1D'
    })
    expect(valued(await engine([provider]).value({ ...input, ...q })).timestamp).toBe(timestamp)
    expect((await engine([provider]).value(input)).status).toBe('UNKNOWN')
    const wrongDay = mock('daily', '1', q, { sourceTimestamp: instant('2021-06-16T00:00:00Z') })
    expect((await engine([wrongDay]).value({ ...input, ...q })).status).toBe('UNKNOWN')
  })
})

describe('comparison and spread', () => {
  it('compares all providers while respecting selection order and exposing alternatives', async () => {
    const comparison = await engine([
      new MockPriceProvider('missing'), mock('a', '0.91'), mock('b', '0.93'), mock('c', '0.90')
    ]).compare({ ...input, providers: ['missing', 'b', 'a', 'c'] })
    const record = valued(comparison.result)
    expect(record.provider).toBe('b')
    expect(record.fallback_chain).toEqual(['missing', 'b'])
    expect(record.alternatives.map(item => item.provider)).toEqual(['a', 'c'])
    expect(record.spread).toBe('0.03333333333333333333333333333333333333333')
    expect(comparison.spreadPercent).toBe('3.333333333333333333333333333333333333333')
    expect(comparison.result.attempts).toHaveLength(4)
    validates(comparison.result)
  })

  it('does not count comparison misses after selection as fallback', async () => {
    const result = await engine([mock(), new MockPriceProvider('missing')]).compare(input)
    expect(valued(result.result).fallback_used).toBe(false)
    expect(valued(result.result)).not.toHaveProperty('spread')
    expect(result.spreadPercent).toBeNull()
    const absent = await engine([new MockPriceProvider('missing')]).compare(input)
    expect(absent.result.status).toBe('UNKNOWN')
    expect(absent.spreadPercent).toBeNull()
  })

  it.each([
    [[], null], [['1'], null], [['0', '0'], '0'], [['1', '1'], '0'],
    [['0', '1'], null], [['0.1', '0.3'], '2'], [['2', '1'], '1']
  ] as const)('handles sparse, identical, zero and decimal prices: %j', (prices, expected) => {
    const spread = relativeSpread(prices.map(price => amount(price)))
    expect(spread === null ? null : toJSON(spread)).toBe(expected)
  })
})

describe('mock provider', () => {
  it('matches the complete query and never interpolates or conflates token identities', async () => {
    const provider = mock()
    for (const changes of [
      { timestamp: instant('2021-06-15T23:40:01Z') }, { targetCurrency: 'USD' },
      { asset: { ...query.asset, token_id: '42' } }, { method: 'daily' as const }
    ]) expect(await provider.quote({ ...query, ...changes })).toMatchObject({ reason: 'hole' })
  })

  it('copies fixtures on entry and return and rejects duplicate query keys', async () => {
    const response = quote()
    const entry = { query, response }
    const provider = new MockPriceProvider('mock', [entry])
    Object.assign(response.asset, { chain: 'changed' })
    const first = await provider.quote(query)
    if ('reason' in first) throw new Error('expected quote')
    Object.assign(first.asset, { chain: 'changed-again' })
    expect(await provider.quote(query)).toMatchObject({ asset: { chain: 'synthetic-chain' } })
    expect(() => new MockPriceProvider('mock', [entry, entry])).toThrow('duplicate')
  })
})
