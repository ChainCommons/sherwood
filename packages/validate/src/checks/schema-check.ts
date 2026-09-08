/**
 * Validates every data file that names a schema.
 *
 * A file opts in with `$schema`. Files that name no schema are skipped here and
 * picked up by the structural checks — this keeps the validator usable on an
 * empty repo while still failing hard on a document that claims a schema and
 * does not match it.
 */
import { join } from 'node:path'
import type { Issue, SyncCheck } from '../types.ts'
import { error } from '../types.ts'
import { isDataFile, readData, rel, walk } from '../fs-utils.ts'
import { loadSchemas } from '../schema-registry.ts'

const DATA_ROOTS = ['jurisdictions', 'scenarios', 'cases', 'tests', 'domain-packs']

const schemaPathOf = (doc: unknown): string | undefined => {
  if (typeof doc !== 'object' || doc === null) return undefined
  const raw = (doc as Record<string, unknown>).$schema
  return typeof raw === 'string' ? raw : undefined
}

/** Map a `$schema` value onto a repo-relative schemas/ path. */
const toRepoPath = (value: string): string | undefined => {
  if (value.startsWith('schemas/')) return value
  const marker = 'schemas.opencryptotaxcommons.org/'
  const at = value.indexOf(marker)
  if (at >= 0) return 'schemas/' + value.slice(at + marker.length)
  return undefined
}

export const schemaCheck: SyncCheck = {
  name: 'schema',
  run({ root }): Issue[] {
    const registry = loadSchemas(root)
    const issues: Issue[] = []

    for (const dir of DATA_ROOTS) {
      const files = walk(join(root, dir), isDataFile)
      for (const file of files) {
        const path = rel(root, file)
        let doc: unknown
        try {
          doc = readData(file)
        } catch (e) {
          issues.push(error('schema', path, `unparseable: ${(e as Error).message}`))
          continue
        }
        // A fixture may hold a single record or an array of them; each entry
        // declares its own $schema so a file of legs stays self-describing.
        const records = Array.isArray(doc) ? doc : [doc]
        records.forEach((record, index) => {
          const where = Array.isArray(doc) ? `${path}[${index}]` : path
          const declared = schemaPathOf(record)
          if (declared === undefined) return

          const repoPath = toRepoPath(declared)
          const validate = repoPath === undefined ? undefined : registry.byPath.get(repoPath)
          if (validate === undefined) {
            issues.push(error('schema', where, `declares unknown schema: ${declared}`))
            return
          }

          // `$schema` is the pointer to the contract, not part of the document.
          const { $schema: _ignored, ...payload } = record as Record<string, unknown>
          if (!validate(payload)) {
            for (const err of validate.errors ?? []) {
              issues.push(
                error('schema', where, `${err.instancePath || '/'} ${err.message ?? 'invalid'}`, err.instancePath)
              )
            }
          }
        })
      }
    }
    return issues
  }
}
