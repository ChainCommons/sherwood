# Valuation

Implements P0-1-06: chain-neutral valuation, deterministic mock quotes, recorded
fallbacks, UNKNOWN on missing evidence, and multi-provider comparison (AC-005).

```ts
import { amount, instant } from '../core/src/index.ts'
import { MockPriceProvider, ValuationEngine } from './src/index.ts'

const query = {
  asset: { asset_id: 'synthetic-coin' },
  timestamp: instant('2021-06-15T23:40:00Z'),
  targetCurrency: 'EUR',
  method: 'exact_timestamp' as const
}
const provider = new MockPriceProvider('synthetic', [{
  query,
  response: {
    ...query,
    unitPrice: amount('2.41'),
    sourceTimestamp: query.timestamp,
    providerMarket: 'COIN/EUR',
    timeResolution: 'PT1S',
    rawSourceReference: 'synthetic://quote-1',
    confidence: 0.8
  }
}])
const engine = new ValuationEngine([provider])
const result = await engine.value({ ...query, quantity: amount('100.000001') })
// result.status === 'VALUED'; result.valuation.total_value === '241.00000241'
```

`value` tries the requested provider IDs in order and stops at the first valid
quote. Omit `providers` to use registration order. Empty, duplicate or unknown
provider IDs are configuration errors. The method defaults to `exact_timestamp`;
providers must honor it. A fallback cannot silently change the requested method.
Request `daily`, `nearest_trade`, `marketplace_implied`, `user_supplied`, or
`professional` explicitly when the evidence supports that method.

`PriceProvider.quote` returns a quote or a miss (`no_market`, `hole`,
`unsupported_asset`, `network`). Quotes echo the request's asset, timestamp,
currency and method, and carry a source timestamp, market, time resolution,
source reference and confidence. The engine checks these before using a price.
Exact quotes must have the same source instant; daily quotes must use the same
UTC day. Nearest-trade queries require an explicit `maxDistanceMs` and the source
instant must fall within it. Other methods retain their source instant in the
attempt trace. Confidence describes data quality, never legal certainty.

The result envelope has status `VALUED` with a `valuation` record or `UNKNOWN`
with a `miss` record. Those records conform to the existing valuation schemas;
the envelope's `attempts` records every quote or reason for failure. If all
providers miss, the miss's primary reason is the final provider's reason and
its detail lists every failure. No amount is present in a miss. Provider
exceptions become network misses with a generic message; malformed or
mismatched quotes become holes. Stablecoins, NFTs and zero quantities require
actual evidence just like any other asset. An explicitly evidenced zero price
is valid.

`compare` queries every requested provider, keeps the first successful quote as
the selected valuation and records other successful quotes as alternatives.
Comparison-only attempts after selection do not count as fallbacks. Its
`spreadPercent` is `(max - min) / min * 100`; the valuation record's `spread`
stores the corresponding ratio. Both use core decimal arithmetic. With fewer
than two quotes, or a zero minimum and nonzero maximum, the percentage is `null`
and the record omits `spread`. Identical quotes, including all-zero quotes,
have zero spread. This is a price range, not a confidence or legal assessment.

Quantities and prices use core's branded `Amount`; persisted money is serialized
as decimal strings without exponent notation. Multiplication and division use
core's 40-significant-digit decimal context. No fiat-cent rounding is applied;
callers choose and record any reporting rounding through core's rounding API.
`now` and `createId` can be injected for deterministic replay. Save the result
envelope to retain source timestamps and attempted quotes alongside the selected
record's source reference, optional payload hash, method and engine version.

The mock matches the complete query exactly and copies fixture responses. An
absent fixture is a hole; it never searches adjacent times or assumes a peg.
There are no network providers, price interpolation, cache persistence, or lot
matching in this task. Live and supplied-price adapters remain separate work.

Core primitives and the test schema validator are imported through their existing
workspace source entry points so this lane needs no lockfile or root manifest
changes. This package currently runs from source within the monorepo.

Run `pnpm exec vitest run packages/valuation/test` and
`pnpm exec tsc -p packages/valuation/tsconfig.json --noEmit` from the repository root.
