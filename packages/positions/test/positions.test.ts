import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { POSITION_TYPES } from '../../core/src/index.ts'
import { loadSchemas } from '../../validate/src/schema-registry.ts'
import { closePosition, openPosition, positionSupport, recordPositionEvent } from '../src/index.ts'
import type { Position, PositionEvent } from '../src/index.ts'

const check = loadSchemas(resolve('.')).byPath.get('schemas/position/position.schema.json')!
const event = (event_type: PositionEvent['event_type'], day = 1, extra: Partial<PositionEvent> = {}): PositionEvent => ({
  event_id: `event-${day}`, event_type, participant: 'synthetic-participant',
  occurred_at_utc: `2024-01-${String(day).padStart(2, '0')}T00:00:00Z`,
  source_evidence: [`evidence-${day}`], ...extra,
})
const vesting = (): Position => openPosition({ position_id: 'vesting-one', position_type: 'vesting' }, event('TOKEN_GRANT'))
const staking = (): Position => openPosition({
  position_id: 'staking-one', position_type: 'staking', protocol: 'synthetic-protocol',
  assets_deposited: [{ chain: 'synthetic', symbol: 'COIN' }],
  assets_received: [{ asset_id: 'synthetic-receipt' }],
}, event('ASSET_TRANSFER'))
const validate = (position: Position): void => {
  expect(check(JSON.parse(JSON.stringify(position))), JSON.stringify(check.errors)).toBe(true)
}

describe('position lifecycle', () => {
  it('keeps grant, vest, delivery, unlock and sale distinct, closing only explicitly', () => {
    const grant = event('TOKEN_GRANT')
    const milestones = [event('TOKEN_VESTING', 2), event('TOKEN_COMPENSATION', 3), event('TOKEN_UNLOCK', 4)]
    const originals = structuredClone([grant, ...milestones])
    let position = openPosition({ position_id: 'vesting-one', position_type: 'vesting' }, grant)
    for (const milestone of milestones) {
      const result = recordPositionEvent(position, milestone)
      expect(result.status).toBe('APPLIED')
      expect(result.position.closed_at).toBeNull()
      position = result.position
      validate(position)
    }
    expect(position.source_events).toEqual(['event-1', 'event-2', 'event-3', 'event-4'])
    expect(position.assets_received).toEqual([])
    const sale = event('CRYPTO_SALE', 5)
    expect(recordPositionEvent(position, sale)).toMatchObject({ status: 'UNKNOWN', reason: 'UNSUPPORTED_EVENT', position })
    // Completion is a separate, caller-confirmed fact, not inferred from a sale/unlock.
    const completion = event('UNKNOWN', 6)
    const closed = closePosition(position, completion)
    expect(closed).toMatchObject({ status: 'APPLIED', position: { closed_at: '2024-01-06T00:00:00.000Z' } })
    expect(closed.position.source_events).toEqual(['event-1', 'event-2', 'event-3', 'event-4', 'event-6'])
    validate(closed.position)
    expect([grant, ...milestones]).toEqual(originals)
    expect(JSON.stringify(closed.position)).not.toMatch(/TAXABLE|classification|cost_basis|valuation/)
  })

  it.each(['TOKEN_VESTING', 'TOKEN_UNLOCK', 'TOKEN_COMPENSATION', 'UNKNOWN'] as const)(
    'does not invent a missing grant from %s', type => {
      expect(() => openPosition({ position_id: 'vesting-one', position_type: 'vesting' }, event(type))).toThrow('TOKEN_GRANT')
    },
  )

  it('permits repeated vesting tranches and unlock before delivery without closure', () => {
    let position = vesting()
    for (const milestone of [event('TOKEN_VESTING', 2), event('TOKEN_UNLOCK', 3), event('TOKEN_COMPENSATION', 4), event('TOKEN_VESTING', 5)]) {
      const result = recordPositionEvent(position, milestone)
      expect(result.status).toBe('APPLIED')
      position = result.position
    }
    expect(position.source_events).toHaveLength(5)
    expect(position.closed_at).toBeNull()
  })

  it.each(['STAKING_REWARD', 'BAKING_REWARD', 'VALIDATOR_REWARD', 'DELEGATION_REWARD'] as const)(
    'links %s without treating rewards as principal or closing a stake', type => {
      const initial = staking()
      const reward = event(type, 2)
      const result = recordPositionEvent(initial, reward)
      expect(result).toMatchObject({ status: 'APPLIED', position: {
        closed_at: null, source_events: ['event-1', 'event-2'], support_status: 'PARTIAL',
        assets_deposited: initial.assets_deposited, assets_received: initial.assets_received,
      } })
      expect(initial.source_events).toEqual(['event-1'])
      expect(reward.event_type).toBe(type)
      validate(result.position)
      const closed = closePosition(result.position, event('ASSET_TRANSFER', 3))
      expect(closed.position.closed_at).toBe('2024-01-03T00:00:00.000Z')
      validate(closed.position)
    },
  )

  it('is idempotent for replayed event IDs, including explicit closure', () => {
    const reward = event('STAKING_REWARD', 2)
    const position = recordPositionEvent(staking(), reward).position
    expect(recordPositionEvent(position, reward)).toEqual({ status: 'UNCHANGED', reason: 'EVENT_ALREADY_RECORDED', position })
    const exit = event('ASSET_TRANSFER', 3)
    const closed = closePosition(position, exit).position
    expect(closePosition(closed, exit)).toEqual({ status: 'UNCHANGED', reason: 'EVENT_ALREADY_RECORDED', position: closed })
  })

  it('rejects cross-participant events, events before opening and new events after closing', () => {
    const position = staking()
    const cases: [Position, PositionEvent, string][] = [
      [position, event('STAKING_REWARD', 2, { participant: 'synthetic-company' }), 'PARTICIPANT_MISMATCH'],
      [position, event('STAKING_REWARD', 2, { occurred_at_utc: '2023-12-31T23:59:59Z' }), 'BEFORE_OPEN'],
      [closePosition(position, event('ASSET_TRANSFER', 2)).position, event('STAKING_REWARD', 3), 'POSITION_CLOSED'],
    ]
    for (const [input, next, reason] of cases) {
      for (const transition of [recordPositionEvent, closePosition]) {
        expect(transition(input, next)).toEqual({ status: 'UNKNOWN', reason, position: input })
      }
    }
  })

  it('compares timestamp instants across offsets', () => {
    const position = staking()
    const earlier = event('STAKING_REWARD', 2, { occurred_at_utc: '2024-01-01T00:30:00+01:00' })
    expect(recordPositionEvent(position, earlier).reason).toBe('BEFORE_OPEN')
  })

  it('returns UNKNOWN for an unrelated event without guessing a transition', () => {
    expect(recordPositionEvent(staking(), event('TOKEN_VESTING', 2))).toMatchObject({ status: 'UNKNOWN', reason: 'UNSUPPORTED_EVENT' })
    expect(recordPositionEvent(vesting(), event('STAKING_REWARD', 2))).toMatchObject({ status: 'UNKNOWN', reason: 'UNSUPPORTED_EVENT' })
  })

  it.each(POSITION_TYPES)('round-trips the existing schema for %s with honest support', position_type => {
    const position = openPosition({ position_id: 'synthetic-position', position_type }, event('TOKEN_GRANT'))
    validate(position)
    expect(position.support_status).toBe(positionSupport(position_type))
    if (position_type !== 'staking' && position_type !== 'vesting') {
      for (const transition of [recordPositionEvent, closePosition]) {
        expect(transition(position, event('LIQUIDITY_WITHDRAWAL', 2))).toEqual({
          status: 'UNSUPPORTED', reason: 'UNSUPPORTED_POSITION', position,
        })
      }
    }
  })

  it('detaches inputs and outputs, even for rejected events', () => {
    const assets = [{ asset_id: 'synthetic-asset' }]
    const position = openPosition({ position_id: 'vesting-one', position_type: 'vesting', assets_deposited: assets }, event('TOKEN_GRANT'))
    assets[0]!.asset_id = 'changed-input'
    const result = recordPositionEvent(position, event('UNKNOWN', 2))
    result.position.assets_deposited![0]!.asset_id = 'changed-output'
    result.position.source_events.push('changed-event')
    expect(position.assets_deposited).toEqual([{ asset_id: 'synthetic-asset' }])
    expect(position.source_events).toEqual(['event-1'])
  })

  it('requires evidence and valid instants for lifecycle hooks', () => {
    expect(() => openPosition({ position_id: 'vesting-one', position_type: 'vesting' }, event('TOKEN_GRANT', 1, { source_evidence: [] }))).toThrow('source evidence')
    expect(() => recordPositionEvent(staking(), event('STAKING_REWARD', 2, { occurred_at_utc: 'invalid' }))).toThrow('invalid instant')
    expect(() => closePosition(staking(), event('ASSET_TRANSFER', 2, { source_evidence: [] }))).toThrow('source evidence')
  })
})
