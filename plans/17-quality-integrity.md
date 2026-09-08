# 17 — Calculation integrity, time, performance, snapshots, acceptance tests

**Spec:** §§89–93, 105  
**Workstream:** L + core  
**Depends on:** engines  
**P0:** all MUST items and AC-001–015 as CI

## Calculation integrity (§89)

- Money calculations MUST use decimal arithmetic (`decimal.js` or equivalent). Ban IEEE float for amounts.
- Crypto quantities MUST preserve native precision (XTZ mutez integer; FA2 `decimals` from metadata or user override with status ESTIMATED).
- Rounding MUST be jurisdiction/rule configurable (not hidden half-up globally). Record rounding mode on findings.

Lint: no `number` for money in core packages (branded `Decimal` type).

## Time handling (§90)

Preserve raw blockchain timestamp in UTC.

Support: UTC; participant local time; tax jurisdiction date.

Timezone assumptions MUST be inspectable (shown on events and snapshots).

Tax year grouping uses jurisdiction convention (France: calendar year unless rule says otherwise) applied to **jurisdiction-local date** of `occurred_at_utc`, with the zone recorded.

Regression: “wrong timezone” fixture (UTC evening → next calendar day in Europe/Paris).

## Performance (§91)

A local workspace SHOULD comfortably handle **100,000+** normalized events on a modern consumer device. Processing SHOULD be incremental.

Implications:

- SQLite indexes on address, timestamp, op hash
- Incremental ingest cursor per wallet
- Don’t recompute all lots from genesis unless snapshot invalid
- Virtualize UI lists
- Budget: timeline tool on 20k Tezos ops usable; 100k as target test

Add a perf fixture generator (synthetic) and a documented budget; fail CI only on egregious regressions if 100k is too slow in CI — run 100k nightly or locally tagged.

## Analysis snapshots (§93)

See plan 09 field list. Snapshot is the unit of reproducibility (AC-006).

Store engine semver + git commit of packs.

## Critical acceptance tests (§105) — CI gates

| ID | Requirement |
|---|---|
| AC-001 Provenance | No material legal conclusion without rule/source refs |
| AC-002 Historical correctness | 2021 tx cannot silently use 2025-published guidance as if available in 2021 |
| AC-003 Unknown | Unsupported treatment can resolve `UNKNOWN` |
| AC-004 Self transfer | Confirmed self-wallet transfer not automatically a sale |
| AC-005 Valuation | Every historical crypto valuation exposes provider, timestamp, method |
| AC-006 Reproducibility | Saved analysis reproduced from recorded versions and methods |
| AC-007 AI grounding | AI explanations from structured facts and source-backed rules |
| AC-008 Privacy | Analyze wallets without account or uploading complete ledger |
| AC-009 Raw evidence | Manual correction never destroys imported evidence |
| AC-010 Multiple capacity | Artist + collector + builder activity simultaneously |
| AC-011 Legal ambiguity | Two competing interpretations coexist |
| AC-012 Chain semantics | Blockchain operation not automatically a taxable event |
| AC-013 Tool independence | Several P0 tools useful without full workspace |
| AC-014 Professional inspection | Accountant inspects facts, classifications, valuations, rules, sources separately |
| AC-015 Tezos-native | Primary NFT sales, secondary, royalties, fees, self-transfers — not generic transfers only |

Map each AC to a test file under `tests/acceptance/`.

## Implementation tasks

1. Decimal-only money module.
2. `ZonedInstant` helper.
3. Incremental ingest API.
4. Snapshot round-trip test.
5. Fifteen acceptance tests wired in CI.
6. Seed eight regression cases (§88).
