# 10 — Audit/dispute support and information reporting

**Spec:** §§55–58, INV-018  
**Workstream:** J (schema now), product later  
**Depends on:** findings (09), rules (05)  
**P0:** schemas + separation of reporting vs taxation + honest “unsupported”  
**P1:** reconciliation and letter navigator

## Audit and dispute (§55)

MUST NOT become a litigation bot.

SHOULD support forensic reconstruction (already the core product).

Future audit module MAY include: tax-document identification; chronology; response deadlines; public procedural rights; requested-information checklist; assessment reconstruction; alternative calculation; evidence gap analysis.

Interface MUST distinguish:

```text
CORRECTING A PRIOR TAXPAYER ERROR
```

vs

```text
CHALLENGING A TAX-AUTHORITY POSITION
```

P0 implementation:

- Finding/export fields: `posture: reconstruction | correction_of_own_error | challenge_of_authority_position | unspecified`
- Do not generate legal argument letters
- France pack MAY include **public** procedural pointers (deadlines as sourced rules, maturity-labeled) without a “respond to audit” chatbot

## Information reporting (§56)

Separate reporting layer. Eventually model: exchange reporting; employer reporting; CARF; DAC8; CRS-related interfaces; jurisdiction-specific crypto information returns.

Core principle:

```text
REPORTABLE ≠ TAXABLE
NOT REPORTED ≠ NOT TAXABLE
```

INV-018: information-reporting treatment and substantive taxation are separate types.

## Reporting rule schema (§57)

```yaml
reporting_rule_id:
jurisdiction:
framework:                 # e.g. DAC8, national crypto return
reporting_party:
reported_person:
event_types: []
reported_fields: []
reporting_period:
effective_from:
effective_to:
sources: []
```

P0: schema in `schemas/rule/` sibling `reporting-rule`; France pack may stub `unsupported_tax_domains: [crypto reporting, …]` until sourced.

## Reporting reconciliation (§58) — P1

Compare participant reconstructed ledger vs potential third-party reporting; identify mismatches. MUST NOT assume the external report is correct.

P1 tool: Tax Authority Report Reconciler.

## Implementation tasks (P0)

1. Add `reporting_rule` schema and enums.
2. Findings never use a reporting rule as a tax-base rule.
3. Disclaimer copy: absence from a report is not absence of tax.
4. Document P1 module boundaries; no DAC8 engine in P0.

## Implementation tasks (P1)

1. Ingest sample third-party report CSV (synthetic).
2. Match to events with confidence; user confirm.
3. Mismatch findings with both sides preserved.
