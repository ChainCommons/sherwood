import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadSchemas } from '../../validate/src/schema-registry.ts'
import { normalize } from '../src/index.ts'
import type { Annotation, MarketplaceDecode, NormalizeContext, TechnicalTx, WalletOwnership } from '../src/index.ts'

const fixture = <T>(name: string): T => JSON.parse(readFileSync(resolve('tests/contracts', name + '.json'), 'utf8')) as T
const tx = fixture<TechnicalTx>('technical-transaction')
const overlay = fixture<MarketplaceDecode>('marketplace-overlay')
const seller = tx.token_transfers![0]!.from
const buyer = tx.token_transfers![0]!.to
const creator = overlay.components![2]!.beneficiary!
const wallet = (address: string, owner = 'seller'): WalletOwnership => ({
  wallet_id: 'wallet-' + owner, address, chain: tx.chain, ownership_class: 'USER_PERSONAL',
  owner_participant_id: owner, confirmation: 'USER_CONFIRMED', schema_version: '0.1.0',
})
const context = (participant = 'seller'): NormalizeContext => ({
  participant, ownership: [wallet(seller), wallet(buyer, 'buyer'), wallet(creator, 'creator')],
  marketplaceDecodes: [overlay], userTags: [], nativeAssets: { tezos: { chain: 'tezos', symbol: 'XTZ' } },
})
const transfer = (changes: Partial<TechnicalTx> = {}): TechnicalTx => ({
  technical_tx_id: 'synthetic-transfer', chain: 'tezos', block_time_utc: tx.block_time_utc,
  status: 'applied', source_evidence: ['synthetic-evidence'], schema_version: '0.1.0',
  native_transfers: [{ from: seller, to: 'second-wallet', amount: '1.000001' }], ...changes,
})
const hint = (type: Annotation['asserted_event_type'], target = 'synthetic-transfer'): Annotation => ({
  annotation_id: 'synthetic-annotation', target_type: 'technical_tx', target_id: target,
  asserted_event_type: type!, status: 'USER_CONFIRMED', created_at: tx.block_time_utc, schema_version: '0.1.0',
})
const registry = loadSchemas(resolve('.'))
function validate(result: ReturnType<typeof normalize>): void {
  for (const [schema, records] of [['leg', result.legs], ['semantic-event', result.events]] as const) {
    const check = registry.byPath.get(`schemas/event/${schema}.schema.json`)!
    for (const record of records) expect(check(record), JSON.stringify(check.errors)).toBe(true)
  }
}

describe('economic normalization', () => {
  it('reconstructs the contract split exactly, with no duplicate net payment or fee', () => {
    const result = normalize([tx], context())
    expect(result.unresolved).toEqual([])
    expect(result.events).toHaveLength(1)
    expect(result.events[0]).toMatchObject({ event_type: 'NFT_SALE', gross_amount: '100', fees: '2.5', royalties: '10', net_amount: '87.5' })
    const golden = fixture<{ quantity: string; economic_character: string; direction: string; from_party: string; to_party: string }[]>('legs')
    expect(result.legs.map(({ quantity, economic_character, direction, from_party, to_party }) => ({ quantity, economic_character, direction, from_party, to_party }))).toEqual(
      golden.map(({ quantity, economic_character, direction, from_party, to_party }) => ({ quantity, economic_character, direction, from_party, to_party })))
    expect(result.legs.every(l => result.events[0]!.legs.includes(l.leg_id) && l.event_id === result.events[0]!.event_id)).toBe(true)
    validate(result)
  })

  it('retains chain and overlay evidence and leaves all inputs unchanged (AC-009)', () => {
    const ctx = context()
    ctx.marketplaceDecodes = [{ ...overlay, source_evidence: ['overlay-evidence'] }]
    ctx.userTags = [{ ...hint('NFT_SALE', tx.technical_tx_id), status: 'INFERRED', note: 'candidate only' }]
    const before = JSON.stringify({ tx, ctx })
    const result = normalize([tx], ctx)
    expect(result.events[0]!.source_evidence).toEqual([...tx.source_evidence, 'overlay-evidence'].sort())
    expect(result.events[0]!.user_annotations).toEqual(['synthetic-annotation'])
    result.legs[0]!.asset.symbol = 'CHANGED'
    expect(JSON.stringify({ tx, ctx })).toBe(before)
  })

  it('replays deterministically and deduplicates identical technical records and overlays', () => {
    const ctx = context()
    ctx.marketplaceDecodes = [overlay, structuredClone(overlay)]
    expect(normalize([tx, structuredClone(tx)], ctx)).toEqual(normalize([tx], context()))
    expect(normalize([tx], context())).toEqual(normalize([tx], context()))
  })

  it('does not choose between conflicting transaction records', () => {
    const result = normalize([tx, { ...tx, status: 'failed' }], context())
    expect(result.events).toEqual([])
    expect(result.unresolved[0]!.reason).toBe('CONFLICTING_TRANSACTIONS')
  })

  it.each(['failed', 'backtracked', 'skipped'] as const)('ignores %s operations including their overlays and fees', status => {
    expect(normalize([{ ...tx, status }], context())).toEqual({ legs: [], events: [], unresolved: [] })
  })

  it('creates a buyer purchase and a distinct network fee without charging the marketplace fee twice', () => {
    const result = normalize([tx], context('buyer'))
    expect(result.events.map(e => e.event_type)).toEqual(['NFT_PURCHASE', 'ASSET_TRANSFER'])
    expect(result.legs.filter(l => l.economic_character === 'fee').map(l => l.quantity)).toEqual(['2.5', '0.000512'])
    expect(result.legs.filter(l => l.direction === 'inbound').map(l => l.quantity)).toEqual(['1'])
    validate(result)
  })

  it('recognizes a royalty recipient without labeling it a primary sale', () => {
    const result = normalize([tx], context('creator'))
    expect(result.events.map(e => e.event_type)).toEqual(['NFT_ROYALTY'])
    expect(result.legs[0]).toMatchObject({ quantity: '10', economic_character: 'royalty', direction: 'inbound' })
  })

  it('keeps marketplace fee character for a confirmed marketplace recipient', () => {
    const ctx = context('marketplace')
    ctx.ownership = [...ctx.ownership, wallet(overlay.components![1]!.beneficiary!, 'marketplace')]
    const result = normalize([tx], ctx)
    expect(result.legs).toHaveLength(1)
    expect(result.legs[0]).toMatchObject({ economic_character: 'fee', quantity: '2.5', direction: 'inbound' })
  })

  it('does not accept a sale with a zero token delivery', () => {
    const zero = structuredClone(tx)
    zero.token_transfers![0]!.amount = '0'
    const result = normalize([zero], context())
    expect(result.events.some(e => e.event_type.includes('SALE'))).toBe(false)
    expect(result.unresolved[0]!.reason).toBe('OVERLAY_MISMATCH')
  })

  it('rejects contradictory primary and secondary sale hints', () => {
    const ctx = context()
    ctx.marketplaceDecodes = [{ ...overlay, suggested_event_type: 'ART_PRIMARY_SALE', sale_kind: 'secondary' }]
    expect(normalize([tx], ctx).unresolved[0]!.reason).toBe('OVERLAY_MISMATCH')
  })

  it('one operation produces distinct token and native movement events without inferring a sale', () => {
    const ctx = context()
    ctx.marketplaceDecodes = []
    const result = normalize([{ ...tx, entrypoint: 'transfer' }], ctx)
    expect(result.events.map(e => e.event_type)).toEqual(['ASSET_TRANSFER', 'ASSET_TRANSFER'])
    expect(new Set(result.events.map(e => e.event_id)).size).toBe(2)
    expect(result.legs.map(l => l.quantity)).toEqual(['1', '87.5'])
  })

  it('preserves an 18-decimal quantity beyond floating-point integer precision', () => {
    const quantity = '9007199254740993.123456789012345678'
    const result = normalize([transfer({ native_transfers: [{ from: seller, to: buyer, amount: quantity }] })], context())
    expect(result.legs[0]!.quantity).toBe(quantity)
  })

  it('preserves explicit primary sale semantics without inferring capacity', () => {
    const ctx = context()
    ctx.marketplaceDecodes = [{ ...overlay, suggested_event_type: 'ART_PRIMARY_SALE', sale_kind: 'primary' }]
    expect(normalize([tx], ctx).events[0]!.event_type).toBe('ART_PRIMARY_SALE')
    expect(normalize([tx], ctx).events[0]).not.toHaveProperty('capacity')
  })

  it.each(['mismatch', 'duplicate-component', 'conflict', 'wrong-asset', 'wrong-party'])(
    'retains observed movements and reports an unresolved %s overlay', variant => {
      const ctx = context()
      const bad = structuredClone(overlay)
      if (variant === 'mismatch') bad.components![0]!.amount = '101'
      if (variant === 'duplicate-component') bad.components!.push(structuredClone(bad.components![1]!))
      if (variant === 'wrong-asset') bad.components![1]!.asset!.symbol = 'OTHER'
      if (variant === 'wrong-party') bad.components![0]!.beneficiary = buyer
      ctx.marketplaceDecodes = variant === 'conflict' ? [overlay, { ...overlay, overlay_id: 'other-overlay' }] : [bad]
      const result = normalize([tx], ctx)
      expect(result.events.every(e => e.event_type === 'UNKNOWN')).toBe(true)
      expect(result.legs.map(l => l.quantity)).toEqual(['1', '87.5'])
      expect(result.unresolved.length).toBeGreaterThan(0)
      validate(result)
    },
  )

  it('confirmed same-owner movement is a self-transfer (AC-004), even with a sale overlay', () => {
    const ctx = context()
    ctx.ownership = [wallet(seller), wallet(buyer)]
    const result = normalize([tx], ctx)
    expect(result.events.some(e => e.event_type === 'SELF_TRANSFER')).toBe(true)
    expect(result.events.some(e => e.event_type.includes('SALE'))).toBe(false)
  })

  it.each(['INFERRED', 'UNKNOWN'] as const)('does not infer ownership from %s mappings', confirmation => {
    const ctx = context()
    ctx.ownership = [wallet(seller), { ...wallet('second-wallet'), confirmation }]
    expect(normalize([transfer()], ctx).events[0]!.event_type).toBe('ASSET_TRANSFER')
  })

  it('keeps personal and company participants distinct and scopes addresses by chain', () => {
    const ctx = context()
    ctx.ownership = [wallet(seller), wallet('second-wallet', 'company'), { ...wallet('second-wallet'), chain: 'other-chain' }]
    expect(normalize([transfer()], ctx).events[0]!.event_type).toBe('ASSET_TRANSFER')
  })

  it('does not choose an owner from contradictory confirmations', () => {
    const ctx = context()
    ctx.ownership = [wallet(seller), wallet('second-wallet'), wallet('second-wallet', 'company')]
    const result = normalize([transfer()], ctx)
    expect(result.events[0]!.event_type).toBe('ASSET_TRANSFER')
    expect(result.unresolved[0]!.reason).toBe('CONFLICTING_OWNERSHIP')
  })

  it('a confirmed mint hint yields a mint without sale or income assumptions', () => {
    const mint = transfer({ native_transfers: [], entrypoint: 'mint', token_transfers: [{ contract: 'token-contract', token_id: '0', from: 'minter', to: seller, amount: '1' }] })
    const ctx = context()
    ctx.userTags = [hint('NFT_MINT')]
    const result = normalize([mint], ctx)
    expect(result.events[0]).toMatchObject({ event_type: 'NFT_MINT', status: 'USER_CONFIRMED' })
    expect(result.events[0]).not.toHaveProperty('gross_amount')
    validate(result)
  })

  it('a confirmed baking reward hint marks the reward while preserving a network fee as a separate event', () => {
    const reward = transfer({ native_transfers: [{ from: 'protocol', to: seller, amount: '0.123456' }], fees: [{ payer: seller, kind: 'network', amount: '0.000001' }] })
    const ctx = context()
    ctx.userTags = [hint('BAKING_REWARD')]
    const result = normalize([reward], ctx)
    expect(result.events.map(e => e.event_type)).toEqual(['BAKING_REWARD', 'ASSET_TRANSFER'])
    expect(result.legs.map(l => l.economic_character)).toEqual(['reward', 'fee'])
    validate(result)
  })

  it('keeps unsupported contract interactions unresolved, with no tax classification (AC-012)', () => {
    const ctx = context()
    ctx.userTags = [hint('ASSET_SALE')]
    const result = normalize([transfer({ entrypoint: 'mystery' })], ctx)
    expect(result.events[0]!.event_type).toBe('UNKNOWN')
    expect(result.legs[0]!.economic_character).toBe('unknown')
    expect(JSON.stringify(result)).not.toMatch(/TAXABLE|classification|cost_basis|valuation_ref":"/)
    expect(result.unresolved.map(u => u.reason)).toContain('UNSUPPORTED_HINT')
  })

  it('does not guess reward semantics from entrypoint names or unconfirmed hints', () => {
    const ctx = context()
    ctx.userTags = [{ ...hint('BAKING_REWARD'), status: 'INFERRED' }]
    const result = normalize([transfer({ entrypoint: 'baking_reward', native_transfers: [{ from: 'protocol', to: seller, amount: '1' }] })], ctx)
    expect(result.events[0]!.event_type).toBe('UNKNOWN')
  })

  it('reports opaque internal operations and does not invent a zero-quantity event', () => {
    const result = normalize([transfer({ native_transfers: [], entrypoint: 'mystery', internal_operations: [{ status: 'applied' }] })], context())
    expect(result.events).toEqual([])
    expect(result.unresolved.map(u => u.reason)).toEqual(['INTERNAL_OPERATIONS', 'UNKNOWN_INTERACTION'])
  })

  it('uses explicit native asset configuration on any chain', () => {
    const ctx = context()
    ctx.nativeAssets = { synthetic: { chain: 'synthetic', symbol: 'COIN' } }
    ctx.ownership = [{ ...wallet(seller), chain: 'synthetic' }]
    const result = normalize([transfer({ chain: 'synthetic' })], ctx)
    expect(result.legs[0]!.asset).toEqual({ chain: 'synthetic', symbol: 'COIN' })
    ctx.nativeAssets = {}
    expect(normalize([transfer({ chain: 'synthetic' })], ctx).unresolved[0]!.reason).toBe('MISSING_NATIVE_ASSET')
  })

  it.each(['-1', 'NaN', 'Infinity'])('rejects invalid amount %s without inventing economics', amount => {
    const result = normalize([transfer({ native_transfers: [{ from: seller, to: buyer, amount }] })], context())
    expect(result.events).toEqual([])
    expect(result.unresolved[0]!.reason).toBe('INVALID_AMOUNT')
  })
})
