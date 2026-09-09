# Evidence store

Append-only raw evidence for P0-1-01. `InMemoryEvidenceStore` is ephemeral and
instance-local; it performs no network or filesystem writes. Private workspace
persistence will require a local backend implementing `EvidenceStore`.

```ts
import { InMemoryEvidenceStore } from './src/index.ts'

const store = new InMemoryEvidenceStore()
const record = await store.append({
  evidence_id: 'synthetic-import-1',
  evidence_type: 'generic_csv',
  source_system: 'user-csv',
  source_identifier: 'synthetic.csv',
  imported_at: '2026-01-10T09:00:00.000Z',
  schema_version: '0.1.0'
}, 'asset,quantity\nexample,0.000001\n')

await store.getById(record.evidence_id)
await store.getByHash(record.content_hash) // every source record for these bytes
await store.getPayload(record.content_hash) // defensive copy of the original bytes
```

Strings become UTF-8 bytes; binary payloads remain byte-for-byte intact. SHA-256
comes from `packages/core`. Raw JSON is never parsed or canonicalized before
hashing. `raw_payload_ref` is the local blob key, equal to `content_hash`, and is
not a remote URL. An optional input `content_hash` verifies importer expectations.

The importer supplies the evidence ID, import time and schema version. Repeating
the same ID, metadata and bytes is idempotent. Changing metadata or content under
that ID throws `EvidenceConflictError` without changing storage. Distinct IDs
sharing a payload retain all provenance while deduplicating the blob. Hash lookup
returns records in append order. Missing ID/blob reads return `undefined`; missing
hash lookups return an empty array. Empty payloads are valid evidence.

There is no update/delete API. Corrections belong in separate annotations or new
derived records referencing the original evidence ID (AC-009). This package does
not normalize events or infer tax treatment.

## SQLite backend contract

The asynchronous `EvidenceStore` interface in `src/types.ts` is the persistence
boundary; this task does not implement a SQLite driver. A backend must:

- Store blobs keyed by content hash and source records keyed by evidence ID,
  with a non-unique hash index and an append sequence for ordered lookups.
- Verify hashes and atomically insert blobs and metadata in one transaction.
- Enforce ID uniqueness, allowing exact retries while rejecting conflicting
  metadata or bytes; never use replacement/upsert semantics that erase evidence.
- Deduplicate only blobs, retaining distinct source records, and return isolated
  read snapshots. Reuse the factory-based store contract tests for conformance.
- Keep private data local. Encryption, persistence lifecycle, backup and project
  deletion remain responsibilities of the future workspace/backend layer.

Validation: `corepack pnpm exec vitest run packages/evidence/test` and
`corepack pnpm exec tsc -p packages/evidence/tsconfig.json --noEmit`.
