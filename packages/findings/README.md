# Findings

Implements **P0-1-09** (§51 findings builder + §52 explainability) and
**P0-1-10** (`analyze()` facade + analysis snapshot serialize/reproduce,
AC-006). Consumes rules-engine evaluation output and caller-supplied evidence,
event, capacity, valuation, and lot refs. Does not re-run those engines.

```ts
import { evaluate, loadPack } from '../rules-engine/src/index.ts'
import { analyze, reproduce, serializeAnalysis } from './src/index.ts'

const evaluation = evaluate({ pack, event, participant, asOf })
const saved = analyze({
  evaluations: [{
    evaluation,
    meta: {
      engine_version: '0.0.0',
      rule_pack_version: 'pack-0',
      generated_at: '2026-09-09T12:00:00.000Z'
    },
    options: {
      participant: 'participant-1',
      trace: {
        facts: { refs: ['profile-1'] },
        evidence: { refs: ['ev-1'] },
        events: { refs: ['evt-1'] },
        capacity: { primary: 'ARTIST', status: 'USER_CONFIRMED' },
        valuations: { refs: ['val-1'] },
        lots: { refs: ['lot-1'] }
      }
    }
  }],
  snapshot: {
    lot_method: 'SPECIFIC_IDENTIFICATION',
    analysis_date: '2026-01-10T09:00:12.000Z',
    participant_profile_version: '1',
    ledger_version: '1',
    ownership_mappings_version: '1',
    jurisdiction_pack_version: 'france@0.0.0-level0',
    valuation_methodology: 'nearest_trade with recorded fallback chain',
    price_dataset_refs: ['sha256:…'],
    rounding_mode: 'HALF_EVEN'
  }
})
// saved.snapshot records versions/methods; serializeAnalysis(saved) persists it.
const again = reproduce(saved, /* same AnalyzeInput */)
// again.match === true when versions/methods and findings align (AC-006).
```

## Guarantees

- **AC-001:** `status: relevant` requires non-empty `rule_refs` and `source_refs`.
  Drafts that violate this are demoted to `unknown`.
- **AC-003:** unsupported or gap-only evaluations emit `unknown`.
- **AC-006:** `reproduce()` re-runs with recorded versions/methods and either
  matches stored findings or returns an explicit engine/field/finding diff.
- Material and unknown findings carry the full §52 step list (empty refs stay
  visible so the UI can show gaps).
- Lot method is always recorded on the snapshot — never a hidden global default.

Source-relative imports follow the valuation/lots convention and add no
external dependencies. Workspace/CLI should call this facade (or a Steward
re-export from `packages/core`) rather than forking analysis logic.

Run from the repository root:

```sh
corepack pnpm exec vitest run packages/findings/test
corepack pnpm --filter @octc/findings typecheck
```
