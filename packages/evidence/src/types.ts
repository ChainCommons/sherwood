import type { ContentHash, EvidenceType } from '../../core/src/index.ts'

/** Structural counterpart of schemas/evidence/evidence.schema.json. */
export interface EvidenceRecord {
  readonly evidence_id: string
  readonly evidence_type: EvidenceType
  readonly source_system: string
  readonly source_identifier?: string
  readonly timestamp?: string
  readonly raw_payload_ref: string
  readonly content_hash: ContentHash
  readonly imported_at: string
  readonly schema_version: string
}

/** IDs and import times belong to the importer, making retries reproducible. */
export type EvidenceInput = Omit<EvidenceRecord, 'content_hash' | 'raw_payload_ref'> & {
  /** Optional integrity check; a mismatch rejects the append. */
  readonly content_hash?: ContentHash
}

/**
 * Local storage contract, also intended for a future SQLite implementation.
 *
 * append atomically stores metadata and the raw blob. Identical ID + metadata
 * + bytes is an idempotent retry; any change under that ID must reject without
 * writing anything. Different IDs may share a blob while retaining provenance.
 * All returned values must be immutable snapshots or defensive copies.
 * There is deliberately no update/delete API: corrections live in separate
 * annotations or new derived records that reference the original evidence ID.
 */
export interface EvidenceStore {
  append(input: EvidenceInput, payload: string | Uint8Array): Promise<EvidenceRecord>
  getById(evidenceId: string): Promise<EvidenceRecord | undefined>
  /** All source records for these exact bytes, in append order. */
  getByHash(hash: ContentHash): Promise<readonly EvidenceRecord[]>
  /** Exact imported bytes, or undefined when absent (including after rejection). */
  getPayload(hash: ContentHash): Promise<Uint8Array | undefined>
}
