# 15 — France P0 pack and EU dependency pack

**Spec:** §§23, 78–79, 99  
**Workstream:** K  
**Depends on:** knowledge engine (05)  
**Does not depend on:** Tezos adapters (content is jurisdiction data)  
**Data:** `jurisdictions/france/`, `jurisdictions/eu/`  
**Maturity target:** LEVEL 1–3 honest; LEVEL 4 only for narrow deterministic rules

Agents MUST NOT invent tax doctrine. Every machine-readable rule cites a source with publication and effective dates. Historical gaps in NFT guidance MUST be explicit.

## Jurisdiction priority (§23)

P0: France + EU dependencies required by France  
P1: US federal, UK, Germany, Canada federal, Singapore, broader EU  
Architecture allows arbitrary future packs.

## France pack SHOULD cover at minimum (§78)

Represent as domains with either sourced rules **or** explicit `unsupported` / `UNSETTLED`:

- professional income
- BNC issues
- artist-author issues
- crypto compensation
- non-cash professional receipts
- crypto disposal
- NFT sales
- NFT royalties
- VAT
- digital-art VAT considerations
- rights/licensing distinctions
- social contributions
- filing
- recordkeeping
- correction mechanisms
- audit procedure
- administrative review
- payment/collection procedures

v0.1 is not “complete French tax software.” It is a sourced map plus a few executable rules.

## Suggested France v0.1 content structure

```text
jurisdictions/france/
  jurisdiction.yaml
  sources/*.yaml          # CGI, BOFiP, statutes, FAQs — metadata + URLs + hashes + dates
  explanations/*.md       # human-readable, labeled COMMUNITY_DRAFT
  rules/*.yaml            # only where citable
  unsupported.yaml        # domains not yet modeled
  tests/*.yaml
```

### Executable rules to attempt (if sources exist)

These are engineering-shaped and still need real citations during authoring:

- Confirmed self-transfer is not a disposal
- Gross vs fee vs royalty legs remain distinct
- Receipt of tez is not automatically professional income without capacity/facts
- NFT mint is not automatically a supply/sale
- Cost-basis method is user/jurisdiction-selected, not hardcoded FIFO
- As-of publication: rules/sources with `published_from > event_date` appear only in “later guidance”

### MUST be explicit

NFT VAT and digital-art treatment 2021–2024: if official guidance was missing, late, or conflicting, encode `UNSETTLED` / `AMBIGUOUS` / `CONFLICTING_AUTHORITIES` and list what existed when. Later BOFiP/FAQ goes in `later publications` for Time Machine.

Artist-author vs BNC vs salary: do not pick silently; ask facts (situation explorer) and emit `REVIEW_REQUIRED`.

## EU dependency pack (§79)

Model separately where applicable:

- VAT
- place of supply
- digital/electronic services
- B2B/B2C distinctions
- cross-border reporting
- relevant supranational rules

National packs SHOULD reference shared EU rules rather than duplicate them.

```text
jurisdictions/eu/
  jurisdiction.yaml
  sources/
  rules/          # VAT directives etc. as metadata + extracts if lawful
```

France VAT rules `references: [eu:vat:...]` rather than copy-paste.

## Governance (§99)

A mature jurisdiction SHOULD have primary maintainer, backup maintainer, qualified local reviewer.

P0: list maintainers as TBD if needed; `review_status: COMMUNITY_DRAFT`; UI MUST say expert review is absent.

Legal disagreement (§100): competing interpretations coexist; do not manufacture consensus. Use this for known French crypto/NFT controversies rather than picking a winner.

## Contribution (§84)

Each rule PR: jurisdiction, tax domain, event/capacity applicability, affected period, authoritative source, source publication date, effective date, interpretation, confidence, test scenarios, contributor, review status.

## Implementation tasks

1. Source research log (`jurisdictions/france/RESEARCH.md`) listing official URLs and retrieval dates — not blog recaps as authority.
2. Index 15–40 real sources with dates (statute, admin guidance, FAQ) as metadata.
3. Human explanations for artist NFT primary/secondary/royalty, collector disposal, baking rewards, compensation-in-crypto — each with “what was published by year”.
4. Machine rules only for the narrow set above + tests (§86 matrix).
5. EU VAT skeleton referenced by France VAT explanation.
6. Time Machine fixtures: France / NFT artist / 2021 vs 2024.
7. Rule Diff fixture: a known guidance change with two source versions.

## Quality bar

- Zero rules without `sources[]`
- Original language preserved (French sources stay French); translations labeled (plan 18)
- No wholesale republication of CGI/BOFiP; permitted short extracts + links + hashes
