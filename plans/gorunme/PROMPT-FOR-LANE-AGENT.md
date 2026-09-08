# Paste this file PLUS one lane brief into each Wave 1 coding agent

Use only after Wave 0 is on `origin/main`.

1. Claim **one** open task in GoRunMe (or take the GitHub issue with that `task_id` if GoRunMe is down). If claim fails, stop — someone else has it.
2. Concatenate:
   - the GoRunMe pack header (task_id, owned_paths, branch name), or this file
   - `plans/agents/PREAMBLE.md`
   - **exactly one** of: `lane-events.md` | `lane-rules.md` | `lane-vallots.md` | `lane-france.md`
   - the plan files that lane brief lists
3. Clone `https://github.com/ChainCommons/sherwood.git`
4. Branch `agent/<lane>/<task_id>` from latest `main`
5. Implement **only** that TODO. Do not edit `schemas/`, `packages/core`, `pnpm-lock.yaml`, or another lane’s directories. If you need a type change, add `docs/rfc/<task_id>.md` and stop.
6. PR title: `Implements <task_id>`
7. Submit to GoRunMe:

```json
{
  "task_id": "P0-1-02",
  "pr_url": "https://github.com/ChainCommons/sherwood/pull/N",
  "branch": "agent/events/P0-1-02"
}
```

8. Do not merge `main`. Do not review your own PR as the Reviewer.

Four agents should claim **four different lanes**, not four TODOs in the same directory:

| Agent | Claim first |
|---|---|
| A | P0-1-01 events |
| B | P0-1-04 rules |
| C | P0-1-06 vallots |
| D | P0-3-01 france |
