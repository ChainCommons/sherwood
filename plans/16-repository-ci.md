# 16 — Repository structure, contribution, CI, rule tests, fixtures, regression

**Spec:** §§83–88  
**Workstream:** L + A  
**Depends on:** schema decisions (22)  
**P0:** repo layout, CI validators, synthetic + regression corpus started

## Public repository structure (§83)

Planner may alter physical layout while preserving boundaries. Recommended:

```text
open-crypto-tax-commons/
├── README.md LICENSE CONTRIBUTING.md GOVERNANCE.md
├── SECURITY.md PRIVACY.md DISCLAIMER.md CODE_OF_CONDUCT.md
├── docs/
├── schemas/     participant entity evidence event asset position
│                valuation source rule jurisdiction scenario case finding
├── jurisdictions/  eu france united-states united-kingdom germany canada singapore
├── scenarios/
├── cases/
├── packages/    core evidence event-engine rules-engine source-registry
│                valuation lots positions reconciliation ai exporters
├── adapters/    tezos evm solana csv exchanges marketplaces
├── domain-packs/ artists collectors builders crypto
├── apps/        public-web workspace cli     # physical: apps/web + apps/cli
├── tools/       one dir per P0 tool (or routes in apps/web)
└── tests/       synthetic-ledgers jurisdiction valuation rules adapters regression
```

Physical choice: `apps/web` combines public-web + workspace + tool routes. Keep `tools/` as package entrypoints if that preserves reuse.

Placeholder dirs for P1 chains/jurisdictions: LEVEL 0 skeletons so IDs exist.

## Contribution requirements (§84)

A rule contribution MUST include: jurisdiction; tax domain; event/capacity applicability; affected period; authoritative source; source publication date; effective date; interpretation; confidence; test scenarios; contributor; review status.

Unsourced material rules MUST NOT be promoted into verified packs. CI enforces for `review_status` in {SOURCE_VERIFIED, EXPERT_REVIEWED}.

## Automated CI validation (§85)

CI MUST validate: schemas; unique IDs; source references; temporal ranges; missing publication/effective dates; broken internal links; rule tests; jurisdiction IDs; unsupported versions.

CI SHOULD detect stale external sources (P0: warn on `last_source_verification` older than N months; P1: HEAD hash fetch).

## Rule testing (§86)

Each deterministic rule SHOULD include: positive case; negative case; boundary date; threshold boundary; missing-fact case; historical version; successor version.

Ambiguous rules SHOULD test for `UNKNOWN` or `REVIEW_REQUIRED`.

## Regression corpus (§88)

Every significant bug becomes a permanent test. Seed immediately:

- self-transfer treated as sale
- royalty treated as primary sale
- marketplace fee duplicated
- token compensation treated as gift
- wrong timezone
- current rule applied historically
- cost basis matched incorrectly
- current NFT guidance assumed to exist historically

## Implementation tasks

1. Scaffold monorepo exactly enough for CI to run `pnpm test` and `pnpm validate`.
2. `packages/validate` used by CLI and CI.
3. ID uniqueness across YAML.
4. JSON Schema draft 2020-12 published in repo.
5. Fixture policy: synthetic only; license of fixtures Apache-2.0.
6. CODEOWNERS: `jurisdictions/france` vs `packages/**`.
