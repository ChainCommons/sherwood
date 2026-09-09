# Positions

Minimal, local, pure staking and vesting lifecycle hooks for P0-1-08. `Position`
mirrors the existing position schema and consumes the core position enum and
event-engine event/asset types. All eight schema position types are representable;
staking and vesting are `PARTIAL`, and the rest are `UNSUPPORTED`.

```ts
import { openPosition, recordPositionEvent, closePosition } from './src/index.ts'

const granted = openPosition({
  position_id: 'vesting-one', position_type: 'vesting', protocol: 'synthetic-plan',
}, grantEvent) // TOKEN_GRANT, possibly backed by vesting_schedule evidence
const vested = recordPositionEvent(granted, vestEvent).position
const delivered = recordPositionEvent(vested, deliveryEvent).position
const unlocked = recordPositionEvent(delivered, unlockEvent).position
// Only after the caller establishes completion with a distinct economic event:
const completed = closePosition(unlocked, completionEvent).position
```

`openPosition(input, event)` explicitly associates a position with an existing
economic event and its participant. Vesting requires `TOKEN_GRANT`; a schedule
must first be represented by an evidence-backed grant event. Staking/delegation
opening is explicit because a reward alone does not establish when a stake began
or which assets were deposited. No position discovery or raw-evidence decoding
occurs here. Unknown grant/opening facts must be resolved by the caller.

`recordPositionEvent(position, event)` links `TOKEN_VESTING`, `TOKEN_COMPENSATION`
(delivery), and `TOKEN_UNLOCK` to an open vesting position. Tranches can repeat;
unlock and delivery need not occur in a fixed order. For staking it links staking,
baking, validator, and delegation rewards. Each original event and its evidence
remain separate, with IDs retained in `source_events`. No milestone automatically
closes the position or becomes a tax classification.

`closePosition(position, event)` is an explicit caller-confirmed completion/exit
hook. Use a distinct evidence-backed event, after all relevant milestones have
been recorded. The generic engine cannot infer full exit from a transfer or full
vesting from an unlock. Neither partial withdrawal nor token sale should call
this hook unless independent evidence establishes that the position ended.

Transitions return `{ position, status, reason? }`. Unsupported position types
return `UNSUPPORTED`; unrelated event types, participant mismatches, events before
opening, and new events on closed positions return `UNKNOWN` without changing the
position. Replayed event IDs return `UNCHANGED`. No reopening is inferred. All
outputs are detached copies and inputs remain untouched.

Callers supply schema-validated inputs, resolve event-ID conflicts upstream, and
apply events in chronological order. Timestamps are compared as instants, opening
and closure are normalized to UTC, and empty event evidence is rejected. The
position schema stores event references rather than full history; callers retain
the referenced events and replay from opening after corrections or late imports.
The hooks cannot check chronology between previously linked events using IDs alone.

Asset arrays are caller-supplied references at opening, not balances. They are
preserved across transitions: rights vesting does not imply token receipt, and
rewards do not imply principal deposits or reinvestment. Quantities remain in
existing economic legs. Schedule accrual, balances, LP/lending/derivative
accounting, valuations, tax lots, and tax treatment are outside this stub.

Run `corepack pnpm exec vitest run packages/positions/test` and
`corepack pnpm exec tsc -p packages/positions/tsconfig.json --noEmit`.
