# Lane: Rules / source registry

Read: `plans/05-knowledge-commons.md`, `plans/19-governance.md` (§100 competing interpretations)

## Own

`packages/source-registry`, `packages/rules-engine`

## TODOs

`P0-1-04` as-of publication vs effective vs retrieved  
`P0-1-05` DSL v0, UNKNOWN / REVIEW_REQUIRED, dual interpretations

## Consume

Jurisdiction YAML from France lane; do not author CGI/BOFiP text here. Use fixtures under `tests/` if France pack is empty.

## Must not

Import Tezos types; silently pick one interpretation; apply 2025 guidance to 2021 events (AC-002).

## Done

AC-001, AC-002, AC-003, AC-011 tests on fixture packs. Every evaluated rule carries `sources[]`.
