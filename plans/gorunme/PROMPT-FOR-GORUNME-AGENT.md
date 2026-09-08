# Paste this entire file into the GoRunMe agent

You are extending **GoRunMe**, not implementing Project Sherwood.

Stay on **Mode 1**: public tasks, FIFO claim + lease, schema-check then human accept, one ledger event only after accept. Do **not** build Stage 2 (CLI, provider adapters, keys in GoRunMe). Do **not** clone Sherwood to write its engines. Do **not** auto-merge GitHub PRs.

## What Sherwood is

Public repo: https://github.com/ChainCommons/sherwood

Open Crypto Tax Commons — greenfield TypeScript monorepo (not started as code yet). Spec: `INITIAL_PROMPT.md`. Execution TODOs: `plans/23-implementation.md`. Lanes: `plans/24-multi-agent.md`. Prompt briefs already in-repo: `plans/agents/PREAMBLE.md` + `plans/agents/lane-*.md`.

Delivery artifact is a **GitHub pull request**, not a documentation JSON field.

## What you build (MVP)

GoRunMe is the **scheduler**. GitHub is the **workshop**.

1. Campaign **Sherwood P0** with a result schema for implementation tasks:

```json
{
  "task_id": "P0-1-02",
  "pr_url": "https://github.com/ChainCommons/sherwood/pull/N",
  "branch": "agent/events/P0-1-02"
}
```

Reject submit if `pr_url` is missing or not an http(s) URL. Human owner still accept/reject. Accept means “useful PR” (merged or merge-ready). Credit = accepted run. VDP stays attribution-only.

2. Prompt pack per task = generated header + files fetched from the Sherwood repo (do not rewrite their meaning):

Header must include: `task_id`, `lane`, `owned_paths`, `forbidden_paths`, required branch `agent/<lane>/<task_id>`, required PR title `Implements <task_id>`, clone URL `https://github.com/ChainCommons/sherwood.git`.

Then concatenate:
- `plans/agents/PREAMBLE.md`
- the lane file from the task list below
- instruction: clone GitHub, work only in owned_paths, open the PR, then submit **only** the result JSON to GoRunMe. Do not paste source code into GoRunMe.

Forbidden paths for all non-steward tasks: `schemas/`, `packages/core`, `pnpm-lock.yaml`, root `package.json`, `.github/` (except Steward).

3. API (reuse Mode 1; add only what is missing):
- list open tasks for the campaign
- claim (FIFO + lease) → pack + lease
- get pack for a claimed task
- submit result JSON
- owner accept/reject

4. Seed tasks from `plans/gorunme/tasks-wave0.yaml` and `plans/gorunme/tasks-wave1.yaml` in the Sherwood repo.

- Wave 0: **one** task (or a bundle labeled steward-only). Do not offer it to random public runners if you can mark it maintainer-only. Status: `open` now.
- Wave 1: four lanes, multiple task_ids. Status: **`blocked` / unpublished** until the human says Wave 0 is merged to `main`.

5. Operator note (one page): four runners claim four **different** Wave 1 lanes → paste pack into Cursor/Claude/Codex/Gemini → agent opens PR → paste result JSON → owner accept. Demo Doc Library campaign must still work.

## Exit

- Two clients cannot hold the same `task_id` lease.
- Four concurrent Wave 1 claims (when published) are four different task_ids.
- Submit without `pr_url` fails schema check.
- Owner accept updates leaderboard/VDP.
- No Stage 2 work.

Stop when that loop works on local or staging.

## Task table (Wave 1, publish after schemas exist)

| task_id | lane | owned_paths | packet |
|---|---|---|---|
| P0-1-01 | events | packages/evidence, packages/event-engine, packages/positions | PREAMBLE + lane-events.md |
| P0-1-02 | events | same | same |
| P0-1-03 | events | same | same |
| P0-1-04 | rules | packages/source-registry, packages/rules-engine | PREAMBLE + lane-rules.md |
| P0-1-05 | rules | same | same |
| P0-1-06 | vallots | packages/valuation, packages/lots | PREAMBLE + lane-vallots.md |
| P0-1-07 | vallots | same | same |
| P0-3-01 | france | jurisdictions/france, jurisdictions/eu | PREAMBLE + lane-france.md |

Prefer publishing **one open task per lane** first (P0-1-01, P0-1-04, P0-1-06, P0-3-01) so four agents do not serialize on the same directory.
