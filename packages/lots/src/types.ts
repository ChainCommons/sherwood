import type { FactStatus, Instant, LotMethod, RoundingMode } from '../../core/src/index.ts'
import type { AssetRef } from '../../valuation/src/index.ts'

/** Persistable counterpart of the existing lot schema. */
export interface Lot {
  readonly lot_id: string
  readonly asset: AssetRef
  readonly quantity_original: string
  readonly quantity_remaining: string
  readonly acquired_at: Instant
  readonly acquisition_event?: string
  /** Total basis of quantity_remaining, not a unit price. */
  readonly cost_basis?: string
  readonly cost_basis_currency?: string
  readonly cost_basis_status?: FactStatus
  readonly valuation_ref?: string | null
  readonly holding_period_start?: Instant
  readonly owner: string
  readonly method_context?: LotMethod
  readonly schema_version: string
}

/** Caller resolves event legs and selects acquisitions; no receipt classification here. */
export interface Acquisition {
  readonly lot_id: string
  readonly event_id: string
  readonly asset: AssetRef
  readonly quantity: string
  readonly occurred_at_utc: Instant
  readonly valuation_ref?: string
  readonly holding_period_start?: Instant
}

export interface Disposal {
  readonly event_id: string
  readonly asset: AssetRef
  readonly owner: string
  readonly quantity: string
  readonly occurred_at_utc: Instant
  readonly cost_basis_currency: string
}

export interface CalculationPolicy {
  readonly basis_decimals: number
  readonly rounding_mode: RoundingMode
}

export interface QuantityGap {
  readonly status: 'UNKNOWN'
  readonly event_id: string
  readonly quantity: string
  readonly reason: 'insufficient_lots' | 'missing_basis' | 'currency_mismatch' |
    'unsupported_method' | 'ownership_unconfirmed' | 'missing_selection'
  readonly lot_id?: string
}

export interface LotConsumption {
  readonly lot_id: string
  readonly event_id: string
  readonly quantity: string
  readonly method: LotMethod
  readonly status: 'KNOWN' | 'UNKNOWN'
  readonly cost_basis?: string
  readonly cost_basis_currency: string
  /** Pool methods depend on all eligible lots, even if quantity is drawn from one. */
  readonly basis_lot_ids: readonly string[]
}

export interface MatchResult {
  readonly status: 'KNOWN' | 'UNKNOWN'
  readonly method: LotMethod
  readonly calculation_policy: CalculationPolicy
  readonly consumptions: readonly LotConsumption[]
  readonly remainder: readonly Lot[]
  readonly gaps: readonly QuantityGap[]
}

/** Wallet location is separate from the schema-compatible lot record. */
export interface Holding {
  readonly wallet_id: string
  readonly lot: Lot
}

export interface SelfTransfer {
  readonly event_id: string
  readonly occurred_at_utc: Instant
  readonly asset: AssetRef
  readonly from: { readonly wallet_id: string; readonly owner: string; readonly confirmed: boolean }
  readonly to: { readonly wallet_id: string; readonly owner: string; readonly confirmed: boolean }
  readonly selections: readonly { readonly lot_id: string; readonly quantity: string }[]
}

export interface LotMovement {
  readonly event_id: string
  readonly source_lot_id: string
  readonly destination_lot_id: string
  readonly from_wallet: string
  readonly to_wallet: string
  readonly quantity: string
}

export interface TransferResult {
  readonly status: 'KNOWN' | 'UNKNOWN'
  readonly holdings: readonly Holding[]
  readonly movements: readonly LotMovement[]
  readonly gaps: readonly QuantityGap[]
  readonly calculation_policy: CalculationPolicy
}
