import { hashJson, sha256 } from '../../../packages/core/src/index.ts'
import type { EvidenceRecord, EvidenceStore } from '../../../packages/evidence/src/index.ts'
import type { TechnicalTx } from '../../../packages/event-engine/src/types.ts'

/** Only the history capability is needed here; transport/paging belongs to P0-2-01. */
export interface WalletHistorySource {
  readonly id: string
  /** Yield exact JSON response bytes, containing an operation or an array of operations. */
  fetchOperations(address: string): AsyncIterable<string | Uint8Array>
}

export interface ImportIssue {
  source_evidence: string[]
  reason: 'UNMAPPED_PAYLOAD'
  detail: string
}

export interface WalletImportOptions {
  address: string
  /** Explicit network identity, e.g. tezos:mainnet; never inferred from the wallet. */
  chain: string
  importedAt: string
  source: WalletHistorySource
  store: EvidenceStore
  map: (payload: unknown, context: { chain: string; evidenceId: string }) => TechnicalTx[]
}

/** Importing an address does not assert ownership. All persistence uses the caller's local store. */
export async function importPublicWallet(options: WalletImportOptions): Promise<{
  evidence: EvidenceRecord[]; transactions: TechnicalTx[]; issues: ImportIssue[]
}> {
  // Accept public Tezos account syntax only. No credential-shaped input reaches a provider.
  if (!/^(?:tz[1-4]|KT1)[1-9A-HJ-NP-Za-km-z]{33}$/.test(options.address)) {
    throw new TypeError('A public Tezos account address is required')
  }
  if (!options.chain.trim() || !options.source.id.trim()) {
    throw new TypeError('Explicit chain and source identities are required')
  }
  const evidence = new Map<string, EvidenceRecord>()
  const transactions: TechnicalTx[] = []
  const issues: ImportIssue[] = []
  for await (const raw of options.source.fetchOperations(options.address)) {
    const bytes = typeof raw === 'string' ? new Uint8Array(Buffer.from(raw)) : new Uint8Array(raw)
    const hash = sha256(bytes)
    const evidenceId = `tezos-evidence-${hashJson({
      chain: options.chain, source: options.source.id, hash,
    }).slice(7)}`
    // Preserve the original import timestamp on a repeated fetch of identical evidence.
    const existing = await options.store.getById(evidenceId)
    const record = await options.store.append({
      evidence_id: evidenceId,
      evidence_type: 'blockchain_operation',
      source_system: options.source.id,
      source_identifier: `${options.chain}:${hash}`,
      imported_at: existing?.imported_at ?? options.importedAt,
      content_hash: hash,
      schema_version: '1.0.0',
    }, bytes)
    if (evidence.has(evidenceId)) continue
    evidence.set(evidenceId, record)
    try {
      const payload: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
      // Each operation is mapped independently so an unsupported record cannot hide its siblings.
      const operations = Array.isArray(payload) ? payload : [payload]
      for (const operation of operations) {
        try {
          transactions.push(...options.map(operation, { chain: options.chain, evidenceId }))
        } catch (error) {
          issues.push({ source_evidence: [evidenceId], reason: 'UNMAPPED_PAYLOAD',
            detail: error instanceof Error ? error.message : 'Operation mapping failed' })
        }
      }
    } catch {
      issues.push({ source_evidence: [evidenceId], reason: 'UNMAPPED_PAYLOAD',
        detail: 'Payload is not valid UTF-8 JSON' })
    }
  }
  return { evidence: [...evidence.values()], transactions, issues }
}
