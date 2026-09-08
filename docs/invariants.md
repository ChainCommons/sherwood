# Invariants

The twenty invariants from [plan 01](../plans/01-product-philosophy-constraints.md)
are the properties that must hold no matter what else changes. This file is the
map from each one to the test that enforces it, so "we still honour INV-013" is
a claim CI can check rather than a claim a reviewer has to take on trust.

**Status legend**

- **enforced** — a test fails today if the invariant is broken
- **guarded** — the mechanism is tested, but the code it guards is not written yet
- **planned** — the enforcing test arrives with the package named in *Lands with*

| ID | Invariant | Status | Enforced by | Lands with |
|---|---|---|---|---|
| INV-001 | Evidence tables are append-only; interpretations live in derived tables | guarded | `tests/contracts/contracts.test.ts` (evidence carries an immutable `content_hash`; corrections are annotations) | `packages/evidence` |
| INV-002 | `technical_transaction` type is not `semantic_event` type | enforced | `tests/contracts/contracts.test.ts` — "keeps technical transactions free of semantic event types" | — |
| INV-003 | `classification` is separate from `event_type`; tax effects come only from the rules engine | enforced | `tests/contracts/contracts.test.ts` — "separates classification from event_type"; `schemas/event/semantic-event.schema.json` | — |
| INV-004 | Capacity sits on the event, not only on the participant | enforced | `schemas/event/semantic-event.schema.json` requires `capacity` on the event | — |
| INV-005 | Capacity is date-sensitive | enforced | `schemas/common.schema.json` `capacity.as_of`; `tests/contracts/contracts.test.ts` | — |
| INV-006 | Rules require `sources[]` | enforced | `packages/validate/src/checks/knowledge.ts`; `packages/validate/test/checks.test.ts` | — |
| INV-007 | Rules require `effective_*` and `published_from` | enforced | `packages/validate/src/checks/temporal.ts`; schema `required` | — |
| INV-008 | Rules require `authority_status` | enforced | `schemas/rule/rule.schema.json` `required` | — |
| INV-009 | Certainty enum plus competing interpretations | enforced | `checks/knowledge.ts`; `schemas/rule/interpretation.schema.json` | — |
| INV-010 | Pure functions and versioned snapshots | guarded | `schemas/snapshot/snapshot.schema.json`; contract test asserts engine version, lot method, rounding and timezone are recorded | `packages/findings` (AC-006 rerun test) |
| INV-011 | The AI package cannot import into the approved rule set | enforced | `packages/validate/src/checks/imports.ts`; `tests/invariants/imports.test.ts` | — |
| INV-012 | Workspace storage is local; network calls are explicit | planned | — | `apps/web` workspace, `packages/evidence` |
| INV-013 | Jurisdiction packs are data directories, not `if (france)` | enforced | `checks/imports.ts`; `tests/invariants/imports.test.ts` — rejects `jurisdictions/france` in either engine | — |
| INV-014 | `legal_classification` lives on jurisdiction-specific records, not on the global asset | enforced | `schemas/asset/asset.schema.json` has no legal class; `schemas/asset/legal-classification.schema.json` is per jurisdiction | — |
| INV-015 | The event engine returns `event[]` per operation | guarded | `schemas/event/semantic-event.schema.json` (events reference legs, one tx may yield several) | `packages/event-engine` |
| INV-016 | `source_evidence` is an array | enforced | `tests/contracts/contracts.test.ts`; `minItems: 1` in the technical-tx, leg and event schemas | — |
| INV-017 | Lots and positions are distinct from events | enforced | `schemas/lot/lot.schema.json` and `schemas/position/position.schema.json` reference events rather than extending them | — |
| INV-018 | `reporting_rule` is a separate schema from tax `rule` | enforced | `schemas/rule/reporting-rule.schema.json` exists as its own file with its own id | — |
| INV-019 | Generic crypto events exist without NFT types | enforced | `tests/invariants/enum-parity.test.ts` — "keeps generic crypto events" | — |
| INV-020 | A finding needs its explainability trace before display | enforced | `tests/contracts/contracts.test.ts` — "carries an explainability trace"; `finding.schema.json` requires a relevant finding to cite rules and sources | — |

## Acceptance tests

[Plan 17 §105](../plans/17-quality-integrity.md) lists AC-001 to AC-015 as CI
gates. Wave 0 covers the ones that are properties of the schemas and fixtures;
the rest arrive with the engines that can exercise them.

| AC | Requirement | Wave 0 status |
|---|---|---|
| AC-001 | No material legal conclusion without rule/source refs | enforced — `finding.schema.json` requires `rule_refs` and `source_refs` when `status` is `relevant` |
| AC-002 | A 2021 transaction cannot silently use guidance published in 2025 | enforced — `checks/temporal.ts` requires `published_from` and warns when it postdates `effective_from` |
| AC-003 | Unsupported treatment can resolve `UNKNOWN` | enforced — contract fixture resolves `UNKNOWN`; every consequential enum contains it |
| AC-004 | A confirmed self-wallet transfer is not automatically a sale | guarded — `SELF_TRANSFER` exists and confirmed ownership is modelled; behaviour lands with `packages/event-engine` |
| AC-005 | Every historical valuation exposes provider, timestamp, method | enforced — schema `required` plus the contract test, with `valuation-miss` for the no-price case |
| AC-006 | A saved analysis reproduces from recorded versions | guarded — snapshot schema and fixture; rerun test lands with the engines |
| AC-007 | AI explanations are grounded in structured facts | planned — `packages/ai` |
| AC-008 | Wallets can be analysed without an account or a full upload | planned — `apps/web` |
| AC-009 | Manual correction never destroys imported evidence | guarded — annotations are a separate record type; store lands with `packages/evidence` |
| AC-010 | Artist, collector and builder activity coexist | enforced — capacity carries `secondary` and `candidates`; fixture exercises both |
| AC-011 | Two competing interpretations coexist | enforced — `interpretation.schema.json`, `finding.competing_interpretations` |
| AC-012 | A blockchain operation is not automatically a taxable event | enforced — INV-002 test; failed operations are evidence, not events |
| AC-013 | Several P0 tools are useful without the full workspace | planned — `apps/web` |
| AC-014 | An accountant can inspect facts, classifications, valuations, rules and sources separately | guarded — the trace is structured per step in `finding.schema.json` |
| AC-015 | Tezos primary, secondary, royalties, fees and self-transfers decode as such | guarded — the contract fixture is exactly this split; decode lands with `adapters/tezos` |

## Regression corpus

[Plan 16 §88](../plans/16-repository-ci.md) requires every significant bug to
become a permanent test. Two of the eight seeds are already covered by Wave 0
fixtures; the rest need the engines before they can fail meaningfully.

| Bug | Covered by |
|---|---|
| Self-transfer treated as a sale | wallet-ownership fixture (`AC-004`), pending `event-engine` |
| Royalty treated as a primary sale | contract test — legs split gross, fee and royalty |
| Marketplace fee duplicated | contract test — net reconciles to gross minus fee minus royalty |
| Token compensation treated as a gift | `TOKEN_GRANT`/`TOKEN_VESTING`/`TOKEN_UNLOCK` kept distinct (enum-parity test) |
| Wrong timezone | `packages/core/test/time.test.ts` — 23:30 UTC on 31 December is 1 January in Paris |
| Current rule applied historically | `checks/temporal.ts` publication-vs-effective warning |
| Cost basis matched incorrectly | pending `packages/lots` |
| Current NFT guidance assumed to exist historically | `checks/temporal.ts`, pending the France pack |
