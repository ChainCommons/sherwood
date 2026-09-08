import { describe, expect, it } from 'vitest'
import { assertSlug, assertUlid, isSlug, isUlid, ulid } from '../src/ids.ts'
import { canonicalJson, hashJson, isContentHash, sha256 } from '../src/hash.ts'

describe('ids', () => {
  it('generates ULIDs that validate and sort by creation time', () => {
    const early = ulid(1_600_000_000_000)
    const late = ulid(1_700_000_000_000)
    expect(isUlid(early)).toBe(true)
    expect(early.length).toBe(26)
    expect(early < late).toBe(true)
  })

  it('rejects the ambiguous Crockford letters', () => {
    expect(isUlid('01J8Z3QKQ0EVIDENCE0100000O')).toBe(false)
    expect(() => assertUlid('nope')).toThrow(/not a ULID/)
  })

  it('accepts kebab-case knowledge ids only', () => {
    expect(isSlug('fr-bofip-2019-nft-01')).toBe(true)
    expect(isSlug('FR_BOFIP')).toBe(false)
    expect(() => assertSlug('Not A Slug')).toThrow(/kebab-case/)
  })
})

describe('hash', () => {
  it('hashes the same payload identically regardless of key order', () => {
    // Two imports of one operation must de-duplicate, so key order in the
    // provider's JSON cannot change the content hash.
    const a = hashJson({ b: 2, a: 1, nested: { y: false, x: [1, 2] } })
    const b = hashJson({ nested: { x: [1, 2], y: false }, a: 1, b: 2 })
    expect(a).toBe(b)
    expect(isContentHash(a)).toBe(true)
  })

  it('preserves array order, which is meaningful', () => {
    expect(hashJson({ legs: [1, 2] })).not.toBe(hashJson({ legs: [2, 1] }))
  })

  it('produces canonical JSON with sorted keys', () => {
    expect(canonicalJson({ b: 1, a: [true, null] })).toBe('{"a":[true,null],"b":1}')
  })

  it('prefixes the algorithm so a future change is visible', () => {
    expect(sha256('')).toBe(
      'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    )
  })
})
