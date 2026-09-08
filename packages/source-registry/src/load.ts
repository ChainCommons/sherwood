import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { AuthorityLevel, SourceType } from '@octc/core'
import type { Source, SourceVersion } from './types.ts'
import { parseYaml } from './yaml.ts'

const DATA_EXT = /\.(ya?ml|json)$/

function walkFiles(dir: string): string[] {
  const out: string[] = []
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    if (name.startsWith('.')) continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walkFiles(full))
    else if (DATA_EXT.test(name)) out.push(full)
  }
  return out.sort()
}

export function readDataFile(path: string): unknown {
  const text = readFileSync(path, 'utf8')
  if (path.endsWith('.json')) return JSON.parse(text) as unknown
  return parseYaml(text)
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function asString(v: unknown, field: string): string {
  if (typeof v !== 'string' || v.length === 0) {
    throw new TypeError(`${field} must be a non-empty string`)
  }
  return v
}

function asOptionalString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined
}

function asStringArray(v: unknown): string[] | undefined {
  if (v === undefined) return undefined
  if (!Array.isArray(v) || !v.every((x) => typeof x === 'string')) {
    throw new TypeError('expected string array')
  }
  return v as string[]
}

function opt<T extends string>(key: T, value: string | undefined): { [K in T]: string } | object {
  return value !== undefined ? ({ [key]: value } as { [K in T]: string }) : {}
}

function optArr<T extends string>(
  key: T,
  value: string[] | undefined
): { [K in T]: string[] } | object {
  return value !== undefined ? ({ [key]: value } as { [K in T]: string[] }) : {}
}

/** Coerce a YAML/JSON document into a Source; throws on missing required fields. */
export function parseSource(doc: unknown, path = '<source>'): Source {
  if (!isRecord(doc)) throw new TypeError(`${path}: source must be an object`)
  return {
    source_id: asString(doc.source_id, 'source_id'),
    jurisdiction_id: asString(doc.jurisdiction_id, 'jurisdiction_id'),
    source_type: asString(doc.source_type, 'source_type') as SourceType,
    authority_level: asString(doc.authority_level, 'authority_level') as AuthorityLevel,
    title: asString(doc.title, 'title'),
    schema_version: asString(doc.schema_version, 'schema_version'),
    ...opt('issuing_authority', asOptionalString(doc.issuing_authority)),
    ...opt('canonical_reference', asOptionalString(doc.canonical_reference)),
    ...opt('original_language', asOptionalString(doc.original_language)),
    ...opt('publication_date', asOptionalString(doc.publication_date)),
    ...opt('published_from', asOptionalString(doc.published_from)),
    ...opt('effective_from', asOptionalString(doc.effective_from)),
    ...opt('effective_to', asOptionalString(doc.effective_to)),
    ...opt('repealed_at', asOptionalString(doc.repealed_at)),
    ...opt('retrieved_at', asOptionalString(doc.retrieved_at)),
    ...opt('canonical_url', asOptionalString(doc.canonical_url)),
    ...opt('archive_reference', asOptionalString(doc.archive_reference)),
    ...opt('content_hash', asOptionalString(doc.content_hash)),
    ...optArr('supersedes', asStringArray(doc.supersedes)),
    ...optArr('superseded_by', asStringArray(doc.superseded_by)),
    ...opt('licence', asOptionalString(doc.licence)),
    ...opt('permitted_extract', asOptionalString(doc.permitted_extract)),
    ...opt('notes', asOptionalString(doc.notes))
  }
}

export function parseSourceVersion(doc: unknown, path = '<source-version>'): SourceVersion {
  if (!isRecord(doc)) throw new TypeError(`${path}: source version must be an object`)
  const predecessor =
    doc.predecessor === undefined
      ? undefined
      : doc.predecessor === null
        ? null
        : asString(doc.predecessor, 'predecessor')
  const successor =
    doc.successor === undefined
      ? undefined
      : doc.successor === null
        ? null
        : asString(doc.successor, 'successor')

  return {
    source_version_id: asString(doc.source_version_id, 'source_version_id'),
    source_id: asString(doc.source_id, 'source_id'),
    retrieved_at: asString(doc.retrieved_at, 'retrieved_at'),
    schema_version: asString(doc.schema_version, 'schema_version'),
    ...opt('version_label', asOptionalString(doc.version_label)),
    ...opt('publication_date', asOptionalString(doc.publication_date)),
    ...opt('published_from', asOptionalString(doc.published_from)),
    ...opt('effective_from', asOptionalString(doc.effective_from)),
    ...opt('effective_to', asOptionalString(doc.effective_to)),
    ...opt('archive_url', asOptionalString(doc.archive_url)),
    ...opt('content_hash', asOptionalString(doc.content_hash)),
    ...(predecessor !== undefined ? { predecessor } : {}),
    ...(successor !== undefined ? { successor } : {}),
    ...opt('permitted_extract', asOptionalString(doc.permitted_extract)),
    ...(isRecord(doc.extracted_facts) ? { extracted_facts: doc.extracted_facts } : {})
  }
}

export function loadSourcesFromDir(dir: string): Source[] {
  const sources: Source[] = []
  for (const file of walkFiles(dir)) {
    const doc = readDataFile(file)
    if (!isRecord(doc) || typeof doc.source_id !== 'string') continue
    if (typeof doc.source_version_id === 'string') continue
    sources.push(parseSource(doc, file))
  }
  return sources
}

export function loadSourceVersionsFromDir(dir: string): SourceVersion[] {
  const versions: SourceVersion[] = []
  for (const file of walkFiles(dir)) {
    const doc = readDataFile(file)
    if (!isRecord(doc) || typeof doc.source_version_id !== 'string') continue
    versions.push(parseSourceVersion(doc, file))
  }
  return versions
}
