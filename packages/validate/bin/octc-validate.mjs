#!/usr/bin/env node
/**
 * `pnpm validate` entry point.
 *
 * The checks are plain ESM once TypeScript types are stripped, so this runs
 * straight from source under Node 22's `--experimental-strip-types` rather than
 * requiring a build before the repository can be validated. If we were not
 * started with that flag, re-exec ourselves with it.
 */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = process.env.OCTC_ROOT ?? resolve(here, '../../..')

if (!process.execArgv.some((a) => a.includes('strip-types') || a.includes('transform-types'))) {
  const { spawnSync } = await import('node:child_process')
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', '--no-warnings', fileURLToPath(import.meta.url), ...process.argv.slice(2)],
    { stdio: 'inherit', env: process.env }
  )
  process.exit(result.status ?? 1)
}

const { validateRepo } = await import('../src/index.ts')

const result = await validateRepo({ root })

const format = (i) => `  ${i.severity === 'error' ? 'ERROR' : 'warn '}  [${i.check}] ${i.file}: ${i.message}`

for (const issue of result.warnings) console.warn(format(issue))
for (const issue of result.errors) console.error(format(issue))

const counts = `${result.errors.length} error(s), ${result.warnings.length} warning(s)`
if (result.ok) {
  console.log(`octc-validate: OK — ${counts}`)
  process.exit(0)
}
console.error(`octc-validate: FAILED — ${counts}`)
process.exit(1)
