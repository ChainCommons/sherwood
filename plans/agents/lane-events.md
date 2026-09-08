# Lane: Events

Read: `plans/03-evidence-economic-events.md`, `plans/02-domain-model.md` (ownership / self-transfer), `plans/04-assets-positions-lots.md` (positions only)

## Own

`packages/evidence`, `packages/event-engine`, `packages/positions`

## TODOs

`P0-1-01` evidence store (append-only)  
`P0-1-02` technical tx + marketplace overlay + ownership → legs/events  
`P0-1-03` confirmed self-transfer ≠ sale  
`P0-1-08` positions stub (staking/vesting)

## Consume, do not rewrite

`packages/core`, schemas, `tests/contracts/technical-tx.example.json`, `tests/contracts/marketplace-objkt.example.json`

## Must not

Call TzKT, load France rules, compute tax, invent prices, classify `TAXABLE`.

## Done

Golden tests: split sale legs (gross/fee/royalty), self-transfer, mint without sale, baking reward hint, failed op ignored, one op → many events. AC-004, AC-009, AC-012 on synthetics.
