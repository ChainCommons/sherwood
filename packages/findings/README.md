# Findings

Implements **P0-1-09**: §51 findings builder and §52 explainability trace
(`FACTS → … → RESULT / UNCERTAINTY`). Consumes rules-engine evaluation output
and caller-supplied evidence, event, capacity, valuation, and lot refs. Does
not re-run those engines and does not implement `analyze()` (**P0-1-10**).

```ts
import { evaluate, loadPack } from '../rules-engine/src/index.ts'
import { buildFindings } from './src/index.ts'

const evaluation = evaluate({ pack, event, participant, asOf })
const findings = buildFindings({
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
})
// findings[0].trace is the §52 accordion model. AI prose must not replace it.
```

## Guarantees

- **AC-001:** `status: relevant` requires non-empty `rule_refs` and `source_refs`.
  Drafts that violate this are demoted to `unknown`.
- **AC-003:** unsupported or gap-only evaluations emit `unknown`.
- Material and unknown findings carry the full §52 step list (empty refs stay
  visible so the UI can show gaps).

Source-relative imports follow the valuation/lots convention and add no
external dependencies. Steward must record the package in the lockfile — see
`docs/rfc/P0-1-09.md`.

Run from the repository root:

```sh
corepack pnpm exec vitest run packages/findings/test
corepack pnpm --filter @octc/findings typecheck
```
