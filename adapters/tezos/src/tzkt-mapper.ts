import { fromBaseUnits, hashJson, TECHNICAL_TX_STATUSES, toJSON } from '../../../packages/core/src/index.ts'
import type { TechnicalTx } from '../../../packages/event-engine/src/types.ts'

type ObjectValue = Record<string, unknown>
function object(value: unknown): ObjectValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Expected an operation object')
  return value as ObjectValue
}
function text(value: unknown): string {
  if (typeof value !== 'string' || !value.length) throw new TypeError('Missing operation text field')
  return value
}
function nat(value: unknown): string {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) return String(value)
  if (typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value)) return value
  throw new TypeError('Expected an exact non-negative integer; unsafe numbers are rejected')
}
function integer(value: unknown): number {
  const result = Number(nat(value))
  if (!Number.isSafeInteger(result)) throw new TypeError('Integer exceeds the safe range')
  return result
}
function address(value: unknown): string { return text(object(value).address) }
function utc(value: unknown): string {
  const input = text(value)
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(input) ||
      !Number.isFinite(Date.parse(input)) || Number(input.slice(11, 13)) > 23 ||
      new Date(`${input.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) !== input.slice(0, 10)) {
    throw new TypeError('Block time requires a valid timestamp with an explicit timezone')
  }
  return new Date(input).toISOString()
}
const tez = (value: unknown): string => {
  const units = nat(value)
  // The shared decimal package supports 40 significant digits. Never round an
  // untrusted oversized amount into an apparently exact chain fact.
  if (units.length > 40) throw new TypeError('Native amount exceeds supported decimal precision')
  return toJSON(fromBaseUnits(units, 6))
}

/**
 * TzKT decoded transaction JSON, including flat internal transaction records.
 * Token amounts remain exact base-unit integers (metadata/valuation is a later layer).
 * No marketplace interpretation, ownership assertion or tax classification occurs here.
 */
export function mapTzktOperation(
  payload: unknown, context: { chain: string; evidenceId: string },
): TechnicalTx[] {
  const op = object(payload)
  if (op.type !== 'transaction') throw new TypeError('Unsupported operation type; raw evidence retained')
  const status = text(op.status)
  if (!TECHNICAL_TX_STATUSES.some((candidate) => candidate === status)) throw new TypeError('Unknown operation status')
  const hash = text(op.hash)
  const id = nat(op.id)
  const from = address(op.sender)
  const to = address(op.target)
  const tx: TechnicalTx = {
    technical_tx_id: `tezos-tx-${hashJson({ chain: context.chain, hash, id }).slice(7)}`,
    chain: context.chain,
    operation_hash: hash,
    block_height: integer(op.level),
    block_time_utc: utc(op.timestamp),
    from_address: from,
    to_address: to,
    status: status as TechnicalTx['status'],
    source_evidence: [context.evidenceId],
    schema_version: '1.0.0',
    native_transfers: [],
    token_transfers: [],
    fees: [],
  }
  // A failed/backtracked/skipped call preserves its parameters but made no asset movement.
  const nativeAmount = tez(op.amount)
  if (status === 'applied' && nativeAmount !== '0') tx.native_transfers!.push({ amount: nativeAmount, from, to })
  for (const field of ['bakerFee', 'storageFee', 'allocationFee'] as const) {
    if (op[field] === undefined) continue
    const fee = tez(op[field])
    if (fee !== '0') tx.fees!.push({ amount: fee, kind: field,
      payer: op.initiator === undefined ? from : address(op.initiator) })
  }
  if (op.parameter !== undefined) {
    const parameter = object(op.parameter)
    tx.entrypoint = text(parameter.entrypoint)
    // A detached snapshot: callers cannot mutate the payload through a derived record.
    tx.parameter = structuredClone(parameter.value)
    if (status === 'applied' && tx.entrypoint === 'transfer') {
      const value = parameter.value
      if (Array.isArray(value)) {
        // FA2 transfer list: each sender may transfer several distinct tokens.
        for (const item of value) {
          const batch = object(item)
          if (!Array.isArray(batch.txs)) throw new TypeError('Malformed FA2 transfer list')
          for (const item of batch.txs) {
            const transfer = object(item)
            tx.token_transfers!.push({ contract: to, token_id: nat(transfer.token_id),
              amount: nat(transfer.amount), from: text(batch.from_), to: text(transfer.to_) })
          }
        }
      } else {
        // FA1.2 decoded transfer record; no invented token ID or token decimals.
        const transfer = object(value)
        tx.token_transfers!.push({ contract: to, amount: nat(transfer.value),
          from: text(transfer.from), to: text(transfer.to) })
      }
    }
  }
  return [tx]
}
