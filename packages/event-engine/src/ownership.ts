import type { WalletOwnershipMap } from './types.ts'

/** Resolve only explicit, unambiguous confirmations for this chain and address. */
export function confirmedOwnership(chain: string, address: string, ownership: WalletOwnershipMap): {
  owner: string | undefined
  conflicting: boolean
} {
  const owners = new Set(ownership
    .filter(w => w.chain === chain && w.address === address && w.confirmation === 'USER_CONFIRMED')
    .map(w => w.owner_participant_id ?? undefined))
  const conflicting = owners.size > 1
  return { owner: owners.size === 1 ? [...owners][0] : undefined, conflicting }
}

/** AC-004: labels, control relationships, and inferred owners never establish a self-transfer. */
export function isConfirmedSelfTransfer(
  chain: string, from: string, to: string, ownership: WalletOwnershipMap,
): boolean {
  const source = confirmedOwnership(chain, from, ownership).owner
  return Boolean(source) && source === confirmedOwnership(chain, to, ownership).owner
}
