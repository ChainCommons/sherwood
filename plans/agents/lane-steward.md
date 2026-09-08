# Lane: Steward

Read: `plans/00-MASTER.md`, `plans/22-architecture-workstreams.md`, `plans/23-implementation.md`, `plans/16-repository-ci.md`, `plans/19-governance.md`, `plans/01-product-philosophy-constraints.md`

## Own

`schemas/`, `packages/core`, `packages/validate`, `.github/`, root tooling, `CODEOWNERS`, `tests/contracts/`, `pnpm-lock.yaml`, `analyze()` facade wiring in `packages/core` or a thin `packages/analyze`

## TODOs

`P0-0-01` … `P0-0-10` first. After freeze: merge PRs, apply RFCs, unique IDs, invariant import tests (`event-engine` / `rules-engine` must not import `adapters/tezos` or `jurisdictions/france`).

## Must not

France legal prose, OBJKT decoding, Tax Tools UI, AI prompts as authority.

## Done (Wave 0)

`pnpm validate` and `pnpm test` pass on empty packs; JSON Schemas cover plans 02–06, 09, 10, 14; contract example JSON exists for downstream lanes.
