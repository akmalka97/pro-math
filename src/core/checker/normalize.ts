import type { InputMode } from '../types'
import { latexToInfix } from './latex-to-infix'

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
}

const SYMBOL_REPLACEMENTS: Array<[RegExp, string]> = [
  [/[×✕✖]/g, '*'], // multiplication signs
  [/[÷]/g, '/'],
  [/[−–—]/g, '-'], // minus, en dash, em dash
  [/[⁄]/g, '/'], // fraction slash
  [/√/g, 'sqrt'],
  [/∛/g, 'cbrt'],
  [/π/g, 'pi'],
  [/[‘’“”]/g, ''],
]

/**
 * Reduces any of the three input modes to a single canonical infix string.
 * Does not validate: an unparseable result is the parser's problem to report.
 */
export function normalize(raw: string, mode: InputMode = 'expression'): string {
  let text = mode === 'mathfield' ? latexToInfix(raw) : raw

  // Superscript digits become explicit powers before any Unicode folding —
  // NFKC would flatten x² to x2, which mathjs reads as x*2.
  text = text.replace(
    /[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g,
    (run) => '^' + [...run].map((c) => SUPERSCRIPT_DIGITS[c]).join(''),
  )

  text = text.normalize('NFKC')

  for (const [pattern, replacement] of SYMBOL_REPLACEMENTS) {
    text = text.replace(pattern, replacement)
  }

  // `sqrt9` and `cbrt27` need parentheses for mathjs.
  text = text.replace(/\b(sqrt|cbrt)\s*(\d+(?:\.\d+)?)/g, '$1($2)')

  // Students often restate the whole equation: "x = 5". Keep the right side.
  const equals = text.lastIndexOf('=')
  if (equals !== -1) text = text.slice(equals + 1)

  return text.replace(/\s+/g, ' ').trim()
}
