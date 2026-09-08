/**
 * Minimal YAML subset parser for knowledge-pack fixtures.
 *
 * Supports maps, sequences, scalars, and block scalars enough for source/rule
 * YAML without pulling a new lockfile dependency (Steward owns pnpm-lock.yaml).
 */
export function parseYaml(text: string): unknown {
  const lines = text.replace(/\r\n/g, '\n').replace(/\t/g, '  ').split('\n')
  const { value, next } = parseBlock(lines, 0, 0)
  // Trailing comments / blanks are fine; anything else is unexpected.
  for (let i = next; i < lines.length; i++) {
    const t = lines[i]!.trim()
    if (t === '' || t.startsWith('#')) continue
    throw new SyntaxError(`unexpected content at line ${i + 1}: ${lines[i]}`)
  }
  return value
}

interface ParseResult {
  value: unknown
  next: number
}

function indentOf(line: string): number {
  const m = /^ */.exec(line)
  return m ? m[0].length : 0
}

function stripComment(line: string): string {
  let inSingle = false
  let inDouble = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!
    if (c === "'" && !inDouble) inSingle = !inSingle
    else if (c === '"' && !inSingle) {
      if (i === 0 || line[i - 1] !== '\\') inDouble = !inDouble
    } else if (c === '#' && !inSingle && !inDouble) {
      return line.slice(0, i).trimEnd()
    }
  }
  return line
}

function parseBlock(lines: string[], start: number, minIndent: number): ParseResult {
  let i = start
  while (i < lines.length) {
    const raw = lines[i]!
    const trimmed = raw.trim()
    if (trimmed === '' || trimmed.startsWith('#')) {
      i++
      continue
    }
    break
  }
  if (i >= lines.length) return { value: null, next: i }

  const first = stripComment(lines[i]!)
  const ind = indentOf(first)
  if (ind < minIndent) return { value: null, next: i }

  const body = first.trim()
  if (body.startsWith('- ')) {
    return parseSequence(lines, i, ind)
  }
  if (/^[^:]+:(\s|$)/.test(body) || body.endsWith(':')) {
    return parseMapping(lines, i, ind)
  }
  return { value: parseScalar(body), next: i + 1 }
}

function parseMapping(lines: string[], start: number, indent: number): ParseResult {
  const obj: Record<string, unknown> = {}
  let i = start
  while (i < lines.length) {
    const raw = lines[i]!
    const trimmed = raw.trim()
    if (trimmed === '' || trimmed.startsWith('#')) {
      i++
      continue
    }
    const line = stripComment(raw)
    const ind = indentOf(line)
    if (ind < indent) break
    if (ind > indent) {
      throw new SyntaxError(`unexpected indent at line ${i + 1}`)
    }
    const body = line.trim()
    if (body.startsWith('- ')) {
      break
    }
    const colon = body.indexOf(':')
    if (colon < 0) throw new SyntaxError(`expected key: at line ${i + 1}`)
    const key = body.slice(0, colon).trim()
    const rest = body.slice(colon + 1).trim()
    if (rest === '' || rest === '|' || rest === '>') {
      if (rest === '|' || rest === '>') {
        const block = parseLiteralBlock(lines, i + 1, indent + 1, rest === '|')
        obj[key] = block.value
        i = block.next
      } else {
        const nested = parseBlock(lines, i + 1, indent + 1)
        // empty key with nothing nested → null
        if (nested.next === i + 1) {
          obj[key] = null
          i++
        } else {
          obj[key] = nested.value
          i = nested.next
        }
      }
    } else {
      obj[key] = parseScalar(rest)
      i++
    }
  }
  return { value: obj, next: i }
}

function parseSequence(lines: string[], start: number, indent: number): ParseResult {
  const arr: unknown[] = []
  let i = start
  while (i < lines.length) {
    const raw = lines[i]!
    const trimmed = raw.trim()
    if (trimmed === '' || trimmed.startsWith('#')) {
      i++
      continue
    }
    const line = stripComment(raw)
    const ind = indentOf(line)
    if (ind < indent) break
    if (ind > indent) {
      throw new SyntaxError(`unexpected indent at line ${i + 1}`)
    }
    const body = line.trim()
    if (!body.startsWith('- ')) break
    const rest = body.slice(2).trim()
    if (rest === '' || rest === '|' || rest === '>') {
      if (rest === '|' || rest === '>') {
        const block = parseLiteralBlock(lines, i + 1, indent + 2, rest === '|')
        arr.push(block.value)
        i = block.next
      } else {
        const nested = parseBlock(lines, i + 1, indent + 2)
        arr.push(nested.value)
        i = nested.next === i + 1 ? i + 1 : nested.next
      }
    } else if (/^[^:]+:(\s|$)/.test(rest) || rest.endsWith(':')) {
      // inline mapping start on the same line as `- key: value`
      const synthetic = ' '.repeat(indent + 2) + rest
      const mapLines = [synthetic, ...lines.slice(i + 1)]
      const nested = parseMapping(mapLines, 0, indent + 2)
      arr.push(nested.value)
      // nested.next is relative to mapLines; line 0 is synthetic, so real advance is nested.next - 1
      i = i + 1 + Math.max(0, nested.next - 1)
    } else {
      arr.push(parseScalar(rest))
      i++
    }
  }
  return { value: arr, next: i }
}

function parseLiteralBlock(
  lines: string[],
  start: number,
  minIndent: number,
  keepNewlines: boolean
): ParseResult {
  const chunks: string[] = []
  let i = start
  let blockIndent: number | undefined
  while (i < lines.length) {
    const raw = lines[i]!
    if (raw.trim() === '') {
      chunks.push('')
      i++
      continue
    }
    const ind = indentOf(raw)
    if (ind < minIndent) break
    if (blockIndent === undefined) blockIndent = ind
    chunks.push(raw.slice(blockIndent))
    i++
  }
  while (chunks.length > 0 && chunks[chunks.length - 1] === '') chunks.pop()
  const joined = keepNewlines ? chunks.join('\n') : chunks.join(' ').replace(/ +/g, ' ')
  return { value: joined, next: i }
}

function parseScalar(raw: string): unknown {
  if (raw === 'null' || raw === '~') return null
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1)
  }
  if (/^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(raw)) return raw.includes('.') ? raw : Number(raw)
  return raw
}
