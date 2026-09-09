import { instant } from '../../core/src/index.ts'
import type { PositionType, SemanticEventType } from '../../core/src/index.ts'
import type { OpenPositionInput, Position, PositionEvent, PositionTransition } from './types.ts'

export * from './types.ts'

const vestingEvents: readonly SemanticEventType[] = [
  'TOKEN_VESTING', 'TOKEN_UNLOCK', 'TOKEN_COMPENSATION',
]
const stakingEvents: readonly SemanticEventType[] = [
  'STAKING_REWARD', 'BAKING_REWARD', 'VALIDATOR_REWARD', 'DELEGATION_REWARD',
]

export function positionSupport(type: PositionType): 'PARTIAL' | 'UNSUPPORTED' {
  return type === 'staking' || type === 'vesting' ? 'PARTIAL' : 'UNSUPPORTED'
}

function eventTime(event: PositionEvent): string {
  if (event.source_evidence.length === 0) {
    throw new TypeError('Position events require source evidence')
  }
  return instant(event.occurred_at_utc)
}

/** Explicit association supplied by the caller; never inferred from a reward. */
export function openPosition(input: OpenPositionInput, event: PositionEvent): Position {
  const opened_at = eventTime(event)
  if (input.position_type === 'vesting' && event.event_type !== 'TOKEN_GRANT') {
    throw new TypeError('A vesting position must open on TOKEN_GRANT')
  }
  return {
    position_id: input.position_id,
    participant: event.participant,
    position_type: input.position_type,
    ...(input.protocol === undefined ? {} : { protocol: input.protocol }),
    assets_deposited: structuredClone([...(input.assets_deposited ?? [])]),
    assets_received: structuredClone([...(input.assets_received ?? [])]),
    opened_at,
    closed_at: null,
    source_events: [event.event_id],
    support_status: positionSupport(input.position_type),
    schema_version: '0.1.0',
  }
}

function blocked(position: Position, event: PositionEvent): PositionTransition | undefined {
  const at = eventTime(event)
  const reject = (status: PositionTransition['status'], reason: PositionTransition['reason']): PositionTransition => ({
    position: structuredClone(position), status, ...(reason === undefined ? {} : { reason }),
  })
  if (positionSupport(position.position_type) === 'UNSUPPORTED') {
    return reject('UNSUPPORTED', 'UNSUPPORTED_POSITION')
  }
  if (position.participant !== event.participant) return reject('UNKNOWN', 'PARTICIPANT_MISMATCH')
  if (at < instant(position.opened_at)) return reject('UNKNOWN', 'BEFORE_OPEN')
  if (position.source_events.includes(event.event_id)) return reject('UNCHANGED', 'EVENT_ALREADY_RECORDED')
  if (position.closed_at != null) return reject('UNKNOWN', 'POSITION_CLOSED')
  return undefined
}

/** Link a distinct milestone/reward without replacing or reclassifying it. */
export function recordPositionEvent(position: Position, event: PositionEvent): PositionTransition {
  const rejection = blocked(position, event)
  if (rejection) return rejection
  const allowed = position.position_type === 'vesting' ? vestingEvents : stakingEvents
  if (!allowed.includes(event.event_type)) {
    return { position: structuredClone(position), status: 'UNKNOWN', reason: 'UNSUPPORTED_EVENT' }
  }
  return {
    status: 'APPLIED',
    position: {
      ...structuredClone(position),
      source_events: [...position.source_events, event.event_id],
      support_status: 'PARTIAL',
    },
  }
}

/** Caller-confirmed completion/exit only; a vest, unlock or reward never closes automatically. */
export function closePosition(position: Position, event: PositionEvent): PositionTransition {
  const rejection = blocked(position, event)
  if (rejection) return rejection
  return {
    status: 'APPLIED',
    position: {
      ...structuredClone(position),
      closed_at: eventTime(event),
      source_events: [...position.source_events, event.event_id],
      support_status: 'PARTIAL',
    },
  }
}
