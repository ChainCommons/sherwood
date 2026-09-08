# 25 — GoRunMe kickoff and agent coordination

**Repo:** https://github.com/ChainCommons/sherwood  
**GoRunMe role:** claim/lease scheduler + prompt packs + accept/reject ledger  
**GitHub role:** branches, PRs, merge, CI  
**Sherwood plans:** [23](23-implementation.md) TODOs, [24](24-multi-agent.md) lanes, [agents/](agents/README.md) briefs

Paste [gorunme/PROMPT-FOR-GORUNME-AGENT.md](gorunme/PROMPT-FOR-GORUNME-AGENT.md) into the GoRunMe agent.

Paste [gorunme/PROMPT-FOR-STEWARD.md](gorunme/PROMPT-FOR-STEWARD.md) into the first coding agent (Wave 0). Do **not** start four implementers until that PR is merged.

Wave 1 worker packets are [gorunme/PROMPT-FOR-LANE-AGENT.md](gorunme/PROMPT-FOR-LANE-AGENT.md) plus one `plans/agents/lane-*.md`.

## Who does what

```text
GoRunMe                          GitHub (sherwood)                 Human steward
────────                         ─────────────────                 ─────────────
list / claim / lease             clone, branch, commit             merge to main
prompt pack (read-only)          PR titled Implements P0-…         accept/reject in GoRunMe
result = {task_id, pr_url}       CI on the PR                      Reviewer agent on the PR
leaderboard / VDP attribution    CODEOWNERS + lockfile             RFC for schema changes
```

Agents **do not** coordinate by chatting with each other. They coordinate by:

1. **Exclusive claim** in GoRunMe (FIFO + lease) — two agents cannot hold the same `task_id`
2. **Directory ownership** — even without a claim, they must not edit another lane’s paths ([24](24-multi-agent.md))
3. **One PR per TODO** on `agent/<lane>/<task_id>`
4. **Steward-only merge to `main`**
5. **Reviewer from a different provider** than the author ([agents/lane-reviewer.md](agents/lane-reviewer.md))

## Sequence (this week)

| Order | Agent | Where | Work |
|---|---|---|---|
| 1 | GoRunMe platform | GoRunMe repo/staging | Seed campaign, result schema `{task_id, pr_url, branch}`, Mode 1 API |
| 2 | Steward (one coding agent) | this repo | Wave 0 `P0-0-01`…`P0-0-10` — schemas, CI, contract JSON |
| 3 | Four lane agents | this repo, after #2 merges | Wave 1: Events, Rules, ValLots, France — one lane each |
| 4 | Reviewer | GitHub PRs | Other provider; no feature work |

Wave 0 is **not** a public donor wave. Publish Wave 1 tasks as `blocked` or unpublished until `main` has schemas.

## Result JSON (GoRunMe submit)

```json
{
  "task_id": "P0-1-02",
  "pr_url": "https://github.com/ChainCommons/sherwood/pull/N",
  "branch": "agent/events/P0-1-02"
}
```

No source code in the GoRunMe result blob.

## If GoRunMe is not ready

Use GitHub Issues as the claim board: one issue per `task_id`, label `lane:*`, assignee = claim. Same branch/PR rules. GoRunMe can import those issues later. Task list: [gorunme/tasks-wave0.yaml](gorunme/tasks-wave0.yaml), [gorunme/tasks-wave1.yaml](gorunme/tasks-wave1.yaml).
