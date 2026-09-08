# Open Crypto Tax Commons (Project Sherwood) — Plan set

This directory is the implementation planning set for [INITIAL_PROMPT.md](../INITIAL_PROMPT.md) (Product & Engineering Requirements Specification v1.0).

Read in this order:

1. [00-MASTER.md](00-MASTER.md) — product context, invariants, surfaces, phasing, and how the parts fit.
2. The numbered detailed plans — each is an implementation brief for one part of the spec.
3. [22-architecture-workstreams.md](22-architecture-workstreams.md) — package contracts, parallel ownership, and sequencing.
4. [23-implementation.md](23-implementation.md) — TODOs, owners, and calendar to complete the MASTER (P0).
5. [24-multi-agent.md](24-multi-agent.md) — split work across multiple agents/providers; paste-ready briefs in [agents/](agents/README.md).
6. [25-gorunme-kickoff.md](25-gorunme-kickoff.md) — GoRunMe scheduler + GitHub PRs; paste packets in [gorunme/](gorunme/PROMPT-FOR-GORUNME-AGENT.md).
7. [26-review-response.md](26-review-response.md) — adopted vs pushed-back review (schema freeze, P0-alpha, HEN, archives).
8. [SPEC-COVERAGE.md](SPEC-COVERAGE.md) — map of all 116 spec sections to plans.

## Index

| Plan | Covers spec sections | P0? |
|---|---|---|
| [00-MASTER.md](00-MASTER.md) | §§1–8, 106–116 (context) | — |
| [01-product-philosophy-constraints.md](01-product-philosophy-constraints.md) | §§1–8 | constraints |
| [02-domain-model.md](02-domain-model.md) | §§9–11, 18–19, 43 | yes |
| [03-evidence-economic-events.md](03-evidence-economic-events.md) | §§12–16 | yes |
| [04-assets-positions-lots.md](04-assets-positions-lots.md) | §§17–21 | yes |
| [05-knowledge-commons.md](05-knowledge-commons.md) | §§22–34, 77, 80–82 | yes (France/EU) |
| [06-valuation.md](06-valuation.md) | §§35–37 | yes |
| [07-adapters-import-reconciliation.md](07-adapters-import-reconciliation.md) | §§38–42 | yes (Tezos + CSV) |
| [08-tax-tools.md](08-tax-tools.md) | §§44–49, 53–54, 110 | yes (001–013); 53–54 P1 |
| [09-workspace-findings.md](09-workspace-findings.md) | §§6.3, 50–52, 93–94 | yes |
| [10-audit-reporting.md](10-audit-reporting.md) | §§55–58 | schema P0; depth P1 |
| [11-ai.md](11-ai.md) | §§59–65, 69 | prototype |
| [12-privacy-security.md](12-privacy-security.md) | §§66–70, 92, 97 | yes |
| [13-exports-api-cli.md](13-exports-api-cli.md) | §§49, 71–75 | yes |
| [14-scenarios.md](14-scenarios.md) | §76 | yes (library + P0 demos) |
| [15-france-eu.md](15-france-eu.md) | §§78–79, 23, 99 | yes v0.1 |
| [16-repository-ci.md](16-repository-ci.md) | §§83–88, 84–85 | yes |
| [17-quality-integrity.md](17-quality-integrity.md) | §§89–93, 105 | yes |
| [18-ui-a11y-i18n.md](18-ui-a11y-i18n.md) | §§94–96, 110 | yes (tools + knowledge) |
| [19-governance.md](19-governance.md) | §§98–101 | yes (docs + process) |
| [20-p0-mvp-acceptance.md](20-p0-mvp-acceptance.md) | §§102, 105, 113–115 | definition of done |
| [21-p1-p2.md](21-p1-p2.md) | §§46, 103–104, 108 | later |
| [22-architecture-workstreams.md](22-architecture-workstreams.md) | §§83, 106–107, 111–112 | bootstrap |
| [23-implementation.md](23-implementation.md) | execution of MASTER | alpha W3–W8; §102 date TBD |
| [24-multi-agent.md](24-multi-agent.md) | multi-agent / multi-provider split | operating model |
| [25-gorunme-kickoff.md](25-gorunme-kickoff.md) | GoRunMe + GitHub coordination | scheduler |
| [26-review-response.md](26-review-response.md) | review adopted / rejected | plan delta |

Normative requirements live in `INITIAL_PROMPT.md`. These plans decompose that spec into buildable work. If a plan and the spec conflict, the spec wins.

Terminology: **MUST / MUST NOT** are constraints. **SHOULD** is default. **MAY** is optional. **P0** is the initial usable release; **P1** first mature generation; **P2** later expansion.
