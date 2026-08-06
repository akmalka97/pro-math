import { create, all, type MathNode } from 'mathjs'
import type { AnswerKind, InputMode, Verdict } from '../types'
import { normalize } from './normalize'

/** Default instance: floating point, used for numeric fallbacks and simplify. */
const math = create(all, {})

/** Exact instance: number literals become Fractions, so 1/3 never becomes 0.333…  */
const exactMath = create(all, { number: 'Fraction' })

const KNOWN_CONSTANTS = new Set(['pi', 'e', 'i', 'tau', 'Infinity', 'NaN'])

type Rational = { numerator: bigint; denominator: bigint }

function parseSafe(text: string): MathNode | null {
  if (!text.trim()) return null
  try {
    return math.parse(text)
  } catch {
    return null
  }
}

function collectVariables(node: MathNode): string[] {
  const found = new Set<string>()
  node.traverse((child, _path, parent) => {
    if (child.type !== 'SymbolNode') return
    // The callee of a function call is a SymbolNode too; it is not a variable.
    if (parent?.type === 'FunctionNode' && (parent as any).fn === child) return
    const name = (child as any).name as string
    if (!KNOWN_CONSTANTS.has(name)) found.add(name)
  })
  return [...found]
}

/** Exact rational value of an expression, or null if it is irrational or fails. */
function asRational(text: string): Rational | null {
  try {
    const value = exactMath.evaluate(text)
    if (value && typeof value === 'object' && 'n' in value && 'd' in value) {
      const sign = BigInt((value as any).s ?? 1)
      return {
        numerator: sign * BigInt((value as any).n),
        denominator: BigInt((value as any).d),
      }
    }
    if (typeof value === 'number' && Number.isInteger(value)) {
      return { numerator: BigInt(value), denominator: 1n }
    }
    return null
  } catch {
    return null
  }
}

function asFloat(text: string): number | null {
  try {
    const value = math.evaluate(text)
    return typeof value === 'number' && Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

/**
 * True when the value's decimal expansion terminates — that is, once reduced,
 * the denominator has no prime factor other than 2 or 5.
 *
 * This is the gate for the tolerance band. An answer that can be written
 * exactly as a decimal must be matched exactly, otherwise a 3 s.f. band would
 * accept 1198 for a correct answer of 1200.
 */
function hasTerminatingDecimal(value: Rational): boolean {
  let denominator = value.denominator
  while (denominator % 2n === 0n) denominator /= 2n
  while (denominator % 5n === 0n) denominator /= 5n
  return denominator === 1n
}

function rationalsEqual(a: Rational, b: Rational): boolean {
  return a.numerator * b.denominator === b.numerator * a.denominator
}

/** Half a unit in the third significant figure of `value`. */
function significantFigureBand(value: number): number {
  if (value === 0) return 0
  const magnitude = Math.floor(Math.log10(Math.abs(value)))
  return 0.5 * Math.pow(10, magnitude - 2)
}

function checkNumeric(student: string, correct: string): Verdict {
  const studentNode = parseSafe(student)
  if (!studentNode) return 'unreadable'
  if (collectVariables(studentNode).length > 0) return 'incorrect'

  const correctRational = asRational(correct)
  const studentRational = asRational(student)

  if (correctRational && studentRational) {
    if (rationalsEqual(studentRational, correctRational)) return 'correct'
    // Both sides are exact rationals but unequal. If the correct answer's
    // decimal terminates the student is simply wrong; otherwise fall through
    // to the tolerance band, which is how 0.333 passes for 1/3.
    if (hasTerminatingDecimal(correctRational)) return 'incorrect'
  }

  const correctFloat = correctRational
    ? Number(correctRational.numerator) / Number(correctRational.denominator)
    : asFloat(correct)
  const studentFloat = asFloat(student)
  if (correctFloat === null || studentFloat === null) return 'unreadable'

  if (correctRational && hasTerminatingDecimal(correctRational)) {
    return studentFloat === correctFloat ? 'correct' : 'incorrect'
  }

  const band = significantFigureBand(correctFloat)
  return Math.abs(studentFloat - correctFloat) <= band ? 'correct' : 'incorrect'
}

function checkExpression(student: string, correct: string): Verdict {
  const studentNode = parseSafe(student)
  const correctNode = parseSafe(correct)
  if (!studentNode) return 'unreadable'
  if (!correctNode) throw new Error(`generator produced an unparseable answer: ${correct}`)

  const variables = [...new Set([...collectVariables(studentNode), ...collectVariables(correctNode)])]

  if (variables.length === 0) return checkNumeric(student, correct)

  // Fast path: symbolic cancellation.
  try {
    if (math.simplify(`(${student}) - (${correct})`).toString() === '0') return 'correct'
  } catch {
    // simplify is best-effort; the random-point check below is authoritative.
  }

  // Authoritative path: agree at many random points or they are not the same
  // expression. Values are spread and non-integral to avoid coincidental hits.
  let comparisons = 0
  for (let i = 0; i < 40 && comparisons < 20; i++) {
    const scope: Record<string, number> = {}
    for (const name of variables) scope[name] = ((i * 7919) % 97) / 4 - 12.125

    let studentValue: number
    let correctValue: number
    try {
      studentValue = studentNode.evaluate(scope)
      correctValue = correctNode.evaluate(scope)
    } catch {
      continue
    }
    if (!Number.isFinite(studentValue) || !Number.isFinite(correctValue)) continue

    comparisons++
    const scale = Math.max(1, Math.abs(correctValue))
    if (Math.abs(studentValue - correctValue) > 1e-9 * scale) return 'incorrect'
  }

  return comparisons > 0 ? 'correct' : 'unreadable'
}

function splitMembers(text: string): string[] {
  return text
    .replace(/^[{[(]/, '')
    .replace(/[}\])]$/, '')
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}

function checkSet(student: string, correct: string): Verdict {
  const studentMembers = splitMembers(student)
  const correctMembers = splitMembers(correct)
  if (studentMembers.length === 0) return 'unreadable'

  const toValues = (members: string[]): number[] | null => {
    const values: number[] = []
    for (const member of members) {
      const value = asFloat(member)
      if (value === null) return null
      values.push(value)
    }
    return values
  }

  const studentValues = toValues(studentMembers)
  const correctValues = toValues(correctMembers)
  if (!studentValues) return 'unreadable'
  if (!correctValues) throw new Error(`generator produced an unparseable set: ${correct}`)

  // Order-independent, duplicates ignored.
  const studentSet = [...new Set(studentValues)].sort((a, b) => a - b)
  const correctSet = [...new Set(correctValues)].sort((a, b) => a - b)
  if (studentSet.length !== correctSet.length) return 'incorrect'
  return studentSet.every((value, index) => value === correctSet[index]) ? 'correct' : 'incorrect'
}

function checkRatio(student: string, correct: string): Verdict {
  const studentTerms = student.split(':').map((part) => part.trim())
  const correctTerms = correct.split(':').map((part) => part.trim())
  if (studentTerms.length < 2 || studentTerms.some((term) => term.length === 0)) return 'unreadable'
  if (studentTerms.length !== correctTerms.length) return 'incorrect'

  const studentValues: number[] = []
  const correctValues: number[] = []
  for (let i = 0; i < correctTerms.length; i++) {
    const studentValue = asFloat(studentTerms[i])
    const correctValue = asFloat(correctTerms[i])
    if (studentValue === null) return 'unreadable'
    if (correctValue === null) throw new Error(`generator produced an unparseable ratio: ${correct}`)
    studentValues.push(studentValue)
    correctValues.push(correctValue)
  }

  // Equal ratios are proportional: every term scales by the same factor.
  // 2:3 and 4:6 both pass; 2:3 and 2:4 do not.
  if (correctValues[0] === 0 || studentValues[0] === 0) {
    return studentValues.every((value, i) => value === correctValues[i]) ? 'correct' : 'incorrect'
  }
  const factor = studentValues[0] / correctValues[0]
  const proportional = studentValues.every(
    (value, i) => Math.abs(value - correctValues[i] * factor) <= 1e-9 * Math.max(1, Math.abs(value)),
  )
  return proportional ? 'correct' : 'incorrect'
}

/**
 * The only entry point. `correct` is the canonical answer the generator
 * declared; `studentRaw` is whatever the student typed.
 */
export function check(
  studentRaw: string,
  correct: string,
  kind: AnswerKind,
  mode: InputMode = 'expression',
): Verdict {
  const student = kind === 'ratio' || kind === 'set' ? normalizeLoose(studentRaw, mode) : normalize(studentRaw, mode)
  if (!student) return 'unreadable'

  switch (kind) {
    case 'set':
      return checkSet(student, correct)
    case 'ratio':
      return checkRatio(student, correct)
    case 'expression':
      return checkExpression(student, correct)
    case 'integer':
    case 'rational':
      return checkNumeric(student, correct)
  }
}

/**
 * Set and ratio answers carry `,` and `:` separators that the ordinary
 * normaliser would mangle, so they skip the equation-splitting step.
 */
function normalizeLoose(raw: string, mode: InputMode): string {
  const separator = raw.includes(':') ? ':' : ','
  return raw
    .split(separator)
    .map((part) => normalize(part, mode))
    .join(separator)
}
