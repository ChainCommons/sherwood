import {
  amount, canonicalJson, cmp, Decimal, div, hashJson, instant, mul, sub, toJSON,
  VALUATION_METHODS, VALUATION_MISS_REASONS
} from '../../core/src/index.ts'
import type { Amount, Instant, JsonValue } from '../../core/src/index.ts'
import type {
  AssetRef, Comparison, PriceProvider, ProviderMiss, Quote, QuoteQuery,
  Valuation, ValuationMiss, ValuationResult, ValueInput
} from './types.ts'

export const ENGINE_VERSION = 'valuation@0.0.0'
export const SCHEMA_VERSION = '0.1.0'

export const isValuationMiss = (result: ValuationResult): result is ValuationMiss =>
  'valuation_miss_id' in result

const identity = (asset: AssetRef): string => canonicalJson({ ...asset })

function requireAmount(value: Amount, name: string): void {
  if (!(value instanceof Decimal) || !value.isFinite() || value.isNegative()) {
    throw new TypeError(`${name} must be a finite, non-negative core Amount`)
  }
}

/** Hash a JSON snapshot, never Decimal internals. */
function recordId(prefix: string, record: object): string {
  return `${prefix}-${hashJson(JSON.parse(JSON.stringify(record)) as JsonValue).slice(7)}`
}

export interface EngineOptions {
  /** Save/reuse this clock's value when reproducing a snapshot byte for byte. */
  readonly now?: () => Instant
}

export class ValuationEngine {
  private readonly providers: ReadonlyMap<string, PriceProvider>
  private readonly now: () => Instant

  constructor(providers: readonly PriceProvider[], options: EngineOptions = {}) {
    if (providers.length === 0) throw new TypeError('At least one price provider is required')
    const entries = providers.map((provider) => [provider.id, provider] as const)
    if (entries.some(([id]) => !id.trim()) || new Set(entries.map(([id]) => id)).size !== entries.length) {
      throw new TypeError('Price provider IDs must be non-empty and unique')
    }
    this.providers = new Map(entries)
    this.now = options.now ?? (() => instant(new Date()))
  }

  async value(input: ValueInput): Promise<ValuationResult> {
    const { valuations, misses, generatedAt, query } = await this.collect(input, false)
    return valuations[0] ?? this.missing(query, misses, generatedAt)
  }

  async compare(input: ValueInput): Promise<Comparison> {
    const { valuations, misses, generatedAt, query } = await this.collect(input, true)
    const first = valuations[0]
    if (!first) {
      return { status: 'UNKNOWN', selected: this.missing(query, misses, generatedAt), valuations, misses }
    }
    const spread = comparisonSpread(valuations.map((v) => amount(v.unit_price)))
    const { valuation_id: _id, ...base } = first
    const record = {
      ...base,
      ...(spread === undefined ? {} : { spread: toJSON(spread) }),
      alternatives: valuations.slice(1).map((v) => ({
        provider: v.provider, provider_market: v.provider_market, unit_price: v.unit_price,
        method: v.method, confidence: v.confidence
      }))
    }
    return {
      status: 'VALUED',
      selected: { valuation_id: recordId('valuation', record), ...record },
      valuations, misses,
      ...(spread === undefined ? {} : { spread: toJSON(spread) })
    }
  }

  private async collect(input: ValueInput, compare: boolean) {
    requireAmount(input.quantity, 'quantity')
    if (!/^[A-Z]{3,10}$/.test(input.targetCurrency)) throw new TypeError('Invalid target currency')
    if (!input.asset.asset_id && !input.asset.chain) throw new TypeError('Asset identity is required')
    if (input.method !== undefined && !VALUATION_METHODS.includes(input.method)) {
      throw new TypeError('Unknown valuation method')
    }
    const ids = [...(input.providers ?? this.providers.keys())]
    if (!ids.length || new Set(ids).size !== ids.length || ids.some((id) => !this.providers.has(id))) {
      throw new TypeError('Fallback policy must contain unique registered provider IDs')
    }
    const query: QuoteQuery = Object.freeze({
      asset: Object.freeze({ ...input.asset }), timestamp: instant(input.timestamp),
      targetCurrency: input.targetCurrency,
      ...(input.method === undefined ? {} : { method: input.method })
    })
    const quantity = amount(toJSON(input.quantity))
    const generatedAt = instant(this.now())
    const valuations: Valuation[] = []
    const misses: ProviderMiss[] = []
    const tried: string[] = []
    for (const id of ids) {
      tried.push(id)
      // Adapters report expected transport failures as Miss { reason: 'network' }.
      // Unexpected exceptions propagate; programming errors are not market gaps.
      const response = await this.providers.get(id)!.quote(query)
      if ('reason' in response) {
        if (!VALUATION_MISS_REASONS.includes(response.reason)) throw new TypeError('Invalid miss reason')
        misses.push({ provider: id, reason: response.reason, ...(response.detail === undefined ? {} : { detail: response.detail }) })
        continue
      }
      this.validateQuote(response, query)
      const record = {
        asset: query.asset, quantity: toJSON(quantity), timestamp: query.timestamp,
        target_currency: query.targetCurrency, unit_price: toJSON(response.unit_price),
        total_value: toJSON(mul(quantity, response.unit_price)), provider: id,
        provider_market: response.provider_market, method: response.method,
        time_resolution: response.time_resolution, raw_source_reference: response.raw_source_reference,
        ...(response.raw_payload === undefined ? {} : { raw_payload_hash: hashJson(response.raw_payload) }),
        fallback_used: valuations.length === 0 && misses.length > 0,
        fallback_chain: valuations.length === 0 ? [...tried] : [id], confidence: response.confidence,
        generated_at: generatedAt, engine_version: ENGINE_VERSION, schema_version: SCHEMA_VERSION
      }
      valuations.push({ valuation_id: recordId('valuation', record), ...record })
      if (!compare) break
    }
    return { valuations, misses, generatedAt, query }
  }

  private validateQuote(quote: Quote, query: QuoteQuery): void {
    requireAmount(quote.unit_price, 'unit_price')
    if (identity(quote.asset) !== identity(query.asset) || instant(quote.timestamp) !== query.timestamp ||
        quote.targetCurrency !== query.targetCurrency) {
      throw new TypeError('Provider quote does not match the requested asset, instant or currency')
    }
    if (!VALUATION_METHODS.includes(quote.method) || (query.method !== undefined && quote.method !== query.method)) {
      throw new TypeError('Provider quote does not match the requested method')
    }
    if (!quote.provider_market?.trim() || !quote.time_resolution?.trim() || !quote.raw_source_reference?.trim()) {
      throw new TypeError('Provider quote requires market, time resolution and source reference')
    }
    if (!Number.isFinite(quote.confidence) || quote.confidence < 0 || quote.confidence > 1) {
      throw new TypeError('Provider confidence must be between zero and one')
    }
  }

  private missing(query: QuoteQuery, misses: readonly ProviderMiss[], generatedAt: Instant): ValuationMiss {
    const record = {
      asset: query.asset, timestamp: query.timestamp, target_currency: query.targetCurrency,
      reason: misses[misses.length - 1]!.reason,
      providers_tried: misses.map((miss) => miss.provider), detail: JSON.stringify(misses), generated_at: generatedAt
    }
    return { valuation_miss_id: recordId('valuation-miss', record), ...record }
  }
}

/** Percent relative to the minimum quote; zero denominator or <2 quotes is undefined. */
export function comparisonSpread(prices: readonly Amount[]): Amount | undefined {
  for (const price of prices) requireAmount(price, 'price')
  if (prices.length < 2) return undefined
  let min = prices[0]!
  let max = min
  for (const price of prices.slice(1)) {
    if (cmp(price, min) < 0) min = price
    if (cmp(price, max) > 0) max = price
  }
  if (min.isZero()) return undefined
  return mul(div(sub(max, min), min), amount('100'))
}
