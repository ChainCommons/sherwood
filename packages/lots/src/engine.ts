import {
  amount, canonicalJson, cmp, div, hashJson, instant, LOT_METHODS, mul, round, ROUNDING_MODES,
  sub, sum, toJSON, ZERO
} from '../../core/src/index.ts'
import type { Amount, Instant, LotMethod } from '../../core/src/index.ts'
import type { AssetRef, ValuationResult } from '../../valuation/src/index.ts'
import type {
  Acquisition, CalculationPolicy, Disposal, Holding, Lot, LotConsumption, LotMovement,
  MatchResult, QuantityGap, SelfTransfer, TransferResult
} from './types.ts'

function decimal(value: string, positive = false): Amount {
  if (typeof value !== 'string' || !/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) {
    throw new TypeError('Quantities and basis must be non-negative decimal strings')
  }
  const result = amount(value)
  if (positive && result.isZero()) throw new RangeError('Quantity must be positive')
  return result
}

function utc(value: Instant): Instant {
  if (typeof value !== 'string' || !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    throw new TypeError('Timestamp requires an explicit timezone')
  }
  return instant(value)
}

function assetKey(asset: AssetRef): string {
  if (!asset || (!asset.asset_id && !asset.chain)) throw new TypeError('Asset identity required')
  // An explicit registry ID is canonical; chain references include token identity.
  return asset.asset_id ? canonicalJson({ asset_id: asset.asset_id }) : canonicalJson({
    chain: asset.chain!, contract: asset.contract ?? null,
    token_id: asset.token_id ?? null, symbol: asset.contract ? null : asset.symbol ?? null
  })
}

function policyCheck(policy: CalculationPolicy): void {
  if (!policy || !Number.isInteger(policy.basis_decimals) || policy.basis_decimals < 0 ||
      !ROUNDING_MODES.includes(policy.rounding_mode)) throw new TypeError('Explicit rounding policy required')
}

function basisShare(basis: Amount, quantity: Amount, total: Amount, policy: CalculationPolicy): Amount {
  if (cmp(quantity, total) === 0) return basis // Consume residual exactly on final depletion.
  const share = round(div(mul(basis, quantity), total), policy.basis_decimals, policy.rounding_mode)
  return cmp(share, basis) > 0 ? basis : share
}

function validateLots(lots: readonly Lot[]): void {
  const ids = new Set<string>()
  for (const lot of lots) {
    if (!lot.lot_id || ids.has(lot.lot_id)) throw new TypeError('Lot IDs must be unique and non-empty')
    ids.add(lot.lot_id)
    if (!lot.owner) throw new TypeError('Lot owner required')
    assetKey(lot.asset)
    utc(lot.acquired_at)
    if (lot.holding_period_start) utc(lot.holding_period_start)
    if (cmp(decimal(lot.quantity_remaining), decimal(lot.quantity_original, true)) > 0) {
      throw new RangeError('Remaining quantity exceeds original quantity')
    }
    if (lot.cost_basis !== undefined) decimal(lot.cost_basis)
  }
}

function hasBasis(lot: Lot): boolean {
  return lot.cost_basis !== undefined && lot.cost_basis_status !== 'UNKNOWN'
}

const orderId = (a: Lot, b: Lot): number => a.lot_id < b.lot_id ? -1 : a.lot_id > b.lot_id ? 1 : 0
const chronological = (a: Lot, b: Lot): number => {
  const left = utc(a.acquired_at), right = utc(b.acquired_at)
  return left < right ? -1 : left > right ? 1 : orderId(a, b)
}

/** Valuations are consumed by explicit reference; missing or unrelated records never imply zero basis. */
export function openLots(
  acquisitions: readonly Acquisition[], valuations: readonly ValuationResult[], owner: string
): Lot[] {
  if (!owner) throw new TypeError('Owner required')
  const byId = new Map<string, ValuationResult>()
  for (const value of valuations) {
    const id = 'valuation_id' in value ? value.valuation_id : value.valuation_miss_id
    if (byId.has(id)) throw new TypeError('Duplicate valuation ID')
    byId.set(id, value)
  }
  const lots = acquisitions.map((acquisition): Lot => {
    const quantity = decimal(acquisition.quantity, true)
    const acquired_at = utc(acquisition.occurred_at_utc)
    const value = acquisition.valuation_ref ? byId.get(acquisition.valuation_ref) : undefined
    const known = value && 'valuation_id' in value && assetKey(value.asset) === assetKey(acquisition.asset) &&
      utc(value.timestamp) === acquired_at && cmp(decimal(value.quantity), quantity) === 0
    return {
      lot_id: acquisition.lot_id, asset: { ...acquisition.asset }, owner,
      acquisition_event: acquisition.event_id, acquired_at,
      quantity_original: toJSON(quantity), quantity_remaining: toJSON(quantity),
      ...(acquisition.holding_period_start ? { holding_period_start: utc(acquisition.holding_period_start) } : {}),
      ...(known ? {
        cost_basis: toJSON(decimal(value.total_value)), cost_basis_currency: value.target_currency,
        cost_basis_status: 'INFERRED' as const, valuation_ref: value.valuation_id
      } : { cost_basis_status: 'UNKNOWN' as const, valuation_ref: acquisition.valuation_ref ?? null }),
      schema_version: '0.1.0'
    }
  })
  validateLots(lots)
  return lots
}

export function matchDisposals(
  lots: readonly Lot[], disposal: Disposal, method: LotMethod,
  policy: CalculationPolicy, specIds: readonly string[] = []
): MatchResult {
  policyCheck(policy)
  validateLots(lots)
  if (!LOT_METHODS.includes(method)) throw new TypeError('Explicit supported method name required')
  if (!disposal.owner || !disposal.event_id || !disposal.cost_basis_currency) throw new TypeError('Disposal identity required')
  const requested = decimal(disposal.quantity, true)
  const at = utc(disposal.occurred_at_utc)
  const key = assetKey(disposal.asset)
  const eligible = lots.filter((lot) => lot.owner === disposal.owner && assetKey(lot.asset) === key &&
    utc(lot.acquired_at) <= at && !decimal(lot.quantity_remaining).isZero()).sort(chronological)
  const remainder = lots.map((lot) => ({ ...lot, asset: { ...lot.asset } }))
  const gaps: QuantityGap[] = []
  const consumptions: LotConsumption[] = []
  const gap = (quantity: Amount, reason: QuantityGap['reason'], lot_id?: string) => {
    gaps.push({ status: 'UNKNOWN', event_id: disposal.event_id, quantity: toJSON(quantity), reason,
      ...(lot_id === undefined ? {} : { lot_id }) })
  }
  const finish = (): MatchResult => ({
    status: gaps.length ? 'UNKNOWN' : 'KNOWN', method, calculation_policy: { ...policy }, consumptions, remainder, gaps
  })
  if (method === 'OTHER') { gap(requested, 'unsupported_method'); return finish() }
  let selected = [...eligible]
  if (method === 'SPECIFIC_IDENTIFICATION') {
    if (new Set(specIds).size !== specIds.length) throw new TypeError('Duplicate specific lot ID')
    const selectedById = new Map(eligible.map((lot) => [lot.lot_id, lot]))
    if (!specIds.length || specIds.some((id) => !selectedById.has(id))) {
      gap(requested, 'missing_selection'); return finish()
    }
    selected = specIds.map((id) => selectedById.get(id)!)
  } else if (specIds.length) throw new TypeError('Specific IDs require SPECIFIC_IDENTIFICATION')
  if (method === 'LIFO') selected.sort((a, b) => -chronological(a, b))
  if (method === 'HIFO') {
    const unknown = eligible.find((lot) => !hasBasis(lot) || lot.cost_basis_currency !== disposal.cost_basis_currency)
    if (unknown) {
      gap(requested, hasBasis(unknown) ? 'currency_mismatch' : 'missing_basis', unknown.lot_id)
      return finish() // Unknown unit cost could rank first. Do not invent an ordering.
    }
    selected.sort((a, b) => cmp(
      mul(decimal(b.cost_basis!), decimal(a.quantity_remaining)),
      mul(decimal(a.cost_basis!), decimal(b.quantity_remaining))
    ) || chronological(a, b))
  }
  const pooled = method === 'AVERAGE_COST' || method === 'POOLING'
  const poolQuantity = sum(eligible.map((lot) => decimal(lot.quantity_remaining)))
  const poolKnown = eligible.every((lot) => hasBasis(lot) && lot.cost_basis_currency === disposal.cost_basis_currency)
  const poolBasis = poolKnown ? sum(eligible.map((lot) => decimal(lot.cost_basis!))) : ZERO
  const missingPoolReason = eligible.some((lot) => !hasBasis(lot)) ? 'missing_basis' : 'currency_mismatch'
  let needed = requested
  const poolTaken = cmp(requested, poolQuantity) < 0 ? requested : poolQuantity
  let consumptionQuantityLeft = poolTaken
  let consumptionBasisLeft = poolKnown && !poolQuantity.isZero()
    ? basisShare(poolBasis, poolTaken, poolQuantity, policy) : ZERO
  let basisLeft = sub(poolBasis, consumptionBasisLeft)
  let quantityLeft = sub(poolQuantity, poolTaken)
  const indices = new Map(remainder.map((lot, index) => [lot.lot_id, index]))
  for (const lot of selected) {
    if (needed.isZero()) break
    const available = decimal(lot.quantity_remaining)
    const taken = cmp(needed, available) < 0 ? needed : available
    const known = pooled ? poolKnown : hasBasis(lot) && lot.cost_basis_currency === disposal.cost_basis_currency
    const basis = known ? basisShare(pooled ? consumptionBasisLeft : decimal(lot.cost_basis!), taken,
      pooled ? consumptionQuantityLeft : available, policy) : undefined
    const consumption: LotConsumption = {
      lot_id: lot.lot_id, event_id: disposal.event_id, quantity: toJSON(taken), method,
      status: known ? 'KNOWN' : 'UNKNOWN', cost_basis_currency: disposal.cost_basis_currency,
      basis_lot_ids: pooled ? eligible.map((entry) => entry.lot_id) : [lot.lot_id],
      ...(basis === undefined ? {} : { cost_basis: toJSON(basis) })
    }
    consumptions.push(consumption)
    if (!known) gap(taken, pooled ? missingPoolReason : hasBasis(lot) ? 'currency_mismatch' : 'missing_basis', lot.lot_id)
    const index = indices.get(lot.lot_id)!
    const { cost_basis: _basis, ...base } = remainder[index]!
    remainder[index] = {
      ...base, quantity_remaining: toJSON(sub(available, taken)), method_context: method,
      ...(basis === undefined ? { cost_basis_status: 'UNKNOWN' } :
        { cost_basis: toJSON(pooled ? ZERO : sub(decimal(lot.cost_basis!), basis)) })
    }
    needed = sub(needed, taken)
    if (pooled) {
      consumptionQuantityLeft = sub(consumptionQuantityLeft, taken)
      if (basis !== undefined) consumptionBasisLeft = sub(consumptionBasisLeft, basis)
    }
  }
  if (pooled) {
    // Allocate residual pooled basis across remaining physical lots, conserving every decimal.
    for (const lot of eligible) {
      const index = indices.get(lot.lot_id)!
      const { cost_basis: _basis, ...base } = remainder[index]!
      const quantity = decimal(base.quantity_remaining)
      const basis = poolKnown ? quantity.isZero() ? ZERO : basisShare(basisLeft, quantity, quantityLeft, policy) : undefined
      remainder[index] = { ...base, method_context: method,
        ...(basis === undefined ? { cost_basis_status: 'UNKNOWN' } : {
          cost_basis: toJSON(basis), cost_basis_currency: disposal.cost_basis_currency,
          cost_basis_status: 'INFERRED'
        }) }
      quantityLeft = sub(quantityLeft, quantity)
      if (basis !== undefined) basisLeft = sub(basisLeft, basis)
    }
  }
  if (!needed.isZero()) gap(needed, 'insufficient_lots')
  return finish()
}

/** Atomic factual lot movement. Explicit lot selections avoid an implicit accounting method. */
export function moveLots(
  holdings: readonly Holding[], transfer: SelfTransfer, policy: CalculationPolicy
): TransferResult {
  policyCheck(policy)
  validateLots(holdings.map((holding) => holding.lot))
  const at = utc(transfer.occurred_at_utc)
  const key = assetKey(transfer.asset)
  if (!transfer.event_id || !transfer.from.wallet_id || !transfer.to.wallet_id ||
      transfer.from.wallet_id === transfer.to.wallet_id || !transfer.selections.length) {
    throw new TypeError('Distinct wallets, event ID and explicit lot selections required')
  }
  if (new Set(transfer.selections.map((selection) => selection.lot_id)).size !== transfer.selections.length) {
    throw new TypeError('Duplicate transfer selection')
  }
  const quantities = transfer.selections.map((selection) => decimal(selection.quantity, true))
  const gaps: QuantityGap[] = []
  if (transfer.from.confirmed !== true || transfer.to.confirmed !== true ||
      !transfer.from.owner || transfer.from.owner !== transfer.to.owner) {
    gaps.push({ status: 'UNKNOWN', event_id: transfer.event_id, quantity: toJSON(sum(quantities)), reason: 'ownership_unconfirmed' })
  }
  const byId = new Map(holdings.map((holding) => [holding.lot.lot_id, holding]))
  for (const selection of transfer.selections) {
    const holding = byId.get(selection.lot_id)
    if (!holding || holding.wallet_id !== transfer.from.wallet_id || holding.lot.owner !== transfer.from.owner ||
        assetKey(holding.lot.asset) !== key || utc(holding.lot.acquired_at) > at ||
        cmp(decimal(selection.quantity), decimal(holding.lot.quantity_remaining)) > 0) {
      gaps.push({ status: 'UNKNOWN', event_id: transfer.event_id, quantity: selection.quantity,
        reason: 'insufficient_lots', lot_id: selection.lot_id })
    }
  }
  if (gaps.length) return { status: 'UNKNOWN', holdings: [...holdings], movements: [], gaps, calculation_policy: { ...policy } }
  const result = holdings.map((holding) => ({ ...holding, lot: { ...holding.lot, asset: { ...holding.lot.asset } } }))
  const movements: LotMovement[] = []
  for (const selection of transfer.selections) {
    const index = result.findIndex((holding) => holding.lot.lot_id === selection.lot_id)
    const holding = result[index]!
    const lot = holding.lot
    const quantity = decimal(selection.quantity)
    const available = decimal(lot.quantity_remaining)
    let destinationId = lot.lot_id
    if (cmp(quantity, available) === 0) {
      result[index] = { wallet_id: transfer.to.wallet_id, lot }
    } else {
      destinationId = `lot-move-${hashJson({ source_lot_id: lot.lot_id, event_id: transfer.event_id }).slice(7)}`
      if (result.some((entry) => entry.lot.lot_id === destinationId)) throw new TypeError('Transfer lot ID collision')
      const basis = hasBasis(lot) ? basisShare(decimal(lot.cost_basis!), quantity, available, policy) : undefined
      const { cost_basis: _basis, ...base } = lot
      result[index] = { ...holding, lot: {
        ...base, quantity_original: toJSON(sub(decimal(lot.quantity_original), quantity)),
        quantity_remaining: toJSON(sub(available, quantity)),
        ...(basis === undefined ? { cost_basis_status: 'UNKNOWN' } : { cost_basis: toJSON(sub(decimal(lot.cost_basis!), basis)) })
      } }
      result.push({ wallet_id: transfer.to.wallet_id, lot: {
        ...base, lot_id: destinationId, quantity_original: toJSON(quantity), quantity_remaining: toJSON(quantity),
        ...(basis === undefined ? { cost_basis_status: 'UNKNOWN' } : { cost_basis: toJSON(basis) })
      } })
    }
    movements.push({ event_id: transfer.event_id, source_lot_id: lot.lot_id, destination_lot_id: destinationId,
      from_wallet: transfer.from.wallet_id, to_wallet: transfer.to.wallet_id, quantity: toJSON(quantity) })
  }
  return { status: 'KNOWN', holdings: result, movements, gaps, calculation_policy: { ...policy } }
}
