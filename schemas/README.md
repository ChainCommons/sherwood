# Schemas

JSON Schema (draft 2020-12) for every record that crosses a package or lane
boundary. These are the published contract: an adapter author and an engine
author can work from them without waiting for each other.

Every schema cross-references [`common.schema.json`](common.schema.json), which
holds the shared primitives and the enum vocabularies. Those enums are mirrored
in `packages/core/src/enums.ts` for TypeScript's benefit, and
`tests/invariants/enum-parity.test.ts` fails if the two drift.

| Directory | Records | Plan |
|---|---|---|
| `participant/` | participant, residency, capacity | 02 |
| `entity/` | entity relationship, wallet ownership | 02 |
| `asset/` | asset, legal classification, artwork, compensation right | 02, 04 |
| `evidence/` | raw evidence, annotation | 03 |
| `event/` | technical transaction, leg, semantic event, fact status, marketplace overlay | 03 |
| `position/` | position | 04 |
| `lot/` | tax lot | 04 |
| `valuation/` | valuation, valuation miss | 06 |
| `jurisdiction/` | jurisdiction pack manifest | 05 |
| `source/` | source, source version | 05 |
| `rule/` | rule, interpretation, reporting rule | 05, 10 |
| `case/` | public case | 05 |
| `finding/` | finding | 09 |
| `snapshot/` | analysis snapshot | 09, 17 |
| `scenario/` | scenario | 14 |

## Conventions

- **Money and quantities are decimal strings**, never JSON numbers. A JSON
  number is an IEEE double and has already lost precision by the time it is
  parsed.
- **`additionalProperties: false` throughout.** A typo in a field name is a
  failure, not a silently ignored extra key.
- **IDs** are ULIDs for machine-created records and kebab-case slugs for
  hand-authored knowledge, so a rule id stays stable across pack edits.
- **A document names its schema** with `$schema`; `pnpm validate` then checks it.
- **Nothing here decides tax treatment.** `economic_character` and `event_type`
  describe economics; `classification` is a factual label; only a `rule` in a
  jurisdiction pack produces a tax effect.

Worked examples of all of these live in [`tests/contracts/`](../tests/contracts/).
