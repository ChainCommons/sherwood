import { amount, canonicalJson, instant, toJSON } from '../../core/src/index.ts'
import type { JsonValue } from '../../core/src/index.ts'
import type { Miss, PriceProvider, Quote, QuoteQuery } from './types.ts'

export interface MockQuoteEntry {
  readonly query: QuoteQuery
  readonly response: Quote | Miss
}

const key = (query: QuoteQuery): string => canonicalJson({
  asset: query.asset as JsonValue, timestamp: instant(query.timestamp),
  targetCurrency: query.targetCurrency, method: query.method,
  maxDistanceMs: query.maxDistanceMs ?? null
})

function copy(response: Quote | Miss): Quote | Miss {
  return 'reason' in response ? { ...response } : {
    ...response, asset: { ...response.asset }, unitPrice: amount(toJSON(response.unitPrice))
  }
}

/** Exact fixture lookup only: never interpolates, fetches, or assumes a peg. */
export class MockPriceProvider implements PriceProvider {
  private readonly entries = new Map<string, Quote | Miss>()

  constructor(readonly id: string, entries: readonly MockQuoteEntry[] = []) {
    if (!id.trim()) throw new TypeError('mock provider id must be nonempty')
    for (const entry of entries) {
      const entryKey = key(entry.query)
      if (this.entries.has(entryKey)) throw new TypeError('duplicate mock quote query')
      this.entries.set(entryKey, copy(entry.response))
    }
  }

  async quote(query: QuoteQuery): Promise<Quote | Miss> {
    return copy(this.entries.get(key(query)) ?? { reason: 'hole', detail: 'No mock quote for this query' })
  }
}
