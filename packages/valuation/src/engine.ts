import {
  Decimal, VALUATION_METHODS, VALUATION_MISS_REASONS, amount, canonicalJson,
  div, instant, isContentHash, isSlug, isUlid, mul, sub, toJSON, ulid
} from '../../core/src/index.ts'
import type { Amount, Instant, JsonValue } from '../../core/src/index.ts'
import type {
  Alternative, Attempt, Comparison, Miss, PriceProvider, Quote, QuoteQuery,
  ValuationResult, ValueInput
} from './types.ts'

export const ENGINE_VERSION = 'valuation@0.0.0'

export interface EngineOptions {
  readonly now?: () => Instant
  readonly createId?: () => string
}

/** Decimal inputs may not arrive as JS numbers, even from an untyped adapter. */
function nonnegative(value: Amount): boolean {
  return Decimal.isDecimal(value) && value.isFinite() && !value.isNegative()
}

function queryFor(input: ValueInput): QuoteQuery {
  if (!nonnegative(input.quantity)) throw new TypeError('quantity must be a nonnegative Amount')
  if (!/^[A-Z]{3,10}$/.test(input.targetCurrency)) throw new TypeError('invalid target currency')
  const asset = input.asset
  if (!asset || (!asset.asset_id && !asset.chain) ||
      Object.entries(asset).some(([key, value]) =>
        !['asset_id', 'chain', 'contract', 'token_id', 'symbol'].includes(key) ||
        typeof value !== 'string') ||
      (asset.asset_id !== undefined && !isSlug(asset.asset_id) && !isUlid(asset.asset_id))) {
    throw new TypeError('invalid asset reference')
  }
  // Instant is branded by core. Also reject timezone-less strings at runtime.
  if (!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(input.timestamp)) {
    throw new TypeError('timestamp must include an explicit timezone')
  }
  const method = input.method ?? 'exact_timestamp'
  if (!VALUATION_METHODS.includes(method)) throw new TypeError('unsupported valuation method')
  if ((method === 'nearest_trade' && input.maxDistanceMs === undefined) ||
      (input.maxDistanceMs !== undefined &&
       (!Number.isSafeInteger(input.maxDistanceMs) || input.maxDistanceMs < 0))) {
    throw new TypeError('nearest_trade requires a nonnegative maxDistanceMs')
  }
  return {
    asset: { ...asset }, timestamp: instant(input.timestamp),
    targetCurrency: input.targetCurrency, method,
    ...(input.maxDistanceMs === undefined ? {} : { maxDistanceMs: input.maxDistanceMs })
  }
}

function validQuote(quote: Quote, query: QuoteQuery): boolean {
  if (!nonnegative(quote.unitPrice) || quote.method !== query.method ||
      quote.targetCurrency !== query.targetCurrency ||
      canonicalJson(quote.asset as JsonValue) !== canonicalJson(query.asset as JsonValue) ||
      !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(quote.timestamp) ||
      instant(quote.timestamp) !== query.timestamp ||
      !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(quote.sourceTimestamp) ||
      !Number.isFinite(quote.confidence) || quote.confidence < 0 || quote.confidence > 1 ||
      ![quote.providerMarket, quote.timeResolution, quote.rawSourceReference]
        .every(value => typeof value === 'string' && value.trim().length > 0) ||
      (quote.rawPayloadHash !== undefined && !isContentHash(quote.rawPayloadHash))) return false
  const source = instant(quote.sourceTimestamp)
  if (query.method === 'exact_timestamp' && source !== query.timestamp) return false
  // Daily observations use the UTC day, never the machine's local midnight.
  if (query.method === 'daily' && source.slice(0, 10) !== query.timestamp.slice(0, 10)) return false
  if (query.method === 'nearest_trade' &&
      Math.abs(Date.parse(source) - Date.parse(query.timestamp)) > query.maxDistanceMs!) return false
  return true
}

async function attempt(provider: PriceProvider, query: QuoteQuery): Promise<Attempt> {
  let response: Quote | Miss
  try {
    response = await provider.quote({ ...query, asset: { ...query.asset } })
  } catch {
    // Provider errors may contain credentials or request data; do not persist them.
    return { provider: provider.id, status: 'MISSED', miss: { reason: 'network', detail: 'Provider request failed' } }
  }
  try {
    if ('reason' in response && VALUATION_MISS_REASONS.includes(response.reason) &&
        (response.detail === undefined || typeof response.detail === 'string')) {
      return { provider: provider.id, status: 'MISSED', miss: { ...response } }
    }
    if (!('reason' in response) && validQuote(response, query)) {
      return {
        provider: provider.id, status: 'QUOTED',
        quote: { ...response, asset: { ...response.asset }, unitPrice: amount(toJSON(response.unitPrice)) }
      }
    }
  } catch {
    // Malformed adapter responses are data gaps, never zero-valued quotes.
  }
  return { provider: provider.id, status: 'MISSED', miss: { reason: 'hole', detail: 'Invalid or mismatched quote' } }
}

/** Relative range; a single observation is not a comparison. */
export function relativeSpread(prices: readonly Amount[]): Amount | null {
  if (prices.some(price => !nonnegative(price))) throw new TypeError('prices must be nonnegative Amounts')
  if (prices.length < 2) return null
  let min = prices[0]!
  let max = min
  for (const price of prices.slice(1)) {
    if (price.lessThan(min)) min = price
    if (price.greaterThan(max)) max = price
  }
  if (max.equals(min)) return amount('0')
  if (min.isZero()) return null
  return div(sub(max, min), min)
}

export class ValuationEngine {
  private readonly providers: ReadonlyMap<string, PriceProvider>
  private readonly now: () => Instant
  private readonly createId: () => string

  constructor(providers: readonly PriceProvider[], options: EngineOptions = {}) {
    if (providers.length === 0 || providers.some(provider => !provider.id.trim()) ||
        new Set(providers.map(provider => provider.id)).size !== providers.length) {
      throw new TypeError('register at least one provider with a unique, nonempty id')
    }
    this.providers = new Map(providers.map(provider => [provider.id, provider]))
    this.now = options.now ?? (() => instant(new Date()))
    this.createId = options.createId ?? (() => ulid())
  }

  async value(input: ValueInput): Promise<ValuationResult> {
    return (await this.run(input, false)).result
  }

  async compare(input: ValueInput): Promise<Comparison> {
    return this.run(input, true)
  }

  private async run(input: ValueInput, compare: boolean): Promise<Comparison> {
    const query = queryFor(input)
    const quantity = toJSON(input.quantity)
    const ids = [...(input.providers ?? this.providers.keys())]
    if (!ids.length || new Set(ids).size !== ids.length || ids.some(id => !this.providers.has(id))) {
      throw new TypeError('provider policy must contain unique registered ids')
    }
    const attempts: Attempt[] = []
    for (const id of ids) {
      const result = await attempt(this.providers.get(id)!, query)
      attempts.push(result)
      if (!compare && result.status === 'QUOTED') break
    }
    const generated_at = instant(this.now())
    const recordId = this.createId()
    if (!isSlug(recordId) && !isUlid(recordId)) throw new TypeError('invalid valuation record id')
    const quoted = attempts.filter(item => item.status === 'QUOTED')
    const selected = quoted[0]
    if (!selected) {
      const last = attempts[attempts.length - 1]!
      if (last.status !== 'MISSED') throw new Error('missing final provider attempt')
      return {
        spreadPercent: null,
        result: {
          status: 'UNKNOWN', attempts,
          miss: {
            valuation_miss_id: recordId, asset: query.asset, timestamp: query.timestamp,
            target_currency: query.targetCurrency, reason: last.miss.reason,
            providers_tried: attempts.map(item => item.provider),
            detail: attempts.map(item => item.status === 'MISSED'
              ? `${item.provider}: ${item.miss.reason}${item.miss.detail ? ` (${item.miss.detail})` : ''}`
              : '').join('; '), generated_at
          }
        }
      }
    }
    const spread = compare ? relativeSpread(quoted.map(item => item.quote.unitPrice)) : null
    const quote = selected.quote
    const alternatives: Alternative[] = quoted.slice(1).map(item => ({
      provider: item.provider, provider_market: item.quote.providerMarket,
      unit_price: toJSON(item.quote.unitPrice), method: item.quote.method, confidence: item.quote.confidence
    }))
    const selectedIndex = attempts.indexOf(selected)
    return {
      spreadPercent: spread === null ? null : toJSON(mul(spread, amount('100'))),
      result: {
        status: 'VALUED', attempts,
        valuation: {
          valuation_id: recordId, asset: query.asset, quantity, timestamp: query.timestamp,
          target_currency: query.targetCurrency, unit_price: toJSON(quote.unitPrice),
          total_value: toJSON(mul(amount(quantity), quote.unitPrice)), provider: selected.provider,
          provider_market: quote.providerMarket, method: quote.method,
          time_resolution: quote.timeResolution, raw_source_reference: quote.rawSourceReference,
          ...(quote.rawPayloadHash === undefined ? {} : { raw_payload_hash: quote.rawPayloadHash }),
          fallback_used: selectedIndex > 0,
          fallback_chain: attempts.slice(0, selectedIndex + 1).map(item => item.provider),
          confidence: quote.confidence, generated_at, engine_version: ENGINE_VERSION,
          ...(spread === null ? {} : { spread: toJSON(spread) }),
          alternatives, schema_version: '0.1.0'
        }
      }
    }
  }
}
