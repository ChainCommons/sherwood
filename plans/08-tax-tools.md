# 08 — Tax Tools

**Spec:** §§44–49, 53–54, 110 (P1 tools also §46)  
**Workstream:** G  
**Depends on:** core packages (03–07, 05 for 010/011)  
**Unblocks:** public web, AC-013  
**Code:** `apps/web/app/tools/*` thin UI; logic only in packages

## Product rules

- Dedicated Tax Tools surface
- MUST NOT require full workspace setup
- Independently useful where practical
- One concrete question → one focused tool → inspectable result
- Stable URL per tool
- Reusable as library/component
- No mandatory registration
- Local state
- Evidence links, assumptions visible, CSV/JSON export
- Copyable/shareable summaries (without leaking unrelated wallet history)
- Optional “Open this result in Workspace”
- Independent tools MUST NOT implement conflicting duplicate tax logic (§48, §107)

## UX for every tool (§47)

Clear single purpose; minimal input; avoid jargon; expose source data where lawful.

Public homepage prominently lists tools (§110). Users arrive from search engines and use one tool immediately.

## Composability (§48)

```text
Historical Valuator → valuation engine
Wallet Timeline → Tezos adapter + semantic events + valuation
Evidence Pack → event engine + rule engine + valuation + source registry
```

## Public operations (§49) — library API used by tools and third parties

`decode transaction | normalize wallet history | historical valuation | identify self transfers | query rules | query rules as-of date | retrieve source | retrieve source history | calculate tax lots | explain finding`

## P0 tools (MUST all exist for P0 complete)

### TOOL-001 Wallet Tax Timeline

**In:** public wallet address; optional date range  
**Out:** economically meaningful activity by chronology and tax year; totals; unresolved activity; evidence links  
MUST distinguish raw transfers from interpreted events.

### TOOL-002 Historical Asset Valuator

**In:** tx hash and/or block and/or timestamp, asset, quantity  
**Out:** historical value in selected fiat; provider; methodology; timestamp resolution; alternative valuations  
Shareable without unrelated wallet history.

### TOOL-003 Tezos Transaction Explainer

**In:** operation hash  
**Out example:** OBJKT secondary sale; collector paid 100 XTZ; seller 87.5; royalty 10; marketplace 2.5; timestamp; block; historical EUR; evidence  
MUST distinguish economic interpretation from tax treatment.

### TOOL-004 NFT Sale / Purchase Reconstructor

**In:** NFT identifier, wallet, and/or transaction  
**Out:** acquisition, disposal, gross consideration, marketplace fees, royalties, payment asset, contemporaneous fiat valuation

### TOOL-005 Artist Revenue Explorer

**In:** artist wallet(s), period  
**Out categories:** primary sales, royalties, commissions, collaboration splits, grants, gifts, unknown receipts, self-transfers  
MUST NOT automatically call all receipts taxable income.

### TOOL-006 Collector Activity Explorer

**Out:** acquisitions, disposals, gifts, transfers, fees, acquisition values, disposal values, potential cost-basis chains

### TOOL-007 Linked Wallet / Self-Transfer Mapper

User marks wallets as self/related. Identifies likely internal transfers. MUST require confirmation before ownership is authoritative.

### TOOL-008 Transaction Tagger

Manual/bulk categorization: `art income | royalty | purchase | sale | self transfer | gift | compensation | staking reward | fee | loan | unknown`  
Original evidence unchanged.

### TOOL-009 Tax Data Health Check

Example: N events analyzed; classified vs missing valuation vs suspected duplicates vs unresolved counterparties vs probable self-transfers vs ambiguous marketplace. Prioritize by materiality (value × uncertainty).

### TOOL-010 Guidance Time Machine

**In:** jurisdiction, activity, date/tax year  
**Out:** official sources available by that date; rules applicable at that date; later publications separately; unresolved gaps; source authority  
Example: France / NFT artist / 2021

### TOOL-011 Rule Diff

**In:** jurisdiction, topic, date A, date B  
**Out:** changed source language, rule version, thresholds, newly issued guidance, resolved/unresolved ambiguity  
Derived from source/rule history.

### TOOL-012 Evidence Pack Generator

Inspectable package: chronology, tx refs, valuations, provenance, classifications, assumptions, uncertainties, relevant rules, sources, calculation tables (see also plan 13 professional pack).

### TOOL-013 External Tax Software Exporter

Normalized activity for third parties. P0: robust generic CSV (+ JSON). Vendor-specific mappings later. Complement existing tax software.

## P1 tools (§46, §53–54) — do not implement in P0 unless leftover capacity

- Portfolio Cost Basis Explorer
- Crypto Income Explorer
- Builder Compensation Timeline (grant → vest → receipt → unlock → sale)
- Staking/Baking Explorer
- Tax-Lot Visualizer
- Marketplace Reconciliation Tool
- Missing Records Detector
- Tax Authority Report Reconciler
- Cross-Jurisdiction Activity Explorer
- Tax Letter Deadline Navigator
- **“Before I do this…”** (§53): prospective French artist selling 100,000 XTZ → records to preserve, timestamp, valuation evidence, invoice, buyer/customer facts, rights transferred, registrations, marketplace records, subsequent asset tracking, questions for a professional. Prevent future recordkeeping failures.
- **Recordkeeping assistant** (§54): flag missing invoice, customer-location evidence, contemporaneous fiat value, contract/rights docs; prospective and retrospective.

## Implementation tasks

1. Shared tool shell: input, assumptions panel, evidence drawer, export buttons, disclaimer, “open in workspace”.
2. One route per tool; SEO title/description.
3. Each tool is a function in a package (`packages/tools/...` or direct core calls) with golden tests; UI is a wrapper.
4. Share links for TOOL-002/003 encode query params (hash, asset, qty) not full ledgers.
5. TOOL-007/008 persist to local workspace if present, else `localStorage` ephemeral with warning.
6. Homepage tool index (§110).

## Acceptance

- AC-013 several tools useful without workspace
- AC-015 explainer/reconstructor understand Tezos marketplace semantics
- TOOL-005 does not label all inbound tez as income
- TOOL-010 2021 query does not present 2025-only guidance as contemporaneous
