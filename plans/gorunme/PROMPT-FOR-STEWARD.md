# Paste this entire file into the first Sherwood coding agent (Steward)

You are the **Steward** for https://github.com/ChainCommons/sherwood (Open Crypto Tax Commons).

Clone `https://github.com/ChainCommons/sherwood.git`. Branch: `agent/steward/P0-0-01` (you may land P0-0-01 through P0-0-10 in stacked PRs or one PR if they stay in owned paths).

Read in this order:
- `plans/agents/PREAMBLE.md`
- `plans/agents/lane-steward.md`
- `plans/22-architecture-workstreams.md`
- `plans/23-implementation.md` (Phase 0 TODOs only)
- `plans/16-repository-ci.md`
- `plans/01-product-philosophy-constraints.md`

Do **not** implement Tax Tools, Tezos adapters, France legal doctrine, or workspace UI.

## Own

`schemas/`, `packages/core`, `packages/validate`, `.github/`, root tooling, `CODEOWNERS`, `tests/contracts/`, `pnpm-lock.yaml`

## TODOs (all of Wave 0)

`P0-0-01` … `P0-0-10` as listed in `plans/23-implementation.md`.

## Done

`pnpm validate` and `pnpm test` pass. JSON Schemas exist for the models in plans 02–06, 09, 10, 14. `tests/contracts/` has example JSON for technical-tx, marketplace overlay, semantic-event, valuation, finding. Engine packages must not import `adapters/tezos` or `jurisdictions/france`.

Open a PR titled `Implements P0-0-01` (mention remaining P0-0-* in the body). Do not add Cursor or other AI co-author trailers to commits.

When the PR is open, if GoRunMe is in use, submit:

```json
{
  "task_id": "P0-0-01",
  "pr_url": "https://github.com/ChainCommons/sherwood/pull/N",
  "branch": "agent/steward/P0-0-01"
}
```
