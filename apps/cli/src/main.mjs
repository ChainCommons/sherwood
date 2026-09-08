#!/usr/bin/env node
/**
 * Stub CLI.
 *
 * Only `validate` is wired up, because that is the one capability Wave 0
 * actually delivers — the same checks CI runs, available locally. Import,
 * analysis and export commands arrive with the engines they would call.
 */
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '../../..')
const [command] = process.argv.slice(2)

const usage = `octc — Open Crypto Tax Commons

Usage:
  octc validate    Run repository validation (schemas, IDs, dates, links, invariants)
  octc help        Show this message

Not implemented yet: import, analyze, export. Those land with the engines.
This tool is not tax advice; see DISCLAIMER.md.
`

if (command === 'validate') {
  const bin = resolve(repoRoot, 'packages/validate/bin/octc-validate.mjs')
  const result = spawnSync(process.execPath, [bin], { stdio: 'inherit' })
  process.exit(result.status ?? 1)
}

if (command === undefined || command === 'help' || command === '--help') {
  process.stdout.write(usage)
  process.exit(0)
}

process.stderr.write(`octc: unknown command "${command}"\n\n${usage}`)
process.exit(1)
