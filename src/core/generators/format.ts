/** Shared formatting helpers for building LaTeX prompts and infix answers. */

export function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) [x, y] = [y, x % y]
  return x || 1
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

/** Reduces a fraction and normalises the sign onto the numerator. */
export function reduce(numerator: number, denominator: number): [number, number] {
  const divisor = gcd(numerator, denominator)
  const sign = denominator < 0 ? -1 : 1
  return [(sign * numerator) / divisor, (sign * denominator) / divisor]
}

/** `3` -> "+ 3", `-3` -> "- 3". For appending a term to an expression. */
export function signed(value: number): string {
  return value < 0 ? `- ${Math.abs(value)}` : `+ ${value}`
}

/** `1,x` -> "x"; `-1,x` -> "-x"; `3,x` -> "3x"; `0,x` -> "". */
export function term(coefficient: number, symbol: string): string {
  if (coefficient === 0) return ''
  if (coefficient === 1) return symbol
  if (coefficient === -1) return `-${symbol}`
  return `${coefficient}${symbol}`
}

/** Same as `term`, but for appending: `3,x` -> "+ 3x". */
export function signedTerm(coefficient: number, symbol: string): string {
  if (coefficient === 0) return ''
  const sign = coefficient < 0 ? '-' : '+'
  const magnitude = Math.abs(coefficient)
  // An empty symbol means a bare constant, where the coefficient 1 must still show.
  const body = magnitude === 1 && symbol !== '' ? symbol : `${magnitude}${symbol}`
  return `${sign} ${body}`
}

export function fracLatex(numerator: number | string, denominator: number | string): string {
  return `\\frac{${numerator}}{${denominator}}`
}

/** Canonical infix for a rational answer: "5", "-5", "3/4", "-3/4". */
export function rationalAnswer(numerator: number, denominator: number): string {
  const [n, d] = reduce(numerator, denominator)
  return d === 1 ? `${n}` : `${n}/${d}`
}

/** Human-readable rational for worked steps: "5", "\frac{3}{4}", "-\frac{3}{4}". */
export function rationalLatex(numerator: number, denominator: number): string {
  const [n, d] = reduce(numerator, denominator)
  if (d === 1) return `${n}`
  return n < 0 ? `-${fracLatex(Math.abs(n), d)}` : fracLatex(n, d)
}

export function primeFactors(value: number): Map<number, number> {
  const factors = new Map<number, number>()
  let remaining = Math.abs(value)
  for (let divisor = 2; divisor * divisor <= remaining; divisor++) {
    while (remaining % divisor === 0) {
      factors.set(divisor, (factors.get(divisor) ?? 0) + 1)
      remaining /= divisor
    }
  }
  if (remaining > 1) factors.set(remaining, (factors.get(remaining) ?? 0) + 1)
  return factors
}

export function factorsOf(value: number): number[] {
  const result: number[] = []
  for (let candidate = 1; candidate <= Math.abs(value); candidate++) {
    if (value % candidate === 0) result.push(candidate)
  }
  return result
}

/** Widens a range as the scale rises. Scale 0 leaves the base range untouched. */
export function widen(base: number, scale: number): number {
  return base + scale * Math.max(2, Math.round(base * 0.6))
}
