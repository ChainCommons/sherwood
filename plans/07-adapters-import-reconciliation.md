# 07 — Blockchain adapters, marketplaces, import, reconciliation

**Spec:** §§38–42 (wallet ownership in plan 02)  
**Workstream:** D  
**Depends on:** 03 (technical tx / evidence), 04 (assets)  
**Unblocks:** Tezos tools, workspace import, AC-015  
**Packages:** `packages/adapters/tezos`, `packages/adapters/csv`, `packages/reconciliation`, marketplace adapters under `adapters/marketplaces/`

Core logic is **chain-neutral**. Adapters only:

```text
raw chain data
     ↓
standard technical transaction
     ↓
semantic decoding (marketplace overlay → legs/events via event-engine)
```

## Priority

**P0:** generic CSV, Tezos  
**P1:** EVM, Solana, additional chains

## Tezos adapter (§39)

MUST support (P0):

- public wallet history
- tez transfers
- FA1.2 assets
- FA2 assets
- NFTs
- contract interactions
- marketplace transactions (via marketplace adapters)
- minting, burning
- primary sales, secondary sales
- royalties, platform fees, creator splits
- self-transfers (with ownership map from caller)
- baker/staking rewards
- multiple owned wallets
- historical balance reconstruction
- transaction hash preservation
- block timestamp preservation

Provider abstraction: TzKT MAY be preferred initial source; MUST NOT be hard-wired as the only possible provider.

```ts
interface ChainProvider {
  id: string
  fetchOperations(address: string, range?: TimeRange): AsyncIterable<RawOp>
  fetchOperation(hash: string): Promise<RawOp>
  fetchTokenBalances(address: string, at?: Block): Promise<Balance[]>
}
```

Map TzKT (or other) JSON → evidence (raw payload stored) + `TechnicalTx`. Do not emit `NFT_SALE` inside the chain provider.

Rewards: detect baking/staking reward ops (metadata or known entrypoints) and pass hints to event-engine as `economic_character: reward` **candidates**, still not tax income.

Historical balances: reconstruct from ops + optional indexer balance-at-block; expose uncertainty if indexer holes.

## Marketplace adapters (§40)

Separate from chain provider. Tezos-native art marketplaces. P0: **at least one major path** (OBJKT). SHOULD decode:

```text
buyer, seller, artist
gross price, marketplace fee, royalty, referral fee
asset transferred
timestamp, transaction hashes
```

Generic blockchain evidence MUST remain available underneath.

Implement:

- `adapters/marketplaces/objkt` — primary ask/fulfill, secondary, royalties, protocol fees
- Optional stretch: Teia, fxhash (same interface)

```ts
interface MarketplaceAdapter {
  id: string
  canDecode(tx: TechnicalTx): boolean
  decode(tx: TechnicalTx, raw: Evidence): MarketplaceSemantics | null
}
```

Event-engine consumes `MarketplaceSemantics` to build legs (consideration, fee, royalty) and event types (`ART_PRIMARY_SALE`, `NFT_SALE`, `NFT_ROYALTY`, …).

## Generic import (§41)

Support (P0: generic CSV + manual; others schema-ready):

- generic CSV
- exchange CSV (P1 mappings)
- accounting exports
- bank exports
- payment processor exports
- marketplace exports
- gallery statements

Every importer emits **normalized raw evidence**, not tax outcomes.

CSV mapping UI: user maps columns → evidence fields / technical tx fields. Store mapping as data. Sanitize CSV (plan 12).

## Reconciliation engine (§42)

Duplicate representations of the same economic activity:

```text
marketplace API record + blockchain operation + exchange record
```

Engine SHOULD: suggest matches, expose confidence, permit user confirmation or rejection, **preserve all source evidence**.

```ts
suggestMatches(records: Evidence[]): MatchSuggestion[]
confirm(matchId, user): void  // creates derived link, no deletion
reject(matchId, user): void
```

Matching heuristics (deterministic, inspectable): same op hash; same token_id + close timestamp + close amount; never auto-merge without user confirm for low confidence.

TOOL-009 surfaces suspected duplicates. P1 tool: Marketplace Reconciliation Tool.

## Implementation tasks

1. `ChainProvider` + TzKT client (paging, rate limits, no secrets).
2. TechnicalTx mapper + raw evidence persistence.
3. OBJKT decoder from chain parameters (entrypoint/FA2) with golden ops in `tests/adapters/`.
4. Baking reward recognition tests.
5. Generic CSV importer.
6. Reconciliation matcher + tests (duplicate fee not double-count after confirm).
7. Adapter does not import `rules-engine` or France packs.

## Tests

- AC-015 native Tezos semantics
- Regression: marketplace fee duplicated; royalty treated as primary sale
- Provider swap: mock second Tezos provider implementing `ChainProvider`
