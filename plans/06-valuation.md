# 06 — Valuation engine

**Spec:** §§35–37  
**Workstream:** E  
**Depends on:** asset model (04), time handling (17)  
**Unblocks:** tools 002/004/timeline, lots cost basis, evidence pack  
**Package:** `packages/valuation`

Valuation is a **standalone subsystem**. The engine MUST NOT silently invent prices (AC-005).

## Capabilities (MUST support)

- fiat/fiat
- crypto/fiat
- crypto/crypto (via legs or double conversion, method explicit)
- exact timestamp valuation
- nearest-trade valuation
- daily valuation
- marketplace transaction valuation (price implied by the deal itself)
- professional/user-supplied valuation
- multiple price providers
- fallback chains (recorded, not silent)

## Schema

```yaml
valuation_id:
asset:
quantity:
timestamp:
target_currency:
unit_price:
total_value:
provider:
provider_market:
method: exact_timestamp | nearest_trade | daily | marketplace_implied | user_supplied | professional
time_resolution:
raw_source_reference:
fallback_used: boolean
fallback_chain: []
confidence:          # data quality, not legal certainty
generated_at:
spread:              # if multi-provider compared
alternatives: []     # other providers’ values
```

## Multi-source comparison (§36)

Users SHOULD compare:

```text
Provider A       €0.91
Provider B       €0.93
Provider C       €0.90
selected method: Provider B / nearest trade
spread: 3.3%
```

Especially for volatile or thinly traded assets (NFTs often have **no** reliable secondary index — then marketplace implied or UNKNOWN).

NFT valuation: prefer contemporaneous sale consideration; do not invent floor-price history as fact. Floor MAY be shown as non-authoritative alternative with low confidence.

## Reproducibility (§37)

Analysis snapshot MUST record: provider, provider data reference, method, timestamp, application version, price, currency.

Where practical, historical provider responses SHOULD be hashable or snapshot-capable. Cache raw provider payloads in the local project (content-hash) so reruns do not need the network (plan 12 offline).

## Provider interface (no single-vendor lock-in)

```ts
interface PriceProvider {
  id: string
  quote(query: QuoteQuery): Promise<Quote | Miss>
}
interface Miss { reason: 'no_market' | 'hole' | 'unsupported_asset' | 'network' }
```

Fallback policy is data, e.g. `[tzkt_xtz_eur, coingecko_xtz_eur, user_supplied]`. If all miss → valuation status `UNKNOWN`, finding flags missing reliable valuation (TOOL-009).

P0 providers:

1. Historical **XTZ/EUR** (and XTZ/USD if cheap) from a documented source; abstract so TzKT/CoinGecko/etc. are adapters
2. User-supplied override
3. Marketplace implied (OBJKT sale XTZ amount × XTZ/EUR at block time)

Stablecoins: still value via provider; do not assume 1:1 without a rule/provider.

FA2 tokens without market: `UNKNOWN` unless user/professional supplied or implied by the tx.

## API

```ts
value(input: {
  asset: AssetRef
  quantity: Decimal
  timestamp: Instant
  targetCurrency: 'EUR' | 'USD' | ...
  method?: Method
  providers?: ProviderId[]
}): Valuation | ValuationMiss
compare(input): Comparison
```

Used by: Historical Asset Valuator, event engine post-pass, lot cost basis, evidence pack.

## Implementation tasks

1. Schema + decimal prices.
2. `PriceProvider` + at least one XTZ/EUR historical adapter + user-supplied + marketplace implied.
3. Local cache of provider responses (hash, timestamp, payload).
4. Comparison helper (spread %).
5. Tests: miss does not fabricate; snapshot fields present; timezone: value at `block_time_utc` not local-midnight unless method is `daily` and documented; crypto quantity native precision × decimal fiat.

## P1

More providers, crypto/crypto direct markets, thinly traded token series, professional appraisal records.
