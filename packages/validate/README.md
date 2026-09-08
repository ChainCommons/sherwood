# @octc/validate

The checks behind `pnpm validate`, used by CI and by the CLI.

| Check | Enforces |
|---|---|
| `schema` | every data file that declares a `$schema` matches it |
| `unique-ids` | no ID is claimed twice across packs |
| `references` | `sources[]`, jurisdiction ids and supersession chains resolve |
| `temporal` | effective/published/retrieved dates stay coherent (AC-002) |
| `knowledge` | no unsourced rule in a verified pack (§84), certainty present |
| `links` | no broken relative Markdown link |
| `secrets` | no key, token or seed phrase committed |
| `imports` | engines do not import `adapters/tezos` or `jurisdictions/france` |

Errors fail the build; warnings are reported and do not.
