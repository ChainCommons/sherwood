/**
 * Secret scan (plan 16 §85, plan 12).
 *
 * The project must never request or store private keys, seed phrases or
 * recovery phrases, so committing anything shaped like one fails CI. Tezos
 * secret keys (`edsk`/`spsk`/`p2sk`) are checked explicitly because a Tezos
 * repo is exactly where one gets pasted by accident.
 */
import type { Issue, SyncCheck } from '../types.ts'
import { error } from '../types.ts'
import { readText, rel, walk } from '../fs-utils.ts'

interface Pattern {
  readonly name: string
  readonly re: RegExp
}

const PATTERNS: readonly Pattern[] = [
  { name: 'tezos secret key', re: /\b(?:edsk|spsk|p2sk)[1-9A-HJ-NP-Za-km-z]{30,}\b/ },
  { name: 'private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { name: 'aws access key id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'github token', re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { name: 'slack token', re: /\bxox[abpsr]-[A-Za-z0-9-]{10,}\b/ },
  { name: 'generic api key assignment', re: /\b(?:api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*["'][A-Za-z0-9/+_-]{24,}["']/i }
]

/** BIP-39 phrases are matched by shape rather than by shipping a wordlist. */
const MNEMONIC_HINT = /\b(?:mnemonic|seed[_ -]?phrase|recovery[_ -]?phrase)\s*[:=]\s*["'][a-z]+(?: [a-z]+){11,23}["']/i

const SCANNED = /\.(ts|tsx|js|mjs|cjs|json|ya?ml|md|env|txt|sh)$/

export const secrets: SyncCheck = {
  name: 'secrets',
  run({ root }): Issue[] {
    const issues: Issue[] = []
    for (const file of walk(root, (p) => SCANNED.test(p))) {
      const path = rel(root, file)
      // This file defines the patterns; scanning it would always match.
      if (path.endsWith('packages/validate/src/checks/secrets.ts')) continue
      const lines = readText(file).split('\n')
      lines.forEach((line, i) => {
        for (const { name, re } of PATTERNS) {
          if (re.test(line)) issues.push(error('secrets', path, `possible ${name} at line ${i + 1}`))
        }
        if (MNEMONIC_HINT.test(line)) {
          issues.push(error('secrets', path, `possible seed phrase at line ${i + 1}`))
        }
      })
    }
    return issues
  }
}
