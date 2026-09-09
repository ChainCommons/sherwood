import type {
  ConfirmationStatus, EconomicCharacter, FactStatus, OwnershipClass,
  SemanticEventType, TechnicalTxStatus,
} from '../../core/src/index.ts'

/** Structural counterparts of the existing schemas; shared enums come from core. */
export interface AssetRef {
  chain: string
  asset_id?: string
  contract?: string
  token_id?: string
  symbol?: string
}
export interface Transfer { amount: string; from: string; to: string }
export interface TechnicalTx {
  technical_tx_id: string
  chain: string
  block_time_utc: string
  block_height?: number
  operation_hash?: string
  op_index?: number
  from_address?: string
  to_address?: string
  entrypoint?: string
  parameter?: unknown
  token_transfers?: (Transfer & { contract: string; token_id?: string })[]
  native_transfers?: Transfer[]
  internal_operations?: unknown[]
  fees?: { amount: string; kind: string; payer?: string }[]
  status: TechnicalTxStatus
  source_evidence: string[]
  schema_version: string
}
export interface MarketplaceComponent {
  economic_character: EconomicCharacter
  amount: string
  asset?: AssetRef
  beneficiary?: string
  role?: string
}
export interface MarketplaceDecode {
  overlay_id: string
  marketplace: string
  technical_tx_id: string
  suggested_event_type?: SemanticEventType
  sale_kind?: 'primary' | 'secondary' | 'unknown'
  components?: MarketplaceComponent[]
  confidence?: number
  status?: FactStatus
  source_evidence: string[]
  schema_version: string
}
export interface WalletOwnership {
  wallet_id: string
  address: string
  chain: string
  ownership_class: OwnershipClass
  owner_participant_id?: string | null
  related_entity_id?: string | null
  confirmation: ConfirmationStatus
  schema_version: string
}
export type WalletOwnershipMap = readonly WalletOwnership[]
export interface Annotation {
  annotation_id: string
  target_type: 'evidence' | 'technical_tx' | 'leg' | 'event' | 'asset' | 'wallet' | 'valuation' | 'lot'
  target_id: string
  asserted_event_type?: SemanticEventType
  asserted_economic_character?: EconomicCharacter
  tags?: string[]
  note?: string
  status?: FactStatus
  created_at: string
  schema_version: string
}
export interface Leg {
  leg_id: string
  event_id: string
  from_party?: string
  to_party?: string
  asset: AssetRef
  quantity: string
  direction: 'inbound' | 'outbound'
  economic_character: EconomicCharacter
  timestamp: string
  source_evidence: string[]
  valuation_ref: null
  status: FactStatus
}
export interface SemanticEvent {
  event_id: string
  event_type: SemanticEventType
  occurred_at_utc: string
  participant: string
  assets_given: AssetRef[]
  assets_received: AssetRef[]
  gross_amount?: string
  fees?: string
  royalties?: string
  net_amount?: string
  amount_currency?: string
  source_evidence: string[]
  user_annotations: string[]
  status: FactStatus
  created_at: string
  legs: string[]
  schema_version: string
}
export interface Unresolved {
  technical_tx_id: string
  reason: 'UNKNOWN_INTERACTION' | 'OVERLAY_MISMATCH' | 'CONFLICTING_OVERLAYS' |
    'CONFLICTING_TRANSACTIONS' | 'UNSUPPORTED_HINT' | 'INTERNAL_OPERATIONS' |
    'MISSING_NATIVE_ASSET' | 'INVALID_AMOUNT' | 'CONFLICTING_OWNERSHIP'
  detail: string
  source_evidence: string[]
}
export interface NormalizeContext {
  /** The participant whose economic view is being reconstructed. */
  participant: string
  ownership: WalletOwnershipMap
  marketplaceDecodes: readonly MarketplaceDecode[]
  userTags: readonly Annotation[]
  /** Explicit chain configuration; the engine never guesses a native symbol. */
  nativeAssets: Readonly<Record<string, AssetRef>>
}
export interface NormalizeResult { legs: Leg[]; events: SemanticEvent[]; unresolved: Unresolved[] }
