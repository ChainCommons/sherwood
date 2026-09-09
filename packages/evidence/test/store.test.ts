import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { EVIDENCE_TYPES, sha256 } from '../../core/src/index.ts'
import { loadSchemas } from '../../validate/src/schema-registry.ts'
import { EvidenceConflictError, InMemoryEvidenceStore } from '../src/index.ts'
import type { EvidenceInput, EvidenceStore } from '../src/index.ts'

const input = (overrides: Partial<EvidenceInput> = {}): EvidenceInput => ({
  evidence_id: 'synthetic-import-1',
  evidence_type: 'generic_csv',
  source_system: 'synthetic-csv',
  source_identifier: 'synthetic.csv',
  timestamp: '2021-06-15T23:40:00+02:00',
  imported_at: '2026-01-10T09:00:00.000Z',
  schema_version: '0.1.0',
  ...overrides
})

// Run this contract against a future SQLite store using the same factory shape.
function evidenceStoreContract(createStore: () => EvidenceStore): void {
  it('preserves exact binary bytes, provenance, and a retrievable hash reference', async () => {
    const store = createStore()
    const payload = new Uint8Array([0, 255, 128, 13, 10])
    const record = await store.append(input(), payload)
    expect(record).toEqual({ ...input(), content_hash: sha256(payload), raw_payload_ref: sha256(payload) })
    expect(await store.getById(record.evidence_id)).toEqual(record)
    expect(await store.getByHash(record.content_hash)).toEqual([record])
    expect(await store.getPayload(record.content_hash)).toEqual(payload)
  })

  it('hashes string input as UTF-8 without normalizing raw JSON whitespace', async () => {
    const store = createStore()
    const raw = '{ "label": "café", "amount": "0.000001" }\r\n'
    const record = await store.append(input(), raw)
    expect(record.content_hash).toBe(sha256(raw))
    expect(record.content_hash).not.toBe(sha256(JSON.stringify(JSON.parse(raw))))
    expect(Buffer.from((await store.getPayload(record.content_hash))!).toString('utf8')).toBe(raw)
  })

  it('makes identical retries idempotent, including a supplied integrity hash', async () => {
    const store = createStore()
    const first = await store.append(input(), 'raw')
    const retry = await store.append(input({ content_hash: sha256('raw') }), Buffer.from('raw'))
    expect(retry).toEqual(first)
    expect(await store.getByHash(first.content_hash)).toEqual([first])
  })

  it('keeps every source record when distinct imports share the same blob', async () => {
    const store = createStore()
    const first = await store.append(input(), 'raw')
    const snapshot = await store.getByHash(first.content_hash)
    const second = await store.append(input({
      evidence_id: 'synthetic-import-2', source_system: 'manual-import',
      imported_at: '2026-01-11T09:00:00.000Z'
    }), 'raw')
    expect(second.raw_payload_ref).toBe(first.raw_payload_ref)
    expect(await store.getByHash(first.content_hash)).toEqual([first, second])
    expect(snapshot).toEqual([first])
  })

  it('rejects replacements atomically and retains raw evidence for separate corrections (AC-009)', async () => {
    const store = createStore()
    const original = await store.append(input(), 'original')
    await expect(store.append(input(), 'corrected')).rejects.toBeInstanceOf(EvidenceConflictError)
    await expect(store.append(input({ source_identifier: 'changed.csv' }), 'original'))
      .rejects.toBeInstanceOf(EvidenceConflictError)
    expect(await store.getById(original.evidence_id)).toEqual(original)
    expect(await store.getPayload(original.content_hash)).toEqual(new Uint8Array(Buffer.from('original')))
    expect(await store.getPayload(sha256('corrected'))).toBeUndefined()
    expect(await store.getByHash(sha256('corrected'))).toEqual([])
    const correction = await store.append(input({
      evidence_id: 'synthetic-correction-1', evidence_type: 'manual_user_record',
      source_system: 'user', source_identifier: original.evidence_id
    }), 'corrected')
    expect(await store.getById(original.evidence_id)).toEqual(original)
    expect(await store.getById(correction.evidence_id)).toEqual(correction)
  })

  it('rejects a mismatched hash without storing metadata or bytes', async () => {
    const store = createStore()
    await expect(store.append(input({ content_hash: sha256('other') }), 'raw'))
      .rejects.toThrow(/does not match/)
    expect(await store.getById(input().evidence_id)).toBeUndefined()
    expect(await store.getPayload(sha256('raw'))).toBeUndefined()
    expect(await store.getByHash(sha256('raw'))).toEqual([])
  })

  it('does not share mutable input buffers or metadata with callers', async () => {
    const store = createStore()
    const metadata = { ...input() }
    const backing = Buffer.from([9, 1, 2, 9])
    const payload = backing.subarray(1, 3)
    const pending = store.append(metadata, payload)
    metadata.source_system = 'changed'
    backing.fill(0)
    const record = await pending
    expect(record.source_system).toBe('synthetic-csv')
    expect(await store.getPayload(record.content_hash)).toEqual(new Uint8Array([1, 2]))
  })

  it('protects append results and every read result from mutation', async () => {
    const store = createStore()
    const record = await store.append(input(), new Uint8Array([1, 2]))
    const fromId = (await store.getById(record.evidence_id))!
    const fromHash = await store.getByHash(record.content_hash)
    for (const candidate of [record, fromId, fromHash[0]!]) {
      try { Object.assign(candidate, { source_system: 'changed' }) } catch { /* frozen snapshot */ }
    }
    try { (fromHash as unknown[]).pop() } catch { /* frozen snapshot */ }
    const bytes = (await store.getPayload(record.content_hash))!
    bytes.fill(0)
    expect((await store.getById(record.evidence_id))!.source_system).toBe('synthetic-csv')
    expect(await store.getByHash(record.content_hash)).toHaveLength(1)
    expect(await store.getPayload(record.content_hash)).toEqual(new Uint8Array([1, 2]))
  })

  it('handles concurrent retries and conflicting appends without overwriting', async () => {
    const store = createStore()
    const retries = await Promise.all(Array.from({ length: 10 }, () => store.append(input(), 'raw')))
    expect(await store.getByHash(sha256('raw'))).toEqual([retries[0]])
    const results = await Promise.allSettled([
      store.append(input({ evidence_id: 'synthetic-race' }), 'first'),
      store.append(input({ evidence_id: 'synthetic-race' }), 'second')
    ])
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1)
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1)
    const winner = (await store.getById('synthetic-race'))!
    expect(await store.getByHash(winner.content_hash)).toEqual([winner])
  })

  it('distinguishes missing evidence from an empty payload and isolates stores', async () => {
    const store = createStore()
    const other = createStore()
    expect(await store.getById('missing')).toBeUndefined()
    expect(await store.getByHash(sha256(''))).toEqual([])
    expect(await store.getPayload(sha256(''))).toBeUndefined()
    const empty = await store.append(input(), '')
    expect(await store.getPayload(empty.content_hash)).toEqual(new Uint8Array())
    expect(await other.getPayload(empty.content_hash)).toBeUndefined()
    expect(await other.getById(empty.evidence_id)).toBeUndefined()
  })
}

describe('in-memory evidence store contract', () => {
  evidenceStoreContract(() => new InMemoryEvidenceStore())
})

describe('evidence schema boundaries', () => {
  const registry = loadSchemas(fileURLToPath(new URL('../../..', import.meta.url)))
  const validate = registry.byPath.get('schemas/evidence/evidence.schema.json')!

  it.each(EVIDENCE_TYPES)('produces schema-compatible %s evidence', async (evidence_type) => {
    const record = await new InMemoryEvidenceStore().append(input({ evidence_type }), 'synthetic')
    expect(validate(record), JSON.stringify(validate.errors)).toBe(true)
  })

  it.each([
    { evidence_id: 'invalid id' }, { evidence_type: 'TAXABLE' }, { source_system: '' },
    { schema_version: '1' }, { source_identifier: {} }, { content_hash: 'bad-hash' },
    { imported_at: '2026-01-10' }, { timestamp: '2026-01-10T09:00:00' },
    { timestamp: '2026-02-30T09:00:00Z' }, { timestamp: '2026-01-10T24:00:00Z' },
    { classification: 'TAXABLE' }, { raw_payload_ref: 'https://example.com/raw' }
  ])('rejects malformed metadata before writing: %j', async (invalid) => {
    const store = new InMemoryEvidenceStore()
    await expect(store.append({ ...input(), ...invalid } as EvidenceInput, 'raw')).rejects.toThrow(TypeError)
    expect(await store.getByHash(sha256('raw'))).toEqual([])
    expect(await store.getPayload(sha256('raw'))).toBeUndefined()
  })

  it('rejects parsed objects instead of silently reserializing imported evidence', async () => {
    await expect(new InMemoryEvidenceStore().append(input(), {} as Uint8Array)).rejects.toThrow(TypeError)
  })
})
