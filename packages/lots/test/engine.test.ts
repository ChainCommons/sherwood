import { describe, expect, it } from 'vitest'
import { amount, instant, sum, toJSON } from '../../core/src/index.ts'
import type { LotMethod } from '../../core/src/index.ts'
import { MockPriceProvider, ValuationEngine } from '../../valuation/src/index.ts'
import { matchDisposals, moveLots, openLots } from '../src/index.ts'
import type { CalculationPolicy, Disposal, Lot, SelfTransfer } from '../src/index.ts'

const policy: CalculationPolicy = { basis_decimals: 8, rounding_mode: 'HALF_EVEN' }
const asset = { chain: 'synthetic', symbol: 'TOKEN' }
const early = instant('2021-01-01T00:00:00Z')
const late = instant('2021-02-01T00:00:00Z')
const sold = instant('2021-03-01T00:00:00Z')
const lot = (id: string, quantity: string, basis?: string, overrides: Partial<Lot> = {}): Lot => ({
  lot_id: id, asset, owner: 'owner-a', acquired_at: id === 'a' ? early : late,
  acquisition_event: `acquire-${id}`, holding_period_start: early,
  quantity_original: quantity, quantity_remaining: quantity,
  ...(basis === undefined ? { cost_basis_status: 'UNKNOWN' } :
    { cost_basis: basis, cost_basis_currency: 'EUR', cost_basis_status: 'IMPORTED' }),
  schema_version: '0.1.0', ...overrides
})
const disposal = (quantity: string, overrides: Partial<Disposal> = {}): Disposal => ({
  event_id: 'sale', owner: 'owner-a', asset, occurred_at_utc: sold,
  cost_basis_currency: 'EUR', quantity, ...overrides
})
const lots = [lot('a', '100', '200'), lot('b', '50', '200')]
const total = (values: readonly (string | undefined)[]) => toJSON(sum(values.map((value) => amount(value!))))
const transfer = (quantity: string, overrides: Partial<SelfTransfer> = {}): SelfTransfer => ({
  event_id: 'transfer', occurred_at_utc: sold, asset,
  from: { wallet_id: 'wallet-a', owner: 'owner-a', confirmed: true },
  to: { wallet_id: 'wallet-b', owner: 'owner-a', confirmed: true },
  selections: [{ lot_id: 'a', quantity }], ...overrides
})

describe('golden matching methods', () => {
  it.each([
    ['FIFO', ['a', 'b'], ['100', '20'], ['200', '80']],
    ['LIFO', ['b', 'a'], ['50', '70'], ['200', '140']],
    ['HIFO', ['b', 'a'], ['50', '70'], ['200', '140']],
    ['AVERAGE_COST', ['a', 'b'], ['100', '20'], ['266.66666667', '53.33333333']],
    ['POOLING', ['a', 'b'], ['100', '20'], ['266.66666667', '53.33333333']]
  ] as const)('%s partial disposal', (method, ids, quantities, bases) => {
    const before = JSON.stringify(lots)
    const result = matchDisposals(lots, disposal('120'), method, policy)
    expect(result.status).toBe('KNOWN')
    expect(result.consumptions.map((entry) => entry.lot_id)).toEqual(ids)
    expect(result.consumptions.map((entry) => entry.quantity)).toEqual(quantities)
    expect(result.consumptions.map((entry) => entry.cost_basis)).toEqual(bases)
    expect(total([...result.consumptions, ...result.remainder].map((entry) => entry.cost_basis))).toBe('400')
    expect(result.method).toBe(method)
    expect(result.calculation_policy).toEqual(policy)
    expect(JSON.stringify(lots)).toBe(before)
    expect(matchDisposals([...lots].reverse(), disposal('120'), method, policy).consumptions).toEqual(result.consumptions)
  })

  it('selects an NFT lot without consuming another token or owner', () => {
    const nft = { chain: 'synthetic', contract: 'collection', token_id: '1' }
    const records = [lot('a', '1', '20', { asset: nft }), lot('b', '1', '100', {
      asset: { ...nft, token_id: '2' }
    }), lot('c', '1', '10', { asset: nft, owner: 'company' })]
    const result = matchDisposals(records, disposal('1', { asset: nft }), 'SPECIFIC_IDENTIFICATION', policy, ['a'])
    expect(result.consumptions).toMatchObject([{ lot_id: 'a', quantity: '1', cost_basis: '20' }])
    expect(result.remainder.slice(1)).toEqual(records.slice(1))
  })

  it('uses explicit specific-ID order and never silently falls back', () => {
    expect(matchDisposals(lots, disposal('60'), 'SPECIFIC_IDENTIFICATION', policy, ['b', 'a']).consumptions)
      .toMatchObject([{ lot_id: 'b', quantity: '50' }, { lot_id: 'a', quantity: '10' }])
    const result = matchDisposals(lots, disposal('60'), 'SPECIFIC_IDENTIFICATION', policy, ['b'])
    expect(result.gaps).toMatchObject([{ reason: 'insufficient_lots', quantity: '10' }])
    for (const ids of [[], ['missing']]) {
      const unknown = matchDisposals(lots, disposal('1'), 'SPECIFIC_IDENTIFICATION', policy, ids)
      expect(unknown.gaps[0]?.reason).toBe('missing_selection')
      expect(unknown.remainder).toEqual(lots)
    }
    expect(() => matchDisposals(lots, disposal('1'), 'SPECIFIC_IDENTIFICATION', policy, ['a', 'a'])).toThrow()
  })

  it('HIFO ranks unit cost, not total basis', () => {
    const result = matchDisposals([lot('a', '100', '100'), lot('b', '1', '5')], disposal('1'), 'HIFO', policy)
    expect(result.consumptions[0]?.lot_id).toBe('b')
  })

  it('average cost retains weighted basis across sequential disposals and new acquisitions', () => {
    const first = matchDisposals(lots, disposal('75'), 'AVERAGE_COST', policy)
    expect(total(first.consumptions.map((entry) => entry.cost_basis))).toBe('200')
    expect(total(first.remainder.map((entry) => entry.cost_basis))).toBe('200')
    const next = matchDisposals([...first.remainder, lot('c', '25', '100')], disposal('50'), 'AVERAGE_COST', policy)
    expect(total(next.consumptions.map((entry) => entry.cost_basis))).toBe('150')
    expect(total(next.remainder.map((entry) => entry.cost_basis))).toBe('150')
    expect(next.consumptions[0]?.basis_lot_ids).toEqual(['a', 'b', 'c'])
  })

  it('rounds pooled disposal once before distributing among consumed lots', () => {
    const result = matchDisposals([lot('a', '1', '0.01'), lot('b', '1', '0.02')], disposal('1.5'),
      'AVERAGE_COST', { basis_decimals: 2, rounding_mode: 'HALF_EVEN' })
    expect(total(result.consumptions.map((entry) => entry.cost_basis))).toBe('0.02')
    expect(total(result.remainder.map((entry) => entry.cost_basis))).toBe('0.01')
  })

  it.each(['FIFO', 'AVERAGE_COST', 'POOLING'] as const)('conserves recurring basis through full depletion: %s', (method) => {
    let remaining = [lot('a', '3', '1')]
    const consumed: string[] = []
    for (let index = 0; index < 3; index++) {
      const result = matchDisposals(remaining, disposal('1'), method, { basis_decimals: 2, rounding_mode: 'HALF_EVEN' })
      consumed.push(result.consumptions[0]!.cost_basis!)
      remaining = [...result.remainder]
    }
    expect(total(consumed)).toBe('1')
    expect(remaining[0]).toMatchObject({ quantity_remaining: '0', cost_basis: '0' })
  })

  it('preserves quantities below IEEE precision and supports configurable rounding', () => {
    const precise = [lot('a', '9007199254740993.000000000000000001', '2')]
    const result = matchDisposals(precise, disposal('0.000000000000000001'), 'FIFO', policy)
    expect(result.remainder[0]?.quantity_remaining).toBe('9007199254740993')
    const rounded = (rounding_mode: CalculationPolicy['rounding_mode']) => matchDisposals(
      [lot('a', '2', '0.01')], disposal('1'), 'FIFO', { basis_decimals: 2, rounding_mode }
    ).consumptions[0]?.cost_basis
    expect(rounded('HALF_EVEN')).toBe('0')
    expect(rounded('HALF_UP')).toBe('0.01')
  })
})

describe('honest gaps and input boundaries', () => {
  it('reports both missing basis and missing quantity without inventing zero', () => {
    const result = matchDisposals([lot('a', '1')], disposal('2'), 'FIFO', policy)
    expect(result.status).toBe('UNKNOWN')
    expect(result.gaps).toMatchObject([
      { quantity: '1', reason: 'missing_basis' }, { quantity: '1', reason: 'insufficient_lots' }
    ])
    expect(result.consumptions[0]).not.toHaveProperty('cost_basis')
  })

  it.each(['AVERAGE_COST', 'POOLING', 'HIFO'] as const)('%s cannot ignore an unknown pool member', (method) => {
    const result = matchDisposals([lot('a', '1', '2'), lot('b', '1')], disposal('1'), method, policy)
    expect(result.status).toBe('UNKNOWN')
    expect(result.gaps[0]?.reason).toBe('missing_basis')
    expect(result.consumptions.every((entry) => entry.cost_basis === undefined)).toBe(true)
    if (method === 'HIFO') expect(result.consumptions).toEqual([])
    else expect(result.remainder.every((entry) => entry.cost_basis === undefined)).toBe(true)
  })

  it.each(['FIFO', 'HIFO', 'AVERAGE_COST'] as const)('%s never combines currencies', (method) => {
    const result = matchDisposals([lot('a', '1', '2', { cost_basis_currency: 'USD' })], disposal('1'), method, policy)
    expect(result.status).toBe('UNKNOWN')
    expect(result.gaps[0]?.reason).toBe('currency_mismatch')
  })

  it('requires an explicit method and handles OTHER without mutation', () => {
    expect(() => matchDisposals(lots, disposal('1'), undefined as unknown as LotMethod, policy)).toThrow()
    const result = matchDisposals(lots, disposal('1'), 'OTHER', policy)
    expect(result.gaps[0]?.reason).toBe('unsupported_method')
    expect(result.remainder).toEqual(lots)
  })

  it('matches by owner, asset and actual UTC acquisition instant', () => {
    const records = [lot('a', '1', '1', { owner: 'company' }),
      lot('b', '1', '1', { asset: { chain: 'other', symbol: 'TOKEN' } }),
      lot('c', '1', '1', { acquired_at: instant('2022-01-01T00:00:00Z') }),
      lot('d', '1', '1', { acquired_at: '2021-03-01T01:00:00+01:00' as Lot['acquired_at'] })]
    const result = matchDisposals(records, disposal('2'), 'FIFO', policy)
    expect(result.consumptions.map((entry) => entry.lot_id)).toEqual(['d'])
    expect(result.gaps[0]?.quantity).toBe('1')
    expect(result.remainder.slice(0, 3)).toEqual(records.slice(0, 3))
  })

  it.each(['-1', 'NaN', 'Infinity', '1e-6', '0'])('rejects malformed disposal quantity %s', (quantity) => {
    expect(() => matchDisposals(lots, disposal(quantity), 'FIFO', policy)).toThrow()
  })

  it('rejects duplicate lots, invalid quantities, timezone-less input and missing rounding policy', () => {
    expect(() => matchDisposals([lots[0]!, lots[0]!], disposal('1'), 'FIFO', policy)).toThrow()
    expect(() => matchDisposals([lot('a', '1', '2', { quantity_remaining: '2' })], disposal('1'), 'FIFO', policy)).toThrow()
    expect(() => matchDisposals(lots, disposal('1', { occurred_at_utc: '2021-03-01T00:00:00' as Disposal['occurred_at_utc'] }), 'FIFO', policy)).toThrow()
    expect(() => matchDisposals(lots, disposal('1'), 'FIFO', undefined as unknown as CalculationPolicy)).toThrow()
  })
})

describe('confirmed wallet movements', () => {
  it('moves a whole lot with its identity and history intact, without consumption', () => {
    const holdings = [{ wallet_id: 'wallet-a', lot: lots[0]! }]
    const result = moveLots(holdings, transfer('100'), policy)
    expect(result.status).toBe('KNOWN')
    expect(result.holdings).toEqual([{ wallet_id: 'wallet-b', lot: lots[0] }])
    expect(result.movements).toMatchObject([{ source_lot_id: 'a', destination_lot_id: 'a', quantity: '100' }])
    expect(result).not.toHaveProperty('consumptions')
    expect(holdings[0]?.wallet_id).toBe('wallet-a')
  })

  it('splits and later moves a partial lot while conserving basis, quantity and acquisition history', () => {
    const result = moveLots([{ wallet_id: 'wallet-a', lot: lots[0]! }], transfer('25'), policy)
    expect(result.holdings.map((entry) => entry.lot.quantity_remaining)).toEqual(['75', '25'])
    expect(result.holdings.map((entry) => entry.lot.cost_basis)).toEqual(['150', '50'])
    expect(result.holdings[1]?.lot).toMatchObject({ acquisition_event: 'acquire-a', acquired_at: early, holding_period_start: early, owner: 'owner-a' })
    const movedId = result.holdings[1]!.lot.lot_id
    const again = moveLots(result.holdings, transfer('25', {
      event_id: 'transfer-again', from: { wallet_id: 'wallet-b', owner: 'owner-a', confirmed: true },
      to: { wallet_id: 'wallet-c', owner: 'owner-a', confirmed: true }, selections: [{ lot_id: movedId, quantity: '25' }]
    }), policy)
    expect(again.holdings[1]?.wallet_id).toBe('wallet-c')
    expect(again.holdings[1]?.lot.lot_id).toBe(movedId)
    expect(total(again.holdings.map((entry) => entry.lot.cost_basis))).toBe('200')
  })

  it('preserves unknown basis during a confirmed factual movement', () => {
    const result = moveLots([{ wallet_id: 'wallet-a', lot: lot('a', '2') }], transfer('1'), policy)
    expect(result.status).toBe('KNOWN')
    expect(result.holdings.every((entry) => entry.lot.cost_basis === undefined && entry.lot.cost_basis_status === 'UNKNOWN')).toBe(true)
  })

  it.each([
    { wallet_id: 'wallet-b', owner: 'owner-a', confirmed: false },
    { wallet_id: 'wallet-b', owner: 'company', confirmed: true }
  ])('refuses unconfirmed or different ownership atomically', (to) => {
    const holdings = [{ wallet_id: 'wallet-a', lot: lots[0]! }]
    const result = moveLots(holdings, transfer('1', { to }), policy)
    expect(result.gaps[0]?.reason).toBe('ownership_unconfirmed')
    expect(result.holdings).toEqual(holdings)
    expect(result.movements).toEqual([])
  })

  it('does not partially apply a movement when any selected lot is unavailable', () => {
    const holdings = [{ wallet_id: 'wallet-a', lot: lots[0]! }]
    const result = moveLots(holdings, transfer('1', {
      selections: [{ lot_id: 'a', quantity: '1' }, { lot_id: 'missing', quantity: '1' }]
    }), policy)
    expect(result.status).toBe('UNKNOWN')
    expect(result.holdings).toEqual(holdings)
    expect(result.movements).toEqual([])
  })
})

describe('opening lots consumes the valuation package', () => {
  const acquisition = { lot_id: 'new-lot', event_id: 'receipt', asset, quantity: '2', occurred_at_utc: early }
  it('retains successful valuation provenance and does not assume a holding period start', async () => {
    const query = { asset, timestamp: early, targetCurrency: 'EUR' }
    const provider = new MockPriceProvider('fixture', [{ query, response: {
      ...query, unit_price: amount('3'), method: 'exact_timestamp', provider_market: 'TOKEN/EUR',
      time_resolution: 'PT1S', raw_source_reference: 'synthetic://quote', confidence: 1
    } }])
    const value = await new ValuationEngine([provider], { now: () => early }).value({ ...query, quantity: amount('2') })
    if (!('valuation_id' in value)) throw new Error('Expected fixture valuation')
    const result = openLots([{ ...acquisition, valuation_ref: value.valuation_id }], [value], 'owner-a')
    expect(result[0]).toMatchObject({ cost_basis: '6', cost_basis_currency: 'EUR', valuation_ref: value.valuation_id, acquisition_event: 'receipt' })
    expect(result[0]).not.toHaveProperty('holding_period_start')
    const unrelated = openLots([{ ...acquisition, quantity: '3', valuation_ref: value.valuation_id }], [value], 'owner-a')
    expect(unrelated[0]).not.toHaveProperty('cost_basis')
    expect(unrelated[0]?.cost_basis_status).toBe('UNKNOWN')
  })

  it('opens unknown lots when valuation is absent or a miss', async () => {
    const query = { asset, timestamp: early, targetCurrency: 'EUR', quantity: amount('2') }
    const miss = await new ValuationEngine([new MockPriceProvider('fixture', [])], { now: () => early }).value(query)
    if (!('valuation_miss_id' in miss)) throw new Error('Expected fixture miss')
    for (const valuations of [[], [miss]]) {
      const result = openLots([{ ...acquisition, valuation_ref: miss.valuation_miss_id }], valuations, 'owner-a')
      expect(result[0]).not.toHaveProperty('cost_basis')
      expect(result[0]?.cost_basis_status).toBe('UNKNOWN')
    }
  })
})
