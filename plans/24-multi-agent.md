# 24 — Splitting P0 across multiple agents and providers

**Use with:** [23-implementation.md](23-implementation.md) TODO IDs, [22-architecture-workstreams.md](22-architecture-workstreams.md) packages  
**Paste-ready briefs:** [agents/](agents/README.md)

This is how to run Sherwood with several coding agents that do **not** share a context window and may be from **different providers** (Cursor, Claude, GPT, Gemini, local, etc.).

The spec already requires this shape: shared contracts first, then parallel workstreams that must not duplicate valuation, lots, events, rules, or source lookup.

## 1. Do not start with twelve agents

Agents collide on `package.json`, schemas, and “helpful” rewrites of each other’s engines. Use **waves**. Only the Steward may touch shared contracts after Phase 0.

```text
Wave 0  (1 agent)   Steward: Phase 0 freeze
Wave 1  (4 agents)  Events | Rules engine | Valuation+lots | France YAML
Wave 2  (2 more)    Tezos adapters | QA/acceptance fixtures
Wave 3  (2 more)    Tax Tools UI | Knowledge UI
Wave 4  (2 more)    Workspace+privacy | Exporters/CLI
Wave 5  (2)         AI prototype | Demo/gate
```

Maximum useful concurrency after Wave 0: **about 4–6 implementation agents + 1 steward + 1 reviewer**. More than that spends time merging.

## 2. Roles (provider-agnostic)

| Role | Count | Job | May write | Must not write |
|---|---|---|---|---|
| **Steward** | 1, persistent | Phase 0, interface RFCs, merge, lockfile, CI, `analyze()` facade | `schemas/`, `packages/core`, root CI, `pnpm-lock.yaml` | France doctrine, OBJKT heuristics, tool CSS |
| **Reviewer** | 1, different provider from author | PR review, invariant/AC check | comments, failing tests only | the author’s package |
| **Lane agents** | 1 per lane below | Implement TODOs in owned dirs | owned paths only | other lanes’ dirs, schemas (unless RFC) |
| **France researcher** | 1 human + 1 citing agent | Sources, dates, UNKNOWN | `jurisdictions/france`, `jurisdictions/eu` | `packages/rules-engine` internals |

**Author and Reviewer should be different providers.** That is the main benefit of multi-provider: citation and invariant bugs the author-model will miss.

Suggested pairing (swap freely; the *role* matters more than the brand):

- Steward: strongest long-context / repo agent you have
- Reviewer: a second provider, instructed only to find spec violations
- France lane: model that follows “cite or UNKNOWN”; Reviewer red-teams citations
- Tezos/OBJKT: model good at reading API JSON and writing golden fixtures
- Tools UI: frontend-capable model
- Core engines: careful typed-logic model

## 3. Isolation mechanism (this is the split)

### Directory ownership

After Wave 0, each lane gets exclusive write access. Encode in `CODEOWNERS` (Steward adds this in P0-0-01).

| Lane | Owned paths | Plans | TODO prefix |
|---|---|---|---|
| Steward | `schemas/`, `packages/core`, `packages/validate`, `.github/`, root config | 16, 19, 22 | `P0-0-*` |
| Events | `packages/evidence`, `packages/event-engine`, `packages/positions` | 03, 04 (positions) | `P0-1-01`, `P0-1-02`, `P0-1-03`, `P0-1-08` |
| Rules | `packages/source-registry`, `packages/rules-engine` | 05 | `P0-1-04`, `P0-1-05` |
| ValLots | `packages/valuation`, `packages/lots` | 04, 06 | `P0-1-06`, `P0-1-07` |
| Findings | `packages/findings` | 09 (engine only) | `P0-1-09`, `P0-1-10` |
| Tezos | `adapters/tezos`, `adapters/marketplaces`, `adapters/csv`, `packages/reconciliation` | 07 | `P0-2-*` |
| France | `jurisdictions/france`, `jurisdictions/eu`, `jurisdictions/*/RESEARCH.md` | 15 | `P0-3-01`–`08` |
| Scenarios | `scenarios/`, `tests/synthetic-ledgers/` | 14 | `P0-1-12`, `P0-G-01/02` |
| Tools | `apps/web/app/tools`, `packages/tools` | 08, 18 | `P0-3-09`–`25` |
| KnowledgeUI | `apps/web/app/knowledge` | 05, 18 | `P0-3-24` |
| Workspace | `apps/web/app/workspace`, `packages/workspace` | 09, 12 | `P0-4-01`–`08`, `11`, `14` |
| Export | `packages/exporters`, `apps/cli` | 13 | `P0-1-11`, `P0-4-09`, `P0-3-22/23` |
| AI | `packages/ai` | 11 | `P0-4-12` |
| QA | `tests/acceptance`, `tests/regression` | 17, 20 | `P0-1-13/14`, `P0-G-03` |

If two lanes need the same file, **they do not edit it**. They open an RFC issue; Steward merges the interface change; lanes consume the new export.

### Git

```text
main                    # only Steward merges
agent/<lane>/<todo-id>  # e.g. agent/tezos/P0-2-04
```

- One TODO ID per PR when possible; never mix France YAML and TypeScript engines in one PR.
- Rebase on `main` daily; do not merge lane-to-lane.
- `pnpm-lock.yaml` and root `package.json`: Steward-only. Lanes add deps by asking Steward (issue template).

### Contract between lanes = types + golden JSON

Lanes do not call each other’s internals. They depend on:

1. Generated types from `schemas/` (frozen after Wave 0)
2. Public `src/api.ts` of each package
3. Golden fixtures in `tests/contracts/` that Steward owns:

```text
tests/contracts/
  technical-tx.example.json
  marketplace-objkt.example.json
  semantic-event.example.json
  valuation.example.json
  finding.example.json
```

Tezos lane **emits** `technical-tx` + marketplace overlay. Events lane **consumes** those shapes. If a fixture would change, that is an RFC.

## 4. Kickoff packet (what you paste into each provider)

Every agent gets the **same preamble** plus **one lane brief**. Files in [`agents/`](agents/README.md).

Preamble always includes:

- You are not a tax adviser; prefer `UNKNOWN`
- Read listed plan files only; `INITIAL_PROMPT.md` wins on MUST/MUST NOT
- Owned paths / forbidden paths
- TODO IDs in scope
- Do not invent France doctrine
- Do not request keys/seeds
- Do not reimplement valuation/lots/events/rules/sources
- Open a contract RFC instead of editing `schemas/` or `packages/core`

Handoff out of an agent: PR description with `Implements P0-x-yy`, fixture paths, leftover unknowns.

## 5. Review protocol (use the other provider here)

Reviewer agent prompt: read the PR diff + the lane’s plan + AC list. Fail the review if:

- Tax classification happens in an adapter
- A rule has no `sources[]`
- Evidence is mutated
- FIFO is hardcoded globally
- Later guidance is applied as contemporaneous
- Seed/key UI appears
- A tool reimplements an engine

Steward merges only after Reviewer (different provider) or a human + CI.

## 6. Wave schedule mapped to calendar

| Wave | When (plan 23) | Agents alive |
|---|---|---|
| 0 | W1–W2 | Steward only (+ P0-L-01 reviewer search) |
| alpha | W3–W8 | Slice pair (decode + Time Machine content); Reviewer; P0-L-02 counsel. **Not** four engine lanes. |
| 1+ | W9+ (TBD after P0-A-06) | Events, Rules, ValLots, Tezos, Tools — re-opened after the slice teaches the contracts |

France (K) is the only lane that stays up from Wave 1 through Wave 3. Do not put France and Tezos on the same agent: different skills, zero file overlap, and mixing them produces invented tax-from-chain.

## 7. Practical provider setup

Each provider needs its own checkout or worktree of the **same git remote**.

```text
git worktree add ../sherwood-tezos -b agent/tezos/P0-2-01
git worktree add ../sherwood-france -b agent/france/P0-3-01
```

Give that agent:

1. `plans/agents/PREAMBLE.md`
2. `plans/agents/lane-<name>.md`
3. The numbered plans listed in the lane brief (not the whole 4419-line spec unless Steward)
4. Current `tests/contracts/` examples

Do **not** dump `INITIAL_PROMPT.md` into every agent. Steward and Reviewer may use it; lane agents use the sliced plans (03, 07, 15, …).

Cursor / Claude Code / Codex / Gemini CLI all work as lane agents if they respect owned paths. Run Steward in the primary repo checkout.

## 8. Failure modes

| Failure | Fix |
|---|---|
| Two agents rewrite `event-engine` | CODEOWNERS + Reviewer reject |
| Tools copy-paste valuation | Reviewer; Steward deletes duplicate |
| France agent writes CGI from memory | Reviewer requires URL + publication date or UNKNOWN |
| Lockfile wars | Steward-only |
| Interface drift | Frozen schemas; RFC for changes |
| Agents idle waiting on Steward | Steward’s job in Wave 1+ is merge/RFC, not features |

## 9. Default orchestration (until there are many humans)

Use **this** section, not the twelve-lane wave chart, as the operating plan:

- Provider A = Steward + events/valuation slice (can be sequential)
- Provider B = France YAML + Reviewer on A’s PRs (different provider)
- After P0-alpha: A does Tezos/HEN, B does Time Machine content; they review each other

Keep directory ownership and RFCs for *shared contract fixtures*. Do not freeze every internal schema.

**GoRunMe** is an optional overlay for donated-inference experiments. Sherwood Wave 0 / P0-alpha MUST proceed if GoRunMe is down. Do not block TypeScript on claim/lease infrastructure.

## 10. Minimum viable two-provider split

Same as §9. That is already most of the parallelism that matters (code vs sourced legal data).
