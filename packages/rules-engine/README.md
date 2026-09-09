# @octc/rules-engine

Evaluates jurisdiction rule packs against an as-of pair
`{ transactionDate, analysisDate }` (plan 05).

- Selects rules where `effective_from ≤ transactionDate ≤ effective_to`
- Evaluates versioned predicate DSL v0 (`all` / `any` / `not` / field ops)
- Attaches sources published by the transaction date vs later (AC-002)
- Every evaluated rule carries `sources[]` (AC-001)
- Unsupported treatments resolve to `UNKNOWN` (AC-003)
- Ambiguous / unsettled / disputed rules surface `REVIEW_REQUIRED`
- Competing interpretations are both emitted as `UNRESOLVED` (AC-011)

Does not import Tezos types or France packs — callers pass YAML-loaded packs.
