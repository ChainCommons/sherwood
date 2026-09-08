# 13 — Professional export, interoperability, Knowledge API, CLI

**Spec:** §§49, 71–75  
**Workstream:** J + CLI  
**Depends on:** findings, snapshots, knowledge packs  
**P0:** professional pack, generic CSV/JSON, knowledge read API, CLI subset

## Professional review pack (§71)

Export SHOULD contain, as separate inspectable sections (facts vs interpretations visible):

1. participant/entity profile
2. residency chronology
3. activity/capacity chronology
4. wallet/account ownership map
5. normalized ledger
6. asset inventory
7. tax lots
8. positions
9. valuations
10. findings
11. rules
12. source references
13. assumptions
14. unresolved questions
15. missing evidence
16. calculation methodology

Formats P0: HTML-or-Markdown bundle + JSON (machine) + PDF optional stretch. Accountant can inspect facts, classifications, valuations, rules, sources separately (AC-014).

TOOL-012 is the user-facing generator of a subset; the full pack is the workspace export.

## Third-party interoperability (§72)

SHOULD integrate rather than replace all tax software.

Support: normalized CSV export; structured JSON; lot reports; transaction classifications; valuation exports.

Vendor-specific exporters MAY support major accounting/tax platforms later; MUST remain optional (TOOL-013 generic first).

CSV columns: stable header names, schema version row, evidence hashes, event types, amounts in native + fiat, valuation refs, classification status. Document in `docs/export-csv.md`.

## Knowledge API (§73)

Public API SHOULD support:

```text
list jurisdictions
retrieve jurisdiction
retrieve source
retrieve source history
retrieve rule
query rules by date
query rules by event
retrieve scenario
retrieve public case
retrieve jurisdiction maturity
```

P0: implement as static JSON generated in CI from YAML (e.g. `/api/knowledge/...` or `dist/knowledge/*.json`). No private data. Rate-limit if a server appears later.

Same queries as library functions for tools 010/011.

## Core analysis library (§74)

UI-independent.

**Input:** participant facts + normalized events + valuation data + lots/positions + jurisdiction packs + analysis date  
**Output:** structured findings

This is `packages/core` + rules/lots/valuation composed in `analyze()`. CLI, workspace, and tools call it.

## CLI (§75)

Eventually:

```text
validate-source
validate-rule
validate-jurisdiction
import
normalize
reconcile
value
lots
analyze
explain
export
source-diff
rule-diff
run-tests
```

P0 minimum: `validate-*`, `run-tests`, `import` (CSV + Tezos fetch script), `normalize`, `value`, `analyze`, `export`. Critical for agentic development and jurisdiction PRs.

## Implementation tasks

1. `analyze()` facade and version string.
2. Pack exporter with 16 sections; golden snapshot test.
3. Generic CSV/JSON exporters.
4. Knowledge static API generation in CI.
5. CLI with same analyze path as UI (no duplicated logic).
6. Docs for third parties building tools on §49 operations.
