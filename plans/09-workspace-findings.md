# 09 — Private Tax Workspace, findings, explainability

**Spec:** §§6.3, 50–52, 93–94  
**Workstream:** H  
**Depends on:** 02–07, 05, 08 (optional handoff)  
**Unblocks:** professional export, AI inputs, primary demo  
**Code:** `apps/web/app/workspace`, `packages/findings`, local DB

## Workspace provides

- participant profile
- wallet/account ownership
- raw-data import
- blockchain reconstruction
- transaction reconciliation
- economic-event normalization
- user annotations
- valuations
- lots/positions
- jurisdiction analysis
- uncertainty review
- evidence storage
- professional exports

Private financial state local by default (plan 12). Core analysis MUST NOT require an account.

## Tax Situation Explorer (§50)

Guided workflow asking **facts, not tax jargon**:

- Where were you tax resident?
- Personally or through an entity?
- What activities? Create/sell art? Collect?
- Paid in cryptocurrency? Later sell/swap those assets?
- Tokens for work? Stake/bake?
- Which wallets/accounts belong to you?
- Which tax period?

Answers write participant/capacity/ownership/period filters. Never infer silently.

## Finding format (§51)

```yaml
finding_id:
participant:
capacity:
event_refs: []
rule_refs: []
source_refs: []
jurisdiction:
issue:
status: relevant | potentially_relevant | not_relevant | unknown
calculation:
assumptions: []
missing_facts: []
valuation_refs: []
certainty:                 # legal/source certainty
explanation:
professional_review_recommended: boolean
generated_at:
engine_version:
rule_pack_version:
```

No material legal conclusion displayed without rule/source refs (AC-001). Unsupported → `UNKNOWN` (AC-003).

## Explainability (§52)

Each material finding MUST support this trace (UI accordion or equivalent):

```text
FACTS → RAW EVIDENCE → ECONOMIC EVENT → CAPACITY → VALUATION
  → ASSET LOT/POSITION → RULE → SOURCE → CALCULATION → RESULT / UNCERTAINTY
```

MUST NOT require trust in hidden model reasoning. AI text is extra, not the trace.

## Analysis snapshots (§93)

Every saved analysis records:

```text
participant/profile version
ledger version
ownership mappings
jurisdiction-pack version
rule versions
valuation methodology
price dataset refs
lot method
engine version
analysis date
```

Enables AC-006 reproduction: given snapshot + engine version, rerun equals stored findings (or explicit engine-diff).

## UI principles in workspace (§94)

- Tool-first entry (can start from a tool result)
- Evidence-first
- Low-friction, non-accountant understandable
- Transparent, progressive complexity
- Avoid dashboards of unexplained tax numbers
- Prefer “Potential issue detected” over “You owe €X” unless calculation is deterministic and sourced

Screens (P0):

1. Project home (local projects list)
2. Situation explorer
3. Wallets & ownership
4. Ledger (raw vs events toggle)
5. Tagging / corrections
6. Valuations review (misses first)
7. Lots
8. Findings + explainability
9. Gaps / health (reuse TOOL-009)
10. Snapshot + export

## Local data architecture

- SQLite in OPFS: tables for evidence, blobs (hash), technical_txs, legs, events, annotations, valuations, lots, findings, snapshots, ownership
- Encrypted project file export (`.octc` or similar): sqlite dump + blob pack
- Incremental processing (§91): ingest new ops only; 100k+ events target (plan 17)

## Implementation tasks

1. Findings schema + builder from rules-engine output.
2. Explainability view model mapping finding → trace sections.
3. Snapshot serialize/deserialize + reproduce test.
4. Situation explorer wizard.
5. Event correction: new annotation layer; never overwrite evidence.
6. Wire “Open in Workspace” from tools.

## Acceptance

- AC-001, AC-003, AC-006, AC-008, AC-009, AC-010, AC-014
- Primary demo path §113 runnable locally
