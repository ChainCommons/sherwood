# 01 — Product philosophy and constraints

**Spec:** §§1–8  
**Depends on:** nothing  
**Unblocks:** all other plans  
**P0:** encode these as repo docs, UI copy, and CI/lint culture — not as afterthoughts

## Product requirements (not implementation)

Build forensic reconstruction infrastructure. Do not ship a black-box liability number as the primary UX.

The four surfaces (Knowledge Commons, Tax Tools, Private Workspace, Professional Review) are all in P0. Tools and knowledge must deliver value without forcing workspace setup. Workspace must not require an account. Knowledge must not require private data.

## Non-goals — encode as product tests and UI copy

| Non-goal | Implementation implication |
|---|---|
| Not a tax adviser | `DISCLAIMER.md`; every findings UI shows disclaimer; no “file for me” |
| No guaranteed correctness | Findings carry certainty; `UNKNOWN` is a valid terminal state |
| No silent filing / authority comms | No e-file, no DGFiP/IRS APIs in P0–P1 |
| No aggressive avoidance | No “minimize tax” optimizer; red-team may show adverse readings |
| No IP-based residency | Residency is user-declared or unknown |
| No inferred wallet ownership | Ownership is `UNKNOWN` until user confirmation or strong evidence + confirmation |
| AI is not authority | AI outputs labeled; cannot write approved rules |
| Social media is not precedent | Case `precedential_status` includes `anecdotal` / `allegation_only` |
| No anachronistic rules | Temporal source model (plan 05); AC-002 |
| NFTs not universal | Event types + jurisdiction classification (plans 03, 04, 15) |
| Transfers ≠ disposals | Event engine + AC-004, AC-012 |
| Receipts ≠ income | Artist Revenue Explorer MUST NOT auto-tax receipts |
| FIFO not global | Lot engine method is an input (plan 04) |
| No identity requirement | Tools work on public addresses; workspace identity optional |
| No keys/seeds | Wallet input = public address only (plan 12) |
| No central ledger by default | Local SQLite/OPFS (plan 09, 12) |
| No single vendor lock-in | Adapter and provider interfaces (plans 06, 07, 11) |

## Invariants — engineering checklist

Each invariant needs a test or structural guarantee:

- INV-001: evidence tables append-only; interpretations in derived tables
- INV-002: `technical_transaction` type ≠ `semantic_event` type
- INV-003: `classification` field separate from `event_type`; tax effects only from rules engine
- INV-004/005: capacity on event, not only on participant; date-sensitive
- INV-006/007/008: rules require `sources[]`, `effective_*`, `published_from`, `authority_status`
- INV-009: certainty enum + competing interpretations (plan 05, 19)
- INV-010: pure functions + snapshot versions (plan 17)
- INV-011: AI package cannot import as writer into rules-engine approved set
- INV-012: workspace storage local; network calls explicit
- INV-013: jurisdiction packs are data directories, not `if (france)`
- INV-014: `legal_classification` lives on jurisdiction-specific records, not on global `asset`
- INV-015: event engine returns `event[]` per operation
- INV-016: `source_evidence` is an array
- INV-017: lots/positions tables distinct from events
- INV-018: `reporting_rule` schema separate from tax `rule` (plan 10)
- INV-019: generic crypto events exist without NFT types
- INV-020: finding explainability trace required before display (plan 09)

## User classes — P0 coverage

Must be *representable* in the participant/capacity model in P0 even if tools emphasize artists/collectors/builders:

- P0 demo-critical: U-001, U-002, U-003, U-006, U-010, U-011, U-012, U-013
- Representable via capacity/events: U-004, U-005, U-007, U-008, U-009
- Contributor/reviewer roles: U-015–U-018 (governance, plan 19)

## Implementation tasks

1. Write `DISCLAIMER.md`, `PRIVACY.md`, `README.md` product positioning from this plan (not “crypto tax calculator”).
2. Add a `docs/invariants.md` mapping INV-* to tests.
3. Add UI strings: “not tax advice”, “UNKNOWN”, “later guidance”, “unconfirmed ownership”.
4. Lint/CI: forbid requesting seed/private key in any app string and any form field name.
5. Architecture tests: packages `rules-engine` and `event-engine` have no imports from `adapters/tezos` or `jurisdictions/france`.

## Acceptance

- README and first-run UI do not promise a liability number as the product.
- A user can use at least several Tax Tools with only a public address (AC-008, AC-013).
- Running analysis never requires identity documents.
