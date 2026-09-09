import { amount, canonicalJson, eq, sha256, sub, sum, toJSON } from '../../core/src/index.ts'
import type { EconomicCharacter, JsonValue, SemanticEventType } from '../../core/src/index.ts'
import { confirmedOwnership, isConfirmedSelfTransfer } from './ownership.ts'
import type {
  AssetRef, Leg, MarketplaceDecode, NormalizeContext, NormalizeResult,
  SemanticEvent, TechnicalTx, Transfer, Unresolved,
} from './types.ts'

const canonical = (value: unknown): string => canonicalJson(JSON.parse(JSON.stringify(value)) as JsonValue)
const unique = (values: readonly string[]): string[] => [...new Set(values)].sort()
const id = (...parts: string[]): string => 'event-' + sha256(JSON.stringify(parts)).slice(7)
const positive = (value: string): boolean => {
  try { return /^\d+(?:\.\d+)?$/.test(value) && amount(value).gte(0) } catch { return false }
}
const sameAsset = (a: AssetRef, b: AssetRef): boolean =>
  a.chain === b.chain && a.contract === b.contract && a.token_id === b.token_id && a.symbol === b.symbol

interface Movement extends Transfer { asset: AssetRef; key: string }
interface Sale {
  overlay: MarketplaceDecode
  token: Movement
  gross: string
  fees: string
  royalties: string
  net: string
  asset: AssetRef
  payments: { movement: Movement; character: EconomicCharacter }[]
}

/** Only a fully reconciled, single-token sale may replace its observed payment split. */
function reconcile(tx: TechnicalTx, overlay: MarketplaceDecode, movements: Movement[]): Sale | undefined {
  if (!['NFT_SALE', 'ART_PRIMARY_SALE', 'ART_SECONDARY_SALE'].includes(overlay.suggested_event_type ?? '')) return
  const tokens = movements.filter(m => m.key.startsWith('token-'))
  if (tokens.length !== 1) return
  const token = tokens[0]!
  if (amount(token.amount).isZero()) return
  if ((overlay.suggested_event_type === 'ART_PRIMARY_SALE' && overlay.sale_kind === 'secondary') ||
      (overlay.suggested_event_type === 'ART_SECONDARY_SALE' && overlay.sale_kind === 'primary')) return
  const components = overlay.components ?? []
  const grossComponents = components.filter(c => c.role === 'gross_sale_price' && c.economic_character === 'consideration')
  if (grossComponents.length !== 1) return
  const gross = grossComponents[0]!
  if (!gross.asset || gross.asset.chain !== tx.chain || gross.beneficiary !== token.from || !positive(gross.amount)) return
  if (components.some(c => !c.asset || !sameAsset(c.asset, gross.asset!) || !positive(c.amount) || !c.beneficiary)) return
  const deductions = components.filter(c => c !== gross)
  if (deductions.some(c => !['fee', 'royalty'].includes(c.economic_character))) return
  // Repeated components are ambiguous, never silently charged twice.
  if (new Set(components.map(canonical)).size !== components.length) return
  const fees = toJSON(sum(deductions.filter(c => c.economic_character === 'fee').map(c => amount(c.amount))))
  const royalties = toJSON(sum(deductions.filter(c => c.economic_character === 'royalty').map(c => amount(c.amount))))
  const net = toJSON(sub(sub(amount(gross.amount), amount(fees)), amount(royalties)))
  if (!positive(net) || amount(gross.amount).isZero()) return
  const expected = [
    { beneficiary: token.from, amount: net, economic_character: 'consideration' as const },
    ...deductions,
  ]
  const used = new Set<string>()
  const payments: Sale['payments'] = []
  for (const component of expected) {
    if (amount(component.amount).isZero()) continue
    const matches = movements.filter(m => !used.has(m.key) && m !== token &&
      sameAsset(m.asset, gross.asset!) && m.from === token.to && m.to === component.beneficiary && eq(amount(m.amount), amount(component.amount)))
    if (matches.length !== 1) return
    const movement = matches[0]!
    used.add(movement.key)
    payments.push({ movement, character: component.economic_character })
  }
  return { overlay, token, gross: toJSON(amount(gross.amount)), fees, royalties, net, asset: gross.asset, payments }
}

/** Pure, local normalization. Inputs must already satisfy the published JSON schemas. */
export function normalize(technicalTxs: readonly TechnicalTx[], ctx: NormalizeContext): NormalizeResult {
  const result: NormalizeResult = { legs: [], events: [], unresolved: [] }
  const owns = (tx: TechnicalTx, address: string): boolean =>
    confirmedOwnership(tx.chain, address, ctx.ownership).owner === ctx.participant
  const self = (tx: TechnicalTx, m: Movement): boolean =>
    isConfirmedSelfTransfer(tx.chain, m.from, m.to, ctx.ownership)
  const grouped = new Map<string, TechnicalTx[]>()
  for (const tx of technicalTxs) grouped.set(tx.technical_tx_id, [...(grouped.get(tx.technical_tx_id) ?? []), tx])
  for (const [txId, copies] of [...grouped].sort(([a], [b]) => a.localeCompare(b))) {
    const tx = copies[0]!
    const unresolved = (reason: Unresolved['reason'], detail: string, evidence: readonly string[] = []): void => {
      result.unresolved.push({ technical_tx_id: txId, reason, detail, source_evidence: unique([...tx.source_evidence, ...evidence]) })
    }
    if (new Set(copies.map(canonical)).size > 1) {
      unresolved('CONFLICTING_TRANSACTIONS', 'The same technical transaction ID has different records.', copies.flatMap(t => t.source_evidence))
      continue
    }
    if (tx.status !== 'applied') continue
    const native = ctx.nativeAssets[tx.chain]
    const movements: Movement[] = (tx.token_transfers ?? []).map((m, i) => ({
      ...m, key: `token-${i}`, asset: { chain: tx.chain, contract: m.contract, ...(m.token_id === undefined ? {} : { token_id: m.token_id }) },
    }))
    if (native && native.chain === tx.chain && !native.contract && !native.token_id) {
      movements.push(...(tx.native_transfers ?? []).map((m, i) => ({ ...m, key: `native-${i}`, asset: native })))
    } else if (tx.native_transfers?.length || tx.fees?.length) {
      unresolved('MISSING_NATIVE_ASSET', 'Supply the native asset for this chain in nativeAssets.')
    }
    if (movements.some(m => !positive(m.amount)) || (tx.fees ?? []).some(f => !positive(f.amount))) {
      unresolved('INVALID_AMOUNT', 'Amounts must be finite, nonnegative decimal strings.')
      continue
    }
    if (tx.internal_operations?.length) unresolved('INTERNAL_OPERATIONS', 'Opaque internal operations are retained as evidence; adapters must flatten applied asset movements.')
    for (const address of unique(movements.flatMap(m => [m.from, m.to]))) {
      if (confirmedOwnership(tx.chain, address, ctx.ownership).conflicting) unresolved('CONFLICTING_OWNERSHIP', `Conflicting confirmed owners for ${address}.`)
    }
    const annotations = ctx.userTags.filter(a =>
      (a.target_type === 'technical_tx' && a.target_id === txId) ||
      (a.target_type === 'evidence' && tx.source_evidence.includes(a.target_id)))
    const confirmedHints = unique(annotations.filter(a => a.status === 'USER_CONFIRMED' && a.asserted_event_type).map(a => a.asserted_event_type!))
    const hint = confirmedHints.length === 1 ? confirmedHints[0] : undefined
    const supportedHints = ['NFT_MINT', 'BAKING_REWARD', 'STAKING_REWARD', 'VALIDATOR_REWARD', 'DELEGATION_REWARD']
    if (confirmedHints.length > 1 || (hint && !supportedHints.includes(hint))) unresolved('UNSUPPORTED_HINT', 'Only unambiguous confirmed mint/reward assertions are supported; other tags remain annotations.')

    const emit = (key: string, type: SemanticEventType, drafts: Omit<Leg, 'leg_id' | 'event_id' | 'timestamp' | 'valuation_ref'>[], extra: Partial<SemanticEvent> = {}): void => {
      if (!drafts.length) return
      const eventId = id(ctx.participant, txId, key)
      const legs = drafts.map((draft, i): Leg => ({
        ...structuredClone(draft), event_id: eventId, leg_id: id(eventId, String(i)), timestamp: tx.block_time_utc, valuation_ref: null,
      }))
      result.legs.push(...legs)
      result.events.push({
        event_id: eventId, event_type: type, occurred_at_utc: tx.block_time_utc,
        participant: ctx.participant,
        assets_given: legs.filter(l => l.direction === 'outbound').map(l => structuredClone(l.asset)),
        assets_received: legs.filter(l => l.direction === 'inbound').map(l => structuredClone(l.asset)),
        source_evidence: unique(legs.flatMap(l => l.source_evidence)), user_annotations: annotations.map(a => a.annotation_id).sort(),
        status: type === 'UNKNOWN' ? 'UNKNOWN' : 'INFERRED',
        // Stable derivation timestamp; no wall clock is consulted during replay.
        created_at: tx.block_time_utc, legs: legs.map(l => l.leg_id), schema_version: '0.1.0', ...extra,
      })
    }
    const draft = (m: Movement, character: EconomicCharacter, evidence = tx.source_evidence) => ({
      from_party: m.from, to_party: m.to, asset: m.asset, quantity: toJSON(amount(m.amount)),
      direction: (owns(tx, m.to) && !owns(tx, m.from) ? 'inbound' : 'outbound') as Leg['direction'],
      economic_character: character, source_evidence: unique(evidence), status: 'OBSERVED' as const,
    })
    const overlays = [...new Map(ctx.marketplaceDecodes.filter(o => o.technical_tx_id === txId).map(o => [canonical(o), o])).values()]
    let sale: Sale | undefined
    if (overlays.length > 1) unresolved('CONFLICTING_OVERLAYS', 'Multiple distinct overlays cannot be reconciled automatically.', overlays.flatMap(o => o.source_evidence))
    else if (overlays[0]) {
      sale = reconcile(tx, overlays[0], movements)
      if (!sale) unresolved('OVERLAY_MISMATCH', 'Overlay does not reconcile to a supported single-token sale and its payment movements.', overlays[0].source_evidence)
    }
    const consumed = new Set<string>()
    if (sale && !self(tx, sale.token)) {
      const evidence = unique([...tx.source_evidence, ...sale.overlay.source_evidence])
      if (owns(tx, sale.token.from)) {
        const gross = draft({ ...sale.token, from: sale.token.to, to: sale.token.from, amount: sale.gross, asset: sale.asset }, 'consideration', evidence)
        const deductions = sale.payments.filter(p => p.character !== 'consideration').map(p => ({
          ...draft({ ...p.movement, from: sale!.token.from }, p.character, evidence), status: 'INFERRED' as const,
        }))
        emit('sale', sale.overlay.suggested_event_type!, [
          { ...gross, status: 'INFERRED' }, ...deductions, draft(sale.token, 'transfer', evidence),
        ], {
          gross_amount: sale.gross, fees: sale.fees, royalties: sale.royalties, net_amount: sale.net,
          ...(sale.asset.symbol ? { amount_currency: sale.asset.symbol } : {}),
        })
        consumed.add(sale.token.key)
        sale.payments.forEach(p => consumed.add(p.movement.key))
      } else if (owns(tx, sale.token.to)) {
        emit('purchase', 'NFT_PURCHASE', [draft(sale.token, 'transfer', evidence), ...sale.payments.map(p => draft(p.movement, p.character, evidence))], { gross_amount: sale.gross })
        consumed.add(sale.token.key)
        sale.payments.forEach(p => consumed.add(p.movement.key))
      } else {
        for (const p of sale.payments.filter(p => ['royalty', 'fee'].includes(p.character) && owns(tx, p.movement.to))) {
          emit(p.movement.key, p.character === 'royalty' ? 'NFT_ROYALTY' : 'ASSET_TRANSFER', [draft(p.movement, p.character, evidence)])
          consumed.add(p.movement.key)
        }
      }
    }
    for (const m of movements) {
      if (consumed.has(m.key) || amount(m.amount).isZero() || (!owns(tx, m.from) && !owns(tx, m.to))) continue
      let type: SemanticEventType = tx.entrypoint && tx.entrypoint !== 'transfer' ? 'UNKNOWN' : 'ASSET_TRANSFER'
      let character: EconomicCharacter = type === 'UNKNOWN' ? 'unknown' : 'transfer'
      let status: Leg['status'] = 'OBSERVED'
      if (self(tx, m)) { type = 'SELF_TRANSFER'; character = 'transfer' }
      else if (hint && supportedHints.includes(hint) && owns(tx, m.to) && !owns(tx, m.from) &&
        (hint === 'NFT_MINT' ? m.key.startsWith('token-') : m.key.startsWith('native-'))) {
        type = hint as SemanticEventType
        character = hint === 'NFT_MINT' ? 'transfer' : 'reward'
        status = 'USER_CONFIRMED'
      }
      if (type === 'UNKNOWN') unresolved('UNKNOWN_INTERACTION', `No supported interpretation for movement ${m.key}.`)
      emit(m.key, type, [{ ...draft(m, character), status }], status === 'USER_CONFIRMED' ? { status } : {})
    }
    if (!movements.length && tx.entrypoint) unresolved('UNKNOWN_INTERACTION', 'Contract interaction has no decoded asset movements.')
    // Network fees remain separate from marketplace fees and sale proceeds.
    if (native && native.chain === tx.chain && !native.contract && !native.token_id) {
      for (const [i, fee] of (tx.fees ?? []).entries()) {
        if (!fee.payer || !owns(tx, fee.payer) || amount(fee.amount).isZero()) continue
        emit(`network-fee-${i}`, 'ASSET_TRANSFER', [{
          from_party: fee.payer, asset: native, quantity: toJSON(amount(fee.amount)), direction: 'outbound',
          economic_character: 'fee', source_evidence: [...tx.source_evidence], status: 'OBSERVED',
        }])
      }
    }
  }
  return result
}
