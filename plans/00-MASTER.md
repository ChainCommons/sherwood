# Master plan — Open Crypto Tax Commons (Project Sherwood)

## 1. What this is

An open-source public knowledge and software infrastructure to help people **understand, reconstruct, document, and navigate** the tax consequences of crypto-economic activity.

It originates from tax problems of artists and builders on **Tezos**, but the architecture must not assume the taxpayer is an artist or that activity is NFT-related.

It is **not** primarily “calculate my crypto taxes.” It is forensic, accounting, and legal-research infrastructure.

Core invariant:

> Every material conclusion MUST be traceable through:
> **participant → capacity → facts → raw evidence → economic event → asset/position change → valuation → applicable rule version → authoritative source**
> and, where cost basis is relevant: **→ acquisition lot → cost-basis method → disposition calculation**

Prefer a transparent `UNKNOWN` over unsupported certainty.

## 2. Why it exists (mission)

Reduce unexpected, incorrect, or unmanageable tax liabilities caused by unclear/changing/missing/conflicting guidance, bad classification, volatile-asset payment, inadequate records, misunderstood wallet/chain activity, bad historical valuation, mis-treated compensation, assumed-universal NFT treatment, software that misses protocol/marketplace semantics, confusing later disposals with original income, missed cross-border or reporting obligations, multiple capacities, authority reconstruction differing from the taxpayer’s, or lack of early specialist advice.

Especially useful to independent creators, collectors, builders, and small organizations without institutional tax infrastructure.

## 3. Questions the system should answer

Not: “Your tax liability is €X.”

Instead:

- What actually happened?
- Which economic events matter?
- Which wallet transfers appear to be self-transfers?
- What was each asset worth at the relevant moment, and what evidence supports that?
- Which rule potentially applies, and what did it say **at the time**?
- Was that guidance actually published at the time? What changed later?
- Which assumptions did the software make? Which facts remain unknown?
- What interpretations are disputed? What documentation is missing?
- What should an accountant or lawyer review?
- Can every number be reproduced?

## 4. Four product surfaces

1. **Public Tax Knowledge Commons** — jurisdiction browsing, official-source registry, historical versions, machine-readable rules, human explanations, public cases/disputes, rule history, source diffs, maturity status, public APIs. No private taxpayer data.
2. **Tax Tools** — small NFTBiker-like utilities. One concrete question → one focused tool → inspectable result. Work without accounts where possible. Compose with workspace. Stable URLs. Reusable as libraries.
3. **Private Tax Workspace** — participant profile, wallet ownership, import, reconstruction, reconciliation, normalization, annotations, valuations, lots/positions, jurisdiction analysis, uncertainty review, evidence, professional exports. Private financial state **local by default**.
4. **Professional Review Layer** — review packs, calculation traceability, assumptions, provenance, rule/source refs, unresolved questions, corrections, reproducible snapshots. Facilitate professionals; do not attempt to eliminate them.

## 5. Who it serves

A participant may occupy multiple roles.

| ID | Class |
|---|---|
| U-001 | Artist / creator |
| U-002 | Crypto-native artist |
| U-003 | Collector |
| U-004 | Private investor |
| U-005 | Active trader |
| U-006 | Builder / founder |
| U-007 | Employee paid in crypto/tokens |
| U-008 | Contractor / protocol contributor |
| U-009 | DAO contributor |
| U-010 | Validator / baker / staker |
| U-011 | Marketplace / platform operator |
| U-012 | Small crypto-native business |
| U-013 | Accountant / tax adviser |
| U-014 | Tax lawyer |
| U-015 | Jurisdiction researcher |
| U-016 | Qualified professional reviewer |
| U-017 | Technical contributor |
| U-018 | Policy researcher / advocate |

Capacities (not the same as user class) are first-class on events: ARTIST, CREATOR, COLLECTOR, PRIVATE_INVESTOR, ACTIVE_TRADER, PROFESSIONAL_TRADER, FOUNDER, EMPLOYEE, CONTRACTOR, PROTOCOL_CONTRIBUTOR, DAO_CONTRIBUTOR, MARKETPLACE_OPERATOR, TOKEN_ISSUER, VALIDATOR, BAKER, MINER, STAKER, DELEGATOR, LIQUIDITY_PROVIDER, LENDER, BORROWER, BUSINESS_OWNER, DONOR, RECIPIENT, UNKNOWN. Capacity is user-correctable, date-sensitive, may stay UNKNOWN, and may carry multiple candidate interpretations.

## 6. Explicit non-goals (initial)

MUST NOT: present as tax adviser/accountant/law firm; guarantee legal correctness; silently file returns; silently communicate with authorities; generate aggressive avoidance; infer residency from IP; infer wallet ownership without confirmation/reliable evidence; treat AI as legal authority; treat social media as precedent; assume current rules applied historically; assume all NFTs identical; assume all transfers are disposals; assume all receipts are income; assume FIFO globally; require identity disclosure; store private keys; request seed phrases; centrally store complete financial histories by default; depend on one indexer, one pricing provider, or one AI provider.

## 7. Architectural invariants (INV-001–020)

| ID | Invariant |
|---|---|
| INV-001 | Raw evidence and derived interpretations remain separate |
| INV-002 | Technical blockchain transactions and economic events remain separate |
| INV-003 | Economic events and tax classifications remain separate |
| INV-004 | A participant may act in multiple capacities |
| INV-005 | Capacity may vary by event and time |
| INV-006 | Tax rules are temporally versioned |
| INV-007 | Every material tax rule cites sources |
| INV-008 | Source authority is explicit |
| INV-009 | Legal uncertainty is representable |
| INV-010 | Calculations are deterministic where practical |
| INV-011 | AI is subordinate to evidence and sources |
| INV-012 | Private financial data remains local by default |
| INV-013 | Jurisdiction logic is modular |
| INV-014 | Asset legal classification may vary by jurisdiction |
| INV-015 | One blockchain transaction may represent multiple economic events |
| INV-016 | One economic event may be evidenced by multiple data records |
| INV-017 | Tax lots and positions are distinct from raw transactions |
| INV-018 | Information-reporting treatment and substantive taxation are separate |
| INV-019 | Architecture remains useful to people who never use NFTs |
| INV-020 | Every material conclusion is inspectable and reproducible |

## 8. Interpretation pipeline

```text
RAW / TECHNICAL TRANSACTION
        ↓
   ECONOMIC LEGS
        ↓
   SEMANTIC EVENT
        ↓
   CLASSIFICATION (not automatic tax treatment)
        ↓
   VALUATION + LOTS / POSITIONS
        ↓
   RULES as-of date + SOURCES
        ↓
   FINDING (or UNKNOWN)
        ↓
   optional AI explanation / red-team
```

Never collapse: token right granted / vested / delivered / unlocked / sold. Never treat confirmed self-transfers as disposals. Never apply later guidance as if it existed at transaction time. REPORTABLE ≠ TAXABLE and NOT REPORTED ≠ NOT TAXABLE.

## 9. Proving ground vs architecture

- **Tezos** is the first full proving ground, not an architectural limitation. Feel native (artist, collector, mint, primary, secondary, royalty, marketplace, tez, FA2, baker, wallet, collection) then map into generic economic records.
- **France** is the first full jurisdiction pack, plus EU dependencies France needs. Do not hard-code France into the generic rule engine.
- **Artists** are a priority user group; root domain object is `Participant`.
- Existing commercial tax products are downstream consumers of cleaned data, not competitors to clone.

## 10. Implementation choices (not spec requirements)

These satisfy the spec; they can change if constraints remain met.

- TypeScript ESM monorepo (`pnpm` + Turborepo).
- JSON Schema canonical in `schemas/`; YAML authoring for jurisdictions/sources/rules/scenarios/cases; generated TS types; Ajv validation.
- Git-versioned knowledge (no CMS). Public API reads the same files.
- One web app (`apps/web`) with `/tools`, `/knowledge`, `/workspace` plus `apps/cli`.
- Local workspace: OPFS + SQLite (`wa-sqlite`); encrypted project-file export; no default cloud.
- Decimal money (`decimal.js`); native crypto precision; inspectable timezones.
- Tezos: `ChainProvider` with TzKT first, swappable. Marketplace adapters separate (OBJKT first).
- Valuation: multi-provider interface; never invent prices.
- AI optional, consented, grounded; fail closed.
- Licenses: Apache-2.0 code; separate content license; respect third-party source rights.
- CI: GitHub Actions.

## 11. Phasing

**Phase 0 — Repo, schemas, CI.** Architecture before UI.

**Phase 1 — Deterministic core.** Evidence, events, sources, rules, valuation, lots, findings, snapshots.

**Phase 2 — Tezos proving ground.** Adapter, NFT/marketplace decode, CSV import, reconciliation, XTZ valuation.

**Phase 3 — France/EU knowledge + Tax Tools 001–013.** Tool-first public site.

**Phase 4 — Workspace, professional export, AI prototype.**

**Calendar, TODO IDs, and staffing:** [23-implementation.md](23-implementation.md). Target MASTER (P0) complete **2027-02-20** from a 2026-09-08 start (24 weeks, 2-engineer + researcher default).

**Multi-agent / multi-provider split:** [24-multi-agent.md](24-multi-agent.md) and [agents/](agents/README.md). Shared contracts first; then parallel lanes with exclusive directories; author and reviewer from different providers.

**P1 / P2** — see [21-p1-p2.md](21-p1-p2.md). Do not pull them into P0.

P0 is complete only when all 54 items in spec §102 and acceptance tests AC-001–015 exist. Primary and secondary demonstration scenarios (§§113–114) are the narrative definition of done.

## 12. Workstreams (parallel after contracts)

| ID | Name | Detailed plans |
|---|---|---|
| A | Schemas and domain model | 02, 03, 04 |
| B | Public knowledge system | 05 |
| C | Rule engine | 05, 17 |
| D | Tezos data | 07 |
| E | Valuation | 06 |
| F | Lots and accounting | 04 |
| G | Tax Tools | 08, 18 |
| H | Private workspace | 09 |
| I | AI | 11 |
| J | Exports/interoperability | 13 |
| K | France content | 15 |
| L | QA/security | 12, 16, 17, 20 |

Shared interfaces MUST be defined before independent agent work. See [22-architecture-workstreams.md](22-architecture-workstreams.md).

## 13. Success condition

A participant who was active years ago (created art, collected, received tokens, used multiple wallets, is unsure they treated everything correctly) can receive a reconstruction that states what happened economically, what came from evidence vs confirmation vs inference vs unknown, historical values, lots, historically applicable rules vs later guidance, conflicts, missing records, calculations, sources, professional-judgment questions — and every conclusion can be inspected.

## 14. Product maxims

1. Do not build another black-box crypto tax calculator.
2. Reconstruct the economics before applying tax law.
3. Historical rules and historical guidance are first-class data.
4. Unknown is better than confidently wrong.
5. Open-source the research and tools; protect private taxpayer data.
6. Build small useful tools as well as deep workflows.
7. Tezos is the proving ground, not an architectural limitation.
8. Artists are a priority user group, not the root domain object.
9. AI explains, searches, classifies and challenges; sources and deterministic computation remain authoritative.
10. Every important number and conclusion must be reproducible.

## 15. Planner constraints (spec §111)

Treat MUST/MUST NOT as constraints. Separate product requirements from implementation choices. Decompose P0 into epics. Identify schema dependencies. Establish stable package/API contracts. Define ownership boundaries. Produce automated acceptance tests. Build shared core before duplicative tools. Preserve Tezos-first usability without hard-coding Tezos into generic models or France into the rule engine. Preserve local-first privacy. Rules and sources are versioned data with provenance. Prefer deterministic calculations. AI consumes structured evidence. Expose unsupported functionality honestly. Optimize for composability. Tax Tools are first-class. Plan for professional reviewers and community maintainers from the beginning.
