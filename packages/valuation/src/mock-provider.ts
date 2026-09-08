import { amount, canonicalJson, instant, toJSON } from '../../core/src/index.ts'
import type { Miss, PriceProvider, Quote, QuoteQuery } from './types.ts'

export interface MockEntry {
  readonly query: QuoteQuery
  readonly response: Quote | Miss
}

const key = (query: QuoteQuery): string => canonicalJson({
  asset: { ...query.asset }, timestamp: instant(query.timestamp),
  targetCurrency: query.targetCurrency, method: query.method ?? null
})

const copyQuote = (quote: Quote): Quote => ({
  ...quote, asset: { ...quote.asset }, unit_price: amount(toJSON(quote.unit_price)),
  ...(quote.raw_payload === undefined ? {} : { raw_payload: structuredClone(quote.raw_payload) })
})

/** Exact query fixtures only: no interpolation, daily bucketing, parity or live APIs. */
export class MockPriceProvider implements PriceProvider {
  private readonly entries = new Map<string, Quote | Miss>()
  private readonly defaultMiss: Miss

  constructor(readonly id: string, entries: readonly MockEntry[] = [], defaultMiss: Miss = { reason: 'hole' }) {
    if (!id.trim()) throw new TypeError('Mock provider ID must be non-empty')
    this.defaultMiss = { ...defaultMiss }
    for (const entry of entries) {
      const queryKey = key(entry.query)
      if (this.entries.has(queryKey)) throw new TypeError('Duplicate mock quote query')
      this.entries.set(queryKey, 'reason' in entry.response ? { ...entry.response } : copyQuote(entry.response))
    }
  }

  async quote(query: QuoteQuery): Promise<Quote | Miss> {
    const response = this.entries.get(key(query)) ?? this.defaultMiss
    return 'reason' in response ? { ...response } : copyQuote(response)
  }
}
