import type {
  Amount, ContentHash, Instant, ValuationMethod, ValuationMissReason
} from '../../core/src/index.ts'

/** Matches common.schema.json's assetRef; no chain or legal assumptions. */
export type AssetRef = Readonly<{
  contract?: string
  token_id?: string
  symbol?: string
} & ({ asset_id: string; chain?: string } | { asset_id?: string; chain: string })>

export interface QuoteQuery {
  readonly asset: AssetRef
  readonly timestamp: Instant
  readonly targetCurrency: string
  readonly method: ValuationMethod
  /** Required for nearest_trade, to prevent unbounded stale-price substitution. */
  readonly maxDistanceMs?: number
}

export interface Quote extends QuoteQuery {
  readonly unitPrice: Amount
  readonly sourceTimestamp: Instant
  readonly providerMarket: string
  readonly timeResolution: string
  readonly rawSourceReference: string
  readonly rawPayloadHash?: ContentHash
  /** Data quality only. */
  readonly confidence: number
}

export interface Miss {
  readonly reason: ValuationMissReason
  readonly detail?: string
}

export interface PriceProvider {
  readonly id: string
  quote(query: QuoteQuery): Promise<Quote | Miss>
}

export interface ValueInput {
  readonly asset: AssetRef
  readonly quantity: Amount
  readonly timestamp: Instant
  readonly targetCurrency: string
  readonly method?: ValuationMethod
  /** Ordered fallback policy; defaults to the engine's registration order. */
  readonly providers?: readonly string[]
  readonly maxDistanceMs?: number
}

export interface Alternative {
  readonly provider: string
  readonly provider_market: string
  readonly unit_price: string
  readonly method: ValuationMethod
  readonly confidence: number
}

/** Serializable record conforming to valuation.schema.json. */
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
  /** Relative range (max - min) / min, not a percentage. */
  readonly spread?: string
  readonly alternatives: readonly Alternative[]
  readonly schema_version: string
}

/** Serializable record conforming to valuation-miss.schema.json. */
export interface ValuationMiss {
  readonly valuation_miss_id: string
  readonly asset: AssetRef
  readonly timestamp: Instant
  readonly target_currency: string
  readonly reason: ValuationMissReason
  readonly providers_tried: readonly string[]
  readonly detail: string
  readonly generated_at: Instant
}

export type Attempt =
  | { readonly provider: string; readonly status: 'QUOTED'; readonly quote: Quote }
  | { readonly provider: string; readonly status: 'MISSED'; readonly miss: Miss }

/** Status belongs to the result envelope, not the existing schema records. */
export type ValuationResult =
  | { readonly status: 'VALUED'; readonly valuation: Valuation; readonly attempts: readonly Attempt[] }
  | { readonly status: 'UNKNOWN'; readonly miss: ValuationMiss; readonly attempts: readonly Attempt[] }

export interface Comparison {
  readonly result: ValuationResult
  /** Null when fewer than two quotes, or a nonzero range has a zero denominator. */
  readonly spreadPercent: string | null
}
