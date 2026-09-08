# Lane: Tezos adapters

Read: `plans/07-adapters-import-reconciliation.md`, `plans/03-evidence-economic-events.md` (output shapes only)

## Own

`adapters/tezos`, `adapters/marketplaces`, `adapters/csv`, `packages/reconciliation`

## TODOs

`P0-2-01` … `P0-2-10` (TzKT, wallet import, NFT hints, OBJKT, baking, XTZ/EUR *provider implementing valuation interface*, CSV, reconciliation, incremental ingest, AC-015)

## Emit

`TechnicalTx` + raw evidence + `MarketplaceSemantics` overlay. Event-engine consumes these.

## Must not

Set `event_type` to a tax result; import France packs; treat self-transfer as sale without ownership map from caller; hard-wire TzKT as the only possible `ChainProvider`.

## Done

Golden recorded operations for OBJKT primary/secondary/royalty/fees; baking reward; AC-015.
