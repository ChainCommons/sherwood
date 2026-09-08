# Lane: Export / CLI

Read: `plans/13-exports-api-cli.md`, `plans/10-audit-reporting.md` (schema stub only)

## Own

`packages/exporters`, `apps/cli` (except Steward-owned validate wiring if already present — extend, do not replace)

## TODOs

`P0-1-11` (if Steward did not finish CLI), `P0-3-08` knowledge static API, `P0-3-22`, `P0-3-23`, `P0-4-09`, `P0-4-13`

## Must not

Vendor-only formats as the default export; mix reporting rules into tax-base calculation.

## Done

16-section professional pack; generic CSV/JSON; CLI `analyze` / `export` uses the same facade as the UI.
