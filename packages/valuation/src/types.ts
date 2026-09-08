import type {
  Amount, ContentHash, Instant, JsonValue, ValuationMethod, ValuationMissReason
} from '../../core/src/index.ts'

/** Structural counterpart of common.schema.json's chain-neutral assetRef. */
export type AssetRef = Readonly<{
  asset_id?: string
  chain?: string
  contract?: string
  token_id?: string
  symbol?: string
}> & ({ readonly asset_id: string } | { readonly chain: string })

export interface QuoteQuery {
  readonly asset: AssetRef
  /** Operation instant, including for daily queries. Providers document their bucket. */
  readonly timestamp: Instant
  readonly targetCurrency: string
  readonly method?: ValuationMethod
}

/** Quotes echo the query identity so an unrelated price cannot value this request. */
export interface Quote extends QuoteQuery {
  readonly method: ValuationMethod
  readonly unit_price: Amount
  readonly provider_market: string
  readonly time_resolution: string
  readonly raw_source_reference: string
  readonly confidence: number
  /** Optional snapshot-ready source payload; amounts inside it must be strings. */
  readonly raw_payload?: JsonValue
}

export interface Miss {
  readonly reason: ValuationMissReason
  readonly detail?: string
}

export interface PriceProvider {
  readonly id: string
  quote(query: QuoteQuery): Promise<Quote | Miss>
}

export interface ValueInput extends QuoteQuery {
  readonly quantity: Amount
  /** Ordered fallback policy. Defaults to constructor order; never sorted by price. */
  readonly providers?: readonly string[]
}

/** Persistable records match the existing valuation schemas (decimal strings). */
export interface Valuation {
  readonly valuation_id: string
  readonly asset: AssetRef
  readonly quantity: string
  readonly timestamp: Instant
  readonly target_currency: string
  readonly unit_price: string
  readonly total_value: string
  readonly provider: string
  readonly provider_market: string
  readonly method: ValuationMethod
  readonly time_resolution: string
  readonly raw_source_reference: string
  readonly raw_payload_hash?: ContentHash
  readonly fallback_used: boolean
  readonly fallback_chain: readonly string[]
  readonly confidence: number
  readonly generated_at: Instant
  readonly engine_version: string
  readonly schema_version: string
  /** Percentage: (max - min) / min * 100. Omitted when undefined. */
  readonly spread?: string
  readonly alternatives?: readonly Alternative[]
}

export interface Alternative {
  readonly provider: string
  readonly provider_market: string
  readonly unit_price: string
  readonly method: ValuationMethod
  readonly confidence: number
}

/** A miss means UNKNOWN, never a zero-price valuation. */
export interface ValuationMiss {
  readonly valuation_miss_id: string
  readonly asset: AssetRef
  readonly timestamp: Instant
  readonly target_currency: string
  readonly reason: ValuationMissReason
  readonly providers_tried: readonly string[]
  /** JSON-encoded ProviderMiss[] retains every failed attempt and reason. */
  readonly detail: string
  readonly generated_at: Instant
}

export interface ProviderMiss extends Miss {
  readonly provider: string
}

export type ValuationResult = Valuation | ValuationMiss

export interface Comparison {
  readonly status: 'VALUED' | 'UNKNOWN'
  readonly selected: ValuationResult
  readonly valuations: readonly Valuation[]
  readonly misses: readonly ProviderMiss[]
  readonly spread?: string
}
