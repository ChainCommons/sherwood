import { describe, expect, it } from 'vitest'
import { amount, instant } from '../../core/src/index.ts'
import type { Instant } from '../../core/src/index.ts'
import { MockPriceProvider, ValuationEngine, isValuationMiss } from '../src/index.ts'
import type { AssetRef, Miss, PriceProvider, Quote, ValueInput } from '../src/index.ts'

const timestamp = instant('2021-06-15T23:40:00Z')
const input: ValueInput = {
  asset: { chain: 'synthetic-chain', symbol: 'COIN' },
  timestamp, targetCurrency: 'EUR', quantity: amount('100.000001')
}
const quote: Quote = {
  asset: input.asset, timestamp, targetCurrency: 'EUR', method: 'exact_timestamp',
  unit_price: amount('2.41'), provider_market: 'COIN/EUR', time_resolution: 'PT1S',
  raw_source_reference: 'synthetic://quote-1', confidence: 0.8
}
const provider: PriceProvider = { id: 'synthetic', quote: async () => quote }
const engine = (p = provider) => new ValuationEngine([p], { now: () => timestamp })

describe('runtime boundary integrity', () => {
  it.each(['2021-06-15', '2021-06-15T23:40:00', 'not-an-instant']) (
    'rejects timezone-less or invalid timestamps: %s', async value => {
      await expect(engine().value({ ...input, timestamp: value as Instant })).rejects.toThrow(/Timestamp/)
    }
  )

  it('normalizes explicit offsets and preserves decimal quantities', async () => {
    const result = await engine().value({
      ...input, timestamp: '2021-06-16T01:40:00+02:00' as Instant
    })
    if (isValuationMiss(result)) throw new Error('Expected a quote')
    expect(result.timestamp).toBe(timestamp)
    expect(result.total_value).toBe('241.00000241')
  })

  it('rejects timezone-less provider timestamps and generation clocks', async () => {
    const local = '2021-06-15T23:40:00' as Instant
    await expect(engine({ ...provider, quote: async () => ({ ...quote, timestamp: local }) })
      .value(input)).rejects.toThrow(/Timestamp/)
    await expect(new ValuationEngine([provider], { now: () => local }).value(input))
      .rejects.toThrow(/Timestamp/)
  })

  it.each([
    null, {}, { chain: '' }, { chain: 12 }, { asset_id: 'invalid ID' },
    { chain: 'synthetic-chain', token_id: 42 },
    { chain: 'synthetic-chain', arbitrary: 'not-in-schema' }
  ])('rejects asset references that cannot be persisted: %j', async asset => {
    await expect(engine().value({ ...input, asset: asset as AssetRef })).rejects.toThrow(/asset/)
  })

  it('rejects malformed miss details instead of recording opaque objects', async () => {
    const malformed = { reason: 'hole', detail: { error: 'opaque' } } as unknown as Miss
    await expect(engine({ id: 'bad', quote: async () => malformed }).value(input))
      .rejects.toThrow(/detail/)
  })

  it('prevents a provider from mutating the request seen by other providers', async () => {
    const mutating: PriceProvider = {
      id: 'mutating', quote: async query => {
        Object.assign(query.asset, { chain: 'wrong-chain' })
        return { reason: 'hole' }
      }
    }
    await expect(engine(mutating).value(input)).rejects.toThrow(TypeError)
    expect(input.asset.chain).toBe('synthetic-chain')
  })

  it('requires nonempty mock provider IDs', () => {
    expect(() => new MockPriceProvider(' ')).toThrow(/non-empty/)
  })
})
