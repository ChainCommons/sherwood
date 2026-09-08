/**
 * Content hashing for raw evidence and provider payloads (plan 03, plan 06 §37).
 *
 * Hashes are the join key between an immutable blob and every record derived
 * from it, so the JSON form has to be canonical: object keys sorted, no
 * incidental whitespace. Otherwise two imports of the same payload hash
 * differently and evidence de-duplication breaks.
 */
import { createHash } from 'node:crypto'

export type ContentHash = string & { readonly __brand: 'ContentHash' }

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export function sha256(data: string | Uint8Array): ContentHash {
  return ('sha256:' + createHash('sha256').update(data).digest('hex')) as ContentHash
}

/** Deterministic JSON: recursively sorted keys, undefined dropped. */
export function canonicalJson(value: JsonValue): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']'
  const keys = Object.keys(value).sort()
  const body = keys
    .filter((k) => value[k] !== undefined)
    .map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k]!)}`)
    .join(',')
  return '{' + body + '}'
}

export const hashJson = (value: JsonValue): ContentHash => sha256(canonicalJson(value))

export const isContentHash = (value: string): value is ContentHash =>
  /^sha256:[0-9a-f]{64}$/.test(value)
