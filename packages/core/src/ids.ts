/**
 * Identifiers. ULIDs are lexicographically sortable by creation time, which
 * keeps append-only evidence tables naturally ordered (plan 02, INV-001).
 */
import { randomBytes } from 'node:crypto'

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const ULID_RE = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/

export type Ulid = string & { readonly __brand: 'Ulid' }

const encodeTime = (ms: number): string => {
  let out = ''
  let t = ms
  for (let i = 0; i < 10; i++) {
    out = CROCKFORD[t % 32] + out
    t = Math.floor(t / 32)
  }
  return out
}

const encodeRandom = (): string => {
  const bytes = randomBytes(16)
  let out = ''
  for (let i = 0; i < 16; i++) out += CROCKFORD[bytes[i]! % 32]
  return out
}

export function ulid(now: number = Date.now()): Ulid {
  return (encodeTime(now) + encodeRandom()) as Ulid
}

export const isUlid = (value: string): value is Ulid => ULID_RE.test(value)

export function assertUlid(value: string): Ulid {
  if (!isUlid(value)) throw new TypeError(`not a ULID: ${value}`)
  return value
}

/**
 * Slug used for hand-authored knowledge IDs (`fr-bofip-2019-nft-01`). Machine
 * records use ULIDs; anything a human writes in YAML uses this shape so IDs
 * stay stable across pack edits.
 */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const isSlug = (value: string): boolean => SLUG_RE.test(value)

export function assertSlug(value: string): string {
  if (!isSlug(value)) throw new TypeError(`not a kebab-case slug: ${value}`)
  return value
}
