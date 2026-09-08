export type Severity = 'error' | 'warning'

export interface Issue {
  readonly check: string
  readonly severity: Severity
  readonly file: string
  readonly message: string
  readonly pointer?: string
}

export interface CheckContext {
  /** Repository root. */
  readonly root: string
}

export interface Check {
  readonly name: string
  run(ctx: CheckContext): Promise<Issue[]> | Issue[]
}

/**
 * Every check today is synchronous. The `Check` union keeps the door open for
 * an async one later (P1 wants a HEAD request to detect stale sources), but
 * concrete checks declare this narrower type so callers get `Issue[]` back
 * without having to await something that never suspends.
 */
export interface SyncCheck extends Check {
  run(ctx: CheckContext): Issue[]
}

export const error = (check: string, file: string, message: string, pointer?: string): Issue =>
  pointer === undefined
    ? { check, severity: 'error', file, message }
    : { check, severity: 'error', file, message, pointer }

export const warning = (check: string, file: string, message: string): Issue => ({
  check,
  severity: 'warning',
  file,
  message
})
