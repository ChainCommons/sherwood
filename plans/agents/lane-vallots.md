# Lane: Valuation and lots

Read: `plans/06-valuation.md`, `plans/04-assets-positions-lots.md`, `plans/17-quality-integrity.md` (decimal + time)

## Own

`packages/valuation`, `packages/lots`

## TODOs

`P0-1-06` valuation + mock provider + miss-not-invent + spread  
`P0-1-07` FIFO, SPECIFIC_IDENTIFICATION, AVERAGE_COST, other methods; self-transfer lot move; gaps → UNKNOWN

## Must not

Hardcode FIFO as global; invent prices; apply legal classification; call chain APIs (live XTZ/EUR is Tezos/valuation *adapter* in Wave 2 — interface only now).

## Done

AC-005 on mock quotes; lot golden tests; no IEEE float for money.
