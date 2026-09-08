/**
 * Ajv registry over `schemas/`.
 *
 * Schemas cross-reference by relative path (`../common.schema.json#/$defs/id`),
 * so each one is registered under both its `$id` and its repo-relative path.
 * That lets a document declare `$schema` either way.
 */
import { join } from 'node:path'
import Ajv2020, { type ValidateFunction } from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { isDataFile, readJson, rel, walk } from './fs-utils.ts'

export interface SchemaRegistry {
  readonly ajv: Ajv2020
  /** Repo-relative path → compiled validator. */
  readonly byPath: ReadonlyMap<string, ValidateFunction>
  readonly ids: readonly string[]
}

export function loadSchemas(root: string): SchemaRegistry {
  const schemaDir = join(root, 'schemas')
  const files = walk(schemaDir, (p) => p.endsWith('.schema.json'))

  const ajv = new Ajv2020({
    strict: false,
    allErrors: true,
    // Documents are validated one at a time; refs resolve through addSchema.
    validateFormats: true
  })
  addFormats(ajv)

  const docs = files.map((file) => ({ file, doc: readJson(file) as Record<string, unknown> }))

  // Register by $id first so relative refs between schemas resolve.
  for (const { file, doc } of docs) {
    const id = typeof doc.$id === 'string' ? doc.$id : rel(root, file)
    ajv.addSchema(doc, id)
  }

  const byPath = new Map<string, ValidateFunction>()
  const ids: string[] = []
  for (const { file, doc } of docs) {
    const path = rel(root, file)
    const id = typeof doc.$id === 'string' ? doc.$id : path
    ids.push(id)
    byPath.set(path, ajv.compile(doc))
  }

  return { ajv, byPath, ids }
}

export { isDataFile }
