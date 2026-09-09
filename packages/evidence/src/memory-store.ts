import {
  canonicalJson, EVIDENCE_TYPES, isContentHash, isSlug, isUlid, sha256
} from '../../core/src/index.ts'
import type { ContentHash } from '../../core/src/index.ts'
import type { EvidenceInput, EvidenceRecord, EvidenceStore } from './types.ts'

export class EvidenceConflictError extends Error {
  constructor() {
    super('Evidence ID already exists with different metadata or payload')
    this.name = 'EvidenceConflictError'
  }
}

const INPUT_KEYS = new Set([
  'evidence_id', 'evidence_type', 'source_system', 'source_identifier',
  'timestamp', 'content_hash', 'imported_at', 'schema_version'
])

function requireTimestamp(value: string): void {
  // Preserve the source offset; never silently interpret an unzoned local date.
  if (typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ||
      !Number.isFinite(Date.parse(value))) {
    throw new TypeError('Evidence timestamps must be valid instants with explicit timezones')
  }
  const date = value.slice(0, 10)
  const parsedDate = new Date(`${date}T00:00:00Z`)
  if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date ||
      Number(value.slice(11, 13)) > 23) {
    throw new TypeError('Evidence timestamp has an invalid calendar date or hour')
  }
}

function validateInput(input: EvidenceInput): void {
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      Object.keys(input).some((key) => !INPUT_KEYS.has(key))) {
    throw new TypeError('Evidence input contains unsupported fields')
  }
  if (typeof input.evidence_id !== 'string' ||
      (!isSlug(input.evidence_id) && !isUlid(input.evidence_id))) {
    throw new TypeError('Evidence ID must be a ULID or kebab-case slug')
  }
  if (!EVIDENCE_TYPES.includes(input.evidence_type)) throw new TypeError('Invalid evidence type')
  if (typeof input.source_system !== 'string' || !input.source_system.trim()) {
    throw new TypeError('Evidence requires a source system')
  }
  if (input.source_identifier !== undefined && typeof input.source_identifier !== 'string') {
    throw new TypeError('Evidence source identifier must be a string')
  }
  if (typeof input.schema_version !== 'string' || !/^\d+\.\d+\.\d+$/.test(input.schema_version)) {
    throw new TypeError('Invalid evidence schema version')
  }
  requireTimestamp(input.imported_at)
  if (input.timestamp !== undefined) requireTimestamp(input.timestamp)
  if (input.content_hash !== undefined &&
      (typeof input.content_hash !== 'string' || !isContentHash(input.content_hash))) {
    throw new TypeError('Invalid evidence content hash')
  }
}

/** Ephemeral, instance-local storage. No network, filesystem, or global ledger. */
export class InMemoryEvidenceStore implements EvidenceStore {
  readonly #records = new Map<string, EvidenceRecord>()
  readonly #byHash = new Map<ContentHash, readonly EvidenceRecord[]>()
  readonly #blobs = new Map<ContentHash, Uint8Array>()

  async append(input: EvidenceInput, payload: string | Uint8Array): Promise<EvidenceRecord> {
    // Snapshot before validating, hashing, or returning control to the caller.
    const metadata = { ...input }
    validateInput(metadata)
    if (typeof payload !== 'string' && !(payload instanceof Uint8Array)) {
      throw new TypeError('Evidence payload must be a string or Uint8Array')
    }
    // Uint8Array construction copies Buffers too (Buffer.slice would alias).
    const bytes = typeof payload === 'string'
      ? new Uint8Array(Buffer.from(payload, 'utf8')) : new Uint8Array(payload)
    const hash = sha256(bytes)
    if (metadata.content_hash !== undefined && metadata.content_hash !== hash) {
      throw new TypeError('Evidence content hash does not match the raw payload')
    }
    const record: EvidenceRecord = Object.freeze({
      ...metadata, content_hash: hash, raw_payload_ref: hash
    })
    const existingBytes = this.#blobs.get(hash)
    if (existingBytes && (existingBytes.length !== bytes.length ||
        existingBytes.some((byte, index) => byte !== bytes[index]))) {
      throw new Error('Evidence hash collision: refusing to replace the stored blob')
    }
    const existing = this.#records.get(record.evidence_id)
    if (existing) {
      if (canonicalJson({ ...existing }) !== canonicalJson({ ...record })) {
        throw new EvidenceConflictError()
      }
      return existing
    }
    // No awaits between validation and writes: append is atomic within this instance.
    if (!existingBytes) this.#blobs.set(hash, bytes)
    this.#records.set(record.evidence_id, record)
    this.#byHash.set(hash, [...(this.#byHash.get(hash) ?? []), record])
    return record
  }

  async getById(evidenceId: string): Promise<EvidenceRecord | undefined> {
    return this.#records.get(evidenceId)
  }

  async getByHash(hash: ContentHash): Promise<readonly EvidenceRecord[]> {
    return Object.freeze([...(this.#byHash.get(hash) ?? [])])
  }

  async getPayload(hash: ContentHash): Promise<Uint8Array | undefined> {
    const bytes = this.#blobs.get(hash)
    return bytes === undefined ? undefined : new Uint8Array(bytes)
  }
}
