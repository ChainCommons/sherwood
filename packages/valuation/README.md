# Valuation

Implements P0-1-06: a standalone valuation engine, offline mock provider and
multi-provider comparison. It uses core `Amount` arithmetic and UTC instants;
there is no chain fetching or tax classification.

```ts
import { amount, instant } from '../core/src/index.ts'
import { MockPriceProvider, ValuationEngine, isValuationMiss } from './src/index.ts'

const query = {
  asset: { chain: 'synthetic', symbol: 'TOKEN' },
  timestamp: instant('2021-06-15T23:40:00Z'),
  targetCurrency: 'EUR'
}
const provider = new MockPriceProvider('fixture', [{
  query,
  response: {
    ...query,
    unit_price: amount('0.93'),
    method: 'nearest_trade',
    provider_market: 'TOKEN/EUR',
    time_resolution: 'PT5M',
    raw_source_reference: 'synthetic://quotes/1',
    confidence: 0.8
  }
}])
const engine = new ValuationEngine([provider])
const result = await engine.value({ ...query, quantity: amount('100') })
if (isValuationMiss(result)) {
  // UNKNOWN: expose the gap to the findings/workspace layer.
} else {
  console.log(result.total_value) // decimal string "93"
}
```

`PriceProvider.quote(query)` returns a `Quote` or a `Miss`. Quotes echo the asset,
requested instant and target currency and provide their actual method, market,
time resolution, source reference and data-quality confidence. With no requested
method, the engine accepts the method documented by the chosen provider; an
explicit method must match. Nearest-trade timestamps and daily bucket conventions
belong in the source evidence/time resolution. The requested operation instant is
never changed to local midnight. Expected transport failures are `network` misses;
unexpected exceptions and invalid quotes throw so adapter bugs remain visible.

`value(input)` tries providers in constructor order, or the caller's `providers`
order, stopping at the first quote. The selected record includes the actual
attempted `fallback_chain` (including the successful provider) and `fallback_used`.
An empty or invalid provider policy is a configuration error. When every provider
misses, the engine returns a schema-compatible `ValuationMiss`, meaning `UNKNOWN`.
Its `reason` is the final miss, and `detail` is a JSON array preserving every
provider's reason and optional detail. No price or total is inserted, including
for stablecoins, same-currency queries, NFTs and zero quantities. An explicitly
sourced zero price remains a valid quote.

`compare(input)` queries all configured providers and keeps the first successful
quote selected according to the same policy. It returns full `valuations`,
structured `misses`, and the selected record with `alternatives`. Other successful
comparison records describe their own provider, not a fallback from the selection.
The spread is **(maximum unit price − minimum unit price) / minimum unit price ×
100**, expressed as a decimal percentage string. It is omitted when fewer than
two quotes exist or the minimum price is zero; equal positive prices give `"0"`.
Methods may differ unless the caller specifies one, and each remains visible.

Quantities and prices must be finite, non-negative core `Amount` values. Persisted
money is serialized with core `toJSON`; no fiat-cent rounding is applied. Core's
40-significant-digit decimal precision governs arithmetic, including repeating
spread fractions. Presentation/accounting rounding belongs to the caller's
explicit policy.

The persistable results match `schemas/valuation/valuation.schema.json` and
`valuation-miss.schema.json`. Successful records include the engine version and
optionally a core content hash of a supplied `raw_payload`. The caller retains
that payload in its local evidence store; this engine does not provide a durable
cache. Inject `now` and replay the same fixtures to reproduce the same records
and content-derived IDs. The mock copies fixtures and matches only configured
queries; it never interpolates prices or accesses a network.

This private source workspace consumes core through repository-relative imports,
so this task adds no dependency or lockfile changes. Live historical adapters,
durable caching and lot matching are separate tasks.

Run `pnpm exec vitest run packages/valuation/test` and
`pnpm --filter @octc/valuation typecheck` from the repository root.
