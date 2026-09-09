import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { sha256 } from '../../../packages/core/src/index.ts'
import { InMemoryEvidenceStore } from '../../../packages/evidence/src/index.ts'
import { importPublicWallet, mapTzktOperation } from '../src/index.ts'
import type { WalletHistorySource } from '../src/index.ts'
import { loadSchemas } from '../../../packages/validate/src/schema-registry.ts'

const registry = loadSchemas(fileURLToPath(new URL('../../../', import.meta.url)))

const wallet = 'tz29tCQDFw8KwaMaBuroze6Sv2qd47nnP5Hv'
const target = 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton'
const context = { chain: 'tezos:mainnet', evidenceId: 'test-evidence' }
const operation = (extra: Record<string, unknown> = {}) => ({
  type: 'transaction', id: 1, level: 1539534, timestamp: '2021-07-01T23:05:58+02:00',
  hash: 'test-operation-hash', sender: { address: wallet }, target: { address: target },
  status: 'applied', amount: 1000001, bakerFee: 1234, ...extra,
})
function source(payloads: (string | Uint8Array)[], id = 'recorded-tzkt'): WalletHistorySource {
  return { id, async *fetchOperations(address) {
    expect(address).toBe(wallet)
    yield* payloads
  } }
}
const options = (payloads: (string | Uint8Array)[]) => ({
  address: wallet, chain: context.chain, importedAt: '2026-09-09T12:00:00Z',
  store: new InMemoryEvidenceStore(), source: source(payloads), map: mapTzktOperation,
})

describe('public wallet import', () => {
  it('retains exact bytes, immutable evidence and stable identity on repeated imports', async () => {
    const raw = ` ${JSON.stringify(operation())}\n`
    const input = options([raw, raw])
    const first = await importPublicWallet(input)
    expect(first.evidence).toHaveLength(1)
    expect(first.transactions).toHaveLength(1)
    expect(first.issues).toEqual([])
    const record = first.evidence[0]!
    expect(Object.isFrozen(record)).toBe(true)
    expect(record.content_hash).toBe(sha256(raw))
    expect(Buffer.from((await input.store.getPayload(record.content_hash))!).toString()).toBe(raw)
    const second = await importPublicWallet({ ...input, importedAt: '2026-09-10T12:00:00Z' })
    expect(second).toEqual(first)
    expect(first.transactions[0]).toMatchObject({
      block_time_utc: '2021-07-01T21:05:58.000Z', operation_hash: 'test-operation-hash',
      source_evidence: [record.evidence_id],
      native_transfers: [{ amount: '1.000001', from: wallet, to: target }],
      fees: [{ amount: '0.001234', kind: 'bakerFee', payer: wallet }],
    })
  })

  it('preserves malformed and unsupported evidence while continuing valid sibling operations', async () => {
    const raw = JSON.stringify([operation({ type: 'delegation' }), operation()])
    const result = await importPublicWallet(options(['broken JSON', raw]))
    expect(result.evidence).toHaveLength(2)
    expect(result.issues).toHaveLength(2)
    expect(result.transactions).toHaveLength(1)
    expect(result.issues.every((issue) => result.evidence.some(
      (record) => issue.source_evidence.includes(record.evidence_id),
    ))).toBe(true)
  })

  it('keeps changed source bytes as new evidence and separates networks and providers', async () => {
    const input = options([JSON.stringify(operation())])
    const original = await importPublicWallet(input)
    const changed = await importPublicWallet({ ...input, source: source([JSON.stringify(operation({ amount: 2 }))]) })
    const network = await importPublicWallet({ ...input, chain: 'tezos:testnet' })
    const provider = await importPublicWallet({ ...input, source: source([JSON.stringify(operation())], 'second-provider') })
    expect(new Set([original, changed, network, provider].map((r) => r.evidence[0]!.evidence_id)).size).toBe(4)
    expect(changed.transactions[0]!.technical_tx_id).toBe(original.transactions[0]!.technical_tx_id)
    expect(network.transactions[0]!.technical_tx_id).not.toBe(original.transactions[0]!.technical_tx_id)
    expect(await input.store.getById(original.evidence[0]!.evidence_id)).toEqual(original.evidence[0])
  })

  it('accepts a second provider with its own mapper', async () => {
    const result = await importPublicWallet({ ...options([]), source: source(['{"custom":true}'], 'alternate'),
      map: (_payload, ctx) => mapTzktOperation(operation(), ctx) })
    expect(result.evidence[0]!.source_system).toBe('alternate')
    expect(result.transactions).toHaveLength(1)
  })

  it('rejects credential-like input before contacting the source', async () => {
    let contacted = false
    await expect(importPublicWallet({ ...options([]), address: 'edsk-secret', source: {
      id: 'test', async *fetchOperations() { contacted = true; yield '{}' },
    } })).rejects.toThrow('public Tezos')
    expect(contacted).toBe(false)
  })

  it.each(['objkt-fulfill-ask', 'objkt-fulfill-bid', 'hen', 'teia'])(
    'imports recorded %s operations without marketplace or tax interpretation', async (name) => {
      const raw = readFileSync(new URL(`../../../tests/adapters/tzkt/${name}.json`, import.meta.url))
      const original = JSON.parse(raw.toString()) as Record<string, unknown>[]
      const input = options([raw])
      const result = await importPublicWallet(input)
      expect(result.issues).toEqual([])
      expect(result.transactions).toHaveLength(original.length)
      expect(new Set(result.transactions.map((tx) => tx.technical_tx_id)).size).toBe(original.length)
      expect(result.transactions.flatMap((tx) => tx.token_transfers ?? [])).toHaveLength(1)
      expect(result.transactions.every((tx) => tx.operation_hash === original[0]!.hash)).toBe(true)
      expect(result.transactions.every((tx) => !('event_type' in tx) && !('classification' in tx))).toBe(true)
      for (const [path, records] of [
        ['schemas/event/technical-transaction.schema.json', result.transactions],
        ['schemas/evidence/evidence.schema.json', result.evidence],
      ] as const) {
        const validate = registry.byPath.get(path)!
        for (const record of records) expect(validate(record), JSON.stringify(validate.errors)).toBe(true)
      }
      expect(await input.store.getPayload(result.evidence[0]!.content_hash)).toEqual(new Uint8Array(raw))
    },
  )
})

describe('technical transaction mapping', () => {
  it('preserves FA1.2 base units and does not invent a token ID', () => {
    const [tx] = mapTzktOperation(operation({ amount: 0, parameter: { entrypoint: 'transfer',
      value: { from: wallet, to: target, value: '90071992547409931234567890' } } }), context)
    expect(tx!.token_transfers).toEqual([{ contract: target, from: wallet, to: target, amount: '90071992547409931234567890' }])
  })

  it('maps every FA2 sender and token independently and snapshots parameters', () => {
    const value = [{ from_: wallet, txs: [
      { to_: target, token_id: '90071992547409930', amount: '123456789012345678901234567890' },
      { to_: wallet, token_id: '2', amount: '0' },
    ] }, { from_: target, txs: [{ to_: wallet, token_id: '3', amount: '1' }] }]
    const [tx] = mapTzktOperation(operation({ parameter: { entrypoint: 'transfer', value } }), context)
    expect(tx!.token_transfers).toHaveLength(3)
    expect(tx!.token_transfers![0]).toMatchObject({ token_id: '90071992547409930', amount: '123456789012345678901234567890' })
    value[0]!.txs[0]!.amount = '2'
    expect(tx!.parameter).not.toEqual(value)
  })

  it.each(['failed', 'backtracked', 'skipped'])('retains %s calls without transfers', (status) => {
    const [tx] = mapTzktOperation(operation({ status, parameter: { entrypoint: 'transfer',
      value: { from: wallet, to: target, value: '100' } } }), context)
    expect(tx).toMatchObject({ status, native_transfers: [], token_transfers: [], entrypoint: 'transfer' })
    expect(tx!.fees).toHaveLength(1)
  })

  it('retains unknown contract parameters without claiming a sale', () => {
    const [tx] = mapTzktOperation(operation({ parameter: { entrypoint: 'custom', value: { opaque: true } } }), context)
    expect(tx!.parameter).toEqual({ opaque: true })
    expect(tx).not.toHaveProperty('event_type')
  })

  it.each([
    { amount: 9007199254740992 }, { amount: 1.5 }, { amount: '-1' },
    { amount: '123456789012345678901234567890123456789012345' },
    { timestamp: '2021-07-01T21:05:58' }, { timestamp: '2021-02-30T21:05:58Z' },
    { status: 'unknown' }, { level: -1 },
  ])('rejects unsafe or invalid fields: %j', (extra) => {
    expect(() => mapTzktOperation(operation(extra), context)).toThrow()
  })
})
