# Lane: QA / acceptance

Read: `plans/17-quality-integrity.md`, `plans/20-p0-mvp-acceptance.md`, `plans/16-repository-ci.md` (§88), `plans/14-scenarios.md` (fixtures)

## Own

`tests/acceptance`, `tests/regression`, `tests/synthetic-ledgers` (coordinate with Scenarios if both exist — prefer this lane owns tests, France/Events provide data)

## TODOs

`P0-1-13`, `P0-1-14`, `P0-2-10`, `P0-3-25`, `P0-G-01` … `P0-G-04`

## Must not

Implement production engines to “make tests pass” by weakening assertions. Change product code only with Steward if a test reveals a contract bug.

## Done

AC-001–015 mapped to files; eight §88 regressions present; primary/secondary demo fixtures runnable.
