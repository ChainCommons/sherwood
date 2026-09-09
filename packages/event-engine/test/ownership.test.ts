import { describe, expect, it } from 'vitest'
import { isConfirmedSelfTransfer } from '../src/index.ts'
import type { WalletOwnership } from '../src/index.ts'

const wallet = (address: string, changes: Partial<WalletOwnership> = {}): WalletOwnership => ({
  wallet_id: `wallet-${address}`, address, chain: 'synthetic', ownership_class: 'USER_PERSONAL',
  owner_participant_id: 'person', confirmation: 'USER_CONFIRMED', schema_version: '0.1.0', ...changes,
})
const statuses = ['USER_CONFIRMED', 'INFERRED', 'UNKNOWN'] as const

describe('confirmed self-transfer ownership (AC-004)', () => {
  it.each(statuses.flatMap(from => statuses.map(to => [from, to] as const)))(
    'requires both confirmations: %s → %s', (from, to) => {
      expect(isConfirmedSelfTransfer('synthetic', 'a', 'b', [
        wallet('a', { confirmation: from }), wallet('b', { confirmation: to }),
      ])).toBe(from === 'USER_CONFIRMED' && to === 'USER_CONFIRMED')
    },
  )

  it.each([undefined, null])('requires an explicit owner on each endpoint (%s)', owner_participant_id => {
    for (const address of ['a', 'b']) {
      const ownership = [wallet('a'), wallet('b')]
      const missing = ownership.find(w => w.address === address)!
      if (owner_participant_id === undefined) delete missing.owner_participant_id
      else missing.owner_participant_id = owner_participant_id
      expect(isConfirmedSelfTransfer('synthetic', 'a', 'b', ownership)).toBe(false)
    }
  })

  it('does not infer ownership from equal addresses or an absent mapping', () => {
    expect(isConfirmedSelfTransfer('synthetic', 'a', 'a', [])).toBe(false)
    expect(isConfirmedSelfTransfer('synthetic', 'a', 'b', [wallet('a')])).toBe(false)
    expect(isConfirmedSelfTransfer('synthetic', 'a', 'a', [wallet('a')])).toBe(true)
  })

  it('requires the transaction chain on both endpoints', () => {
    expect(isConfirmedSelfTransfer('synthetic', 'a', 'b', [wallet('a'), wallet('b', { chain: 'other' })])).toBe(false)
  })

  it('keeps personal and company owners distinct despite a shared related entity', () => {
    expect(isConfirmedSelfTransfer('synthetic', 'a', 'b', [
      wallet('a', { related_entity_id: 'company' }),
      wallet('b', { owner_participant_id: 'company', ownership_class: 'USER_CONTROLLED_ENTITY', related_entity_id: 'company' }),
    ])).toBe(false)
  })

  it.each(['company', null, undefined])('rejects conflicting confirmations (%s) in either order', owner_participant_id => {
    const conflicting = wallet('b')
    if (owner_participant_id === undefined) delete conflicting.owner_participant_id
    else conflicting.owner_participant_id = owner_participant_id
    const ownership = [wallet('a'), wallet('b'), conflicting]
    expect(isConfirmedSelfTransfer('synthetic', 'a', 'b', ownership)).toBe(false)
    expect(isConfirmedSelfTransfer('synthetic', 'a', 'b', ownership.reverse())).toBe(false)
  })

  it('tolerates duplicate confirmations and ignores guesses and other-chain records', () => {
    const ownership = [wallet('a'), wallet('b'), wallet('b'),
      wallet('b', { owner_participant_id: 'company', confirmation: 'INFERRED' }),
      wallet('b', { owner_participant_id: 'company', confirmation: 'UNKNOWN' }),
      wallet('b', { owner_participant_id: 'company', chain: 'other' })]
    const before = structuredClone(ownership)
    expect(isConfirmedSelfTransfer('synthetic', 'a', 'b', ownership)).toBe(true)
    expect(ownership).toEqual(before)
  })
})
