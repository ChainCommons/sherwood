/**
 * Cross-document references (plan 16 §85).
 *
 * A rule that cites a `source_id` no file declares looks sourced but is not,
 * which is the exact appearance of authority this project must not produce.
 */
import { join } from 'node:path'
import type { Issue, SyncCheck } from '../types.ts'
import { error } from '../types.ts'
import { isDataFile, readData, rel, walk } from '../fs-utils.ts'

const DATA_ROOTS = ['jurisdictions', 'scenarios', 'cases']

export const references: SyncCheck = {
  name: 'references',
  run({ root }): Issue[] {
    const declaredSources = new Set<string>()
    const declaredJurisdictions = new Set<string>()
    const declaredRules = new Set<string>()
    const docs: Array<{ path: string; doc: Record<string, unknown> }> = []

    for (const dir of DATA_ROOTS) {
      for (const file of walk(join(root, dir), isDataFile)) {
        let doc: unknown
        try {
          doc = readData(file)
        } catch {
          continue
        }
        if (typeof doc !== 'object' || doc === null || Array.isArray(doc)) continue
        const record = doc as Record<string, unknown>
        docs.push({ path: rel(root, file), doc: record })

        if (typeof record.source_id === 'string' && record.source_version_id === undefined) {
          declaredSources.add(record.source_id)
        }
        if (typeof record.rule_id === 'string') declaredRules.add(record.rule_id)
        if (typeof record.jurisdiction_type === 'string' && typeof record.jurisdiction_id === 'string') {
          declaredJurisdictions.add(record.jurisdiction_id)
        }
      }
    }

    const issues: Issue[] = []
    for (const { path, doc } of docs) {
      const sources = Array.isArray(doc.sources) ? doc.sources : []
      for (const s of sources) {
        if (typeof s === 'string' && !declaredSources.has(s)) {
          issues.push(error('references', path, `cites unknown source_id "${s}"`))
        }
      }

      // Foreign key onto a pack, but only where a pack manifest is expected.
      const jid = doc.jurisdiction_id ?? doc.jurisdiction
      if (
        typeof jid === 'string' &&
        doc.jurisdiction_type === undefined &&
        declaredJurisdictions.size > 0 &&
        !declaredJurisdictions.has(jid)
      ) {
        issues.push(error('references', path, `references unknown jurisdiction_id "${jid}"`))
      }

      for (const field of ['supersedes', 'superseded_by'] as const) {
        const list = Array.isArray(doc[field]) ? (doc[field] as unknown[]) : []
        for (const value of list) {
          if (typeof value !== 'string') continue
          if (!declaredRules.has(value) && !declaredSources.has(value)) {
            issues.push(error('references', path, `${field} points at unknown id "${value}"`))
          }
        }
      }

      // `references` names another *rule* this one builds on, possibly in a pack
      // this jurisdiction depends on. A source id here would be the copy-paste
      // the field exists to avoid, so sources are not accepted as a fallback.
      const references = Array.isArray(doc.references) ? (doc.references as unknown[]) : []
      for (const value of references) {
        if (typeof value !== 'string') continue
        if (!declaredRules.has(value)) {
          issues.push(
            error(
              'references',
              path,
              declaredSources.has(value)
                ? `references points at source_id "${value}"; cite authorities in sources, not references`
                : `references points at unknown rule_id "${value}"`
            )
          )
        }
      }
    }
    return issues
  }
}
