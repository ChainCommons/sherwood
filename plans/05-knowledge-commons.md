# 05 — Public Tax Knowledge Commons: jurisdictions, sources, rules, cases, search

**Spec:** §§22–34, 77, 80–82  
**Workstreams:** B, C, K (content in plan 15)  
**Depends on:** schemas (phase 0)  
**Unblocks:** Guidance Time Machine, Rule Diff, findings, France pack  
**Packages:** `packages/source-registry`, `packages/rules-engine`  
**Data:** `jurisdictions/`, `cases/`

No private taxpayer data in this surface.

## Jurisdiction architecture (§22)

Packs nest:

```text
EU → France
US → Federal / California / New York     # P1+
Canada → Federal / Quebec                # P1+
```

```yaml
jurisdiction_id:
name:
parent_jurisdiction:
jurisdiction_type: supranational | national | federal | state | province | canton | local | treaty
currency:
official_languages: []
tax_year_convention:
timezone_reference:
supported_tax_domains: []
unsupported_tax_domains: []    # MUST list unsupported explicitly
effective_from:
effective_to:
maintainers: []
review_status:
last_source_verification:
maturity_level: 0..6
```

P0 packs: `eu`, `france`. Skeleton placeholders MAY exist for us/uk/germany/canada/singapore so IDs are stable (LEVEL 0).

## Tax domains (§24)

Packs MUST be capable of representing (enums exist even if France v0.1 only fills some):

personal income tax; professional/business income; corporation tax; capital gains; VAT; GST/HST; sales/use; social-security; artist-specific social regimes; self-employment contributions; withholding; business-registration; reporting; crypto reporting; foreign-asset reporting; deductible expenses; tax-lot/accounting rules; recordkeeping; filing; corrections; voluntary disclosure; audit procedure; administrative appeals; payment/collection; court deadlines.

Unsupported domains MUST be identified as unsupported — UI shows “not modeled”.

## Source registry (§25)

Stable `source_id`.

```yaml
source_id:
jurisdiction_id:
issuing_authority:
source_type:
authority_level:
title:
canonical_reference:
original_language:
publication_date:
effective_from:
effective_to:
repealed_at:
retrieved_at:
canonical_url:
archive_reference:
content_hash:
supersedes:
superseded_by:
notes:
```

Types: `STATUTE REGULATION TREATY COURT_DECISION ADMINISTRATIVE_RULING ADMINISTRATIVE_GUIDANCE OFFICIAL_MANUAL OFFICIAL_FAQ FORM FORM_INSTRUCTIONS OFFICIAL_NOTICE LEGISLATIVE_HISTORY GOVERNMENT_REPORT PROFESSIONAL_GUIDANCE ACADEMIC_ANALYSIS SECONDARY_COMMENTARY PUBLIC_FIRST_PERSON_CASE NEWS_REPORT OTHER`

Prefer metadata + links + hashes + permitted extracts over republishing (plan 19).

## Source authority (§26)

Every jurisdiction defines a hierarchy. Distinguish legislation, binding doctrine, administrative guidance, official FAQ, professional guidance, commentary.

An official-looking page MUST NOT automatically be binding doctrine. Authority MUST be visible in UI.

## Temporal legal model (§27) — three clocks

For every material rule distinguish:

1. **Transaction applicability** — when the rule applies economically (`effective_from` / `effective_to`)
2. **Publication availability** — when guidance became public (`published_from` / `publication_date`)
3. **Repository observation** — when the project captured it (`retrieved_at`)

A 2026 statement about 2021 MUST NOT be shown as guidance available to taxpayers in 2021 (AC-002). UI: “applies to period” vs “published” vs “captured”.

Current text MUST NOT overwrite historical text (§28). Store versions, not a mutating blob.

Preserve where lawful: metadata, identifiers, URL, publication/effective dates, archived version, content hash, predecessor/successor, extracted structured info, permitted excerpts.

## Rule schema (§29)

```yaml
rule_id:
jurisdiction_id:
tax_domain:
title:
applies_to:
  participant_types: []
  capacities: []
  event_types: []
  asset_types: []
conditions:                 # machine-readable predicate DSL
effects:
  classification:
  valuation_rule:
  reporting_rule:
  tax_base_rule:
  calculation_rule:
effective_from:
effective_to:
published_from:
sources: []
authority_status:
certainty: { level, reason }
supersedes:
superseded_by:
review: { status, reviewer, reviewed_at }
test_cases: []
interpretations: []         # competing, §100
```

### Certainty (§30) — legal, not LLM

`AUTHORITATIVE_CLEAR AUTHORITATIVE_INTERPRETIVE EXPERT_INTERPRETATION AMBIGUOUS CONFLICTING_AUTHORITIES UNSETTLED UNKNOWN`

### Review status (§31)

`EXPERT_REVIEWED SOURCE_VERIFIED COMMUNITY_DRAFT STALE DISPUTED`

Expert-reviewed material records reviewer qualification, date, scope. If absent, UI MUST say so (§99).

Unsourced rules MUST NOT be promoted into verified packs (§84).

## Rule engine

```ts
evaluate(input: {
  event: SemanticEvent
  participant: Participant
  asOf: { transactionDate: Date; analysisDate: Date }
  pack: JurisdictionPack
}): FindingEffects | UNKNOWN | REVIEW_REQUIRED
```

- Select rules where `effective_from ≤ transactionDate ≤ effective_to`
- Attach which sources were **published** by `transactionDate` vs later
- Deterministic given pack version
- Competing interpretations: emit both, `STATUS: UNRESOLVED` (§100). Do not manufacture consensus.
- Ambiguous rules test for `UNKNOWN` or `REVIEW_REQUIRED` (§86)

Predicate DSL: keep small (event_type in, capacity in, amount thresholds, asset category, boolean jurisdiction_facts). Version the DSL. No general-purpose scripting inside rules.

## Source monitoring (§32) — P1 automation, P0 manual path

Workflow:

```text
SOURCE CHANGE → SOURCE DIFF → CANDIDATE RULE UPDATE → REVIEW → NEW VERSION
```

A changed source MUST NOT silently modify an approved rule.

P0: document the workflow; CI checks hashes of pinned extracts; `last_source_verification` field. P1: crawlers for official pages, dead links, review issues.

## Public case database (§33–34)

Schema as spec. `public_information_only: true`. Precedential status: `binding persuasive administrative settlement allegation_only anecdotal`.

Separate `KNOWN | INFERRED | CLAIMED | UNKNOWN`. MUST NOT manufacture similarities between cases. MAY link under a research topic without claiming identical legal issues. Social-media MAY be recorded; MUST NOT be treated as precedent.

P0: schema + 0–few France-relevant public cases if sources exist. Full research UI is P1.

## Maturity (§77)

```text
LEVEL 0 Skeleton
LEVEL 1 Sources indexed
LEVEL 2 Human-readable explanation
LEVEL 3 Machine-readable rules
LEVEL 4 Deterministic analysis
LEVEL 5 Expert reviewed
LEVEL 6 Continuous monitoring
```

UI MUST expose maturity. France P0 target: LEVEL 1–3 honestly (LEVEL 4 only for the narrow deterministic subset: e.g. self-transfer not a disposal).

## Search (§80–82)

Source-driven search examples: `France NFT VAT 2021`, `France Tezos artist crypto income`.

Result ranking: (1) primary sources (2) applicable historical versions (3) expert-reviewed interpretation (4) source-verified summaries (5) community content.

Every search supports `AS OF YYYY-MM-DD`. Each hit indicates: existed on date; published later; superseded; applies retrospectively; unavailable.

“What changed?” derives from source/rule history (TOOL-011), never from an LLM memory.

Knowledge API ops (plan 13): list/retrieve jurisdictions, sources, source history, rules, rules by date/event, scenarios, cases, maturity.

## Implementation tasks

1. Schemas for jurisdiction, source, source_version, rule, interpretation, case.
2. YAML loader + Ajv validation + unique IDs + temporal range checks.
3. `SourceRegistry` as-of queries (publication vs effective).
4. `RulesEngine` + DSL v0.
5. Static search index for public web (plan 18).
6. CI: every rule has ≥1 source; certainty present; no approved rule without review metadata (may be COMMUNITY_DRAFT).
7. Tests: AC-001, AC-002, AC-003, AC-011.

## Content authorship

France/EU YAML lives in plan 15. Engine authors must not invent doctrine.
