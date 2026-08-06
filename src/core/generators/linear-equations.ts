import type { AnswerKind } from '../types'
import { rationalAnswer, rationalLatex, signed, signedTerm, term, widen } from './format'
import type { Rng } from './rng'
import type { Generated, Level, Topic } from './types'

const SOLVE: Generated['instruction'] = {
  bm: 'Selesaikan untuk x',
  en: 'Solve for x',
}

function kindOf(answer: string): AnswerKind {
  return /^-?\d+$/.test(answer) ? 'integer' : 'rational'
}

/**
 * Picks the solution first, then a coefficient that keeps every displayed
 * constant a whole number. At scale 0 the solution is always an integer; above
 * it the solution may be a fraction, but the coefficient is chosen as a
 * multiple of the denominator so the question itself stays clean.
 */
function pickSolution(rng: Rng, scale: number): { numerator: number; denominator: number } {
  const range = widen(10, scale)
  if (scale === 0 || !rng.chance(0.45)) {
    return { numerator: rng.nonZero(-range, range), denominator: 1 }
  }
  const denominator = rng.int(2, Math.min(2 + scale, 5))
  let numerator = rng.nonZero(-range, range)
  // Avoid a numerator that cancels the denominator away; the point is a fraction.
  if (numerator % denominator === 0) numerator += 1
  return { numerator, denominator }
}

function coefficient(rng: Rng, denominator: number, scale: number): number {
  const range = widen(9, scale)
  const multiplier = rng.nonZero(-Math.floor(range / denominator) || 1, Math.floor(range / denominator) || 1)
  return multiplier * denominator
}

const levels: Level[] = [
  {
    id: 'linear-equations.L1',
    number: 1,
    concept: { bm: 'Satu langkah, penambahan', en: 'One step, addition' },
    generate(rng, scale) {
      const range = widen(12, scale)
      const x = rng.nonZero(-range, range)
      const c = rng.nonZero(-range, range)
      const b = x + c
      const answer = `${x}`
      return {
        instruction: SOLVE,
        prompt: both(`x ${signed(c)} = ${b}`),
        answer,
        answerKind: kindOf(answer),
        steps: [
          both(`x ${signed(c)} = ${b}`),
          both(`x = ${b} ${signed(-c)}`),
          both(`x = ${x}`),
        ],
        hints: [
          {
            bm: `Asingkan x. Buat operasi songsang bagi ${signed(c)} pada kedua-dua belah.`,
            en: `Isolate x. Apply the inverse of ${signed(c)} to both sides.`,
          },
          {
            bm: `Kedua-dua belah tolak/tambah ${Math.abs(c)}.`,
            en: `Subtract or add ${Math.abs(c)} on both sides.`,
          },
        ],
      }
    },
  },

  {
    id: 'linear-equations.L2',
    number: 2,
    concept: { bm: 'Satu langkah, pendaraban', en: 'One step, multiplication' },
    generate(rng, scale) {
      const solution = pickSolution(rng, scale)
      const a = coefficient(rng, solution.denominator, scale) || solution.denominator
      const b = (a * solution.numerator) / solution.denominator
      const answer = rationalAnswer(solution.numerator, solution.denominator)
      return {
        instruction: SOLVE,
        prompt: both(`${term(a, 'x')} = ${b}`),
        answer,
        answerKind: kindOf(answer),
        steps: [
          both(`${term(a, 'x')} = ${b}`),
          both(`x = \\frac{${b}}{${a}}`),
          both(`x = ${rationalLatex(solution.numerator, solution.denominator)}`),
        ],
        hints: [
          { bm: `x didarab dengan ${a}. Bahagi kedua-dua belah dengan ${a}.`, en: `x is multiplied by ${a}. Divide both sides by ${a}.` },
          { bm: 'Pendaraban dan pembahagian adalah operasi songsang.', en: 'Multiplication and division are inverse operations.' },
        ],
      }
    },
  },

  {
    id: 'linear-equations.L3',
    number: 3,
    concept: { bm: 'Dua langkah', en: 'Two step' },
    generate(rng, scale) {
      const solution = pickSolution(rng, scale)
      const a = Math.abs(coefficient(rng, solution.denominator, scale)) || solution.denominator
      const c = rng.int(1, widen(9, scale))
      const b = (a * solution.numerator) / solution.denominator + c
      const answer = rationalAnswer(solution.numerator, solution.denominator)
      return {
        instruction: SOLVE,
        prompt: both(`${term(a, 'x')} + ${c} = ${b}`),
        answer,
        answerKind: kindOf(answer),
        steps: [
          both(`${term(a, 'x')} + ${c} = ${b}`),
          both(`${term(a, 'x')} = ${b} - ${c}`),
          both(`${term(a, 'x')} = ${b - c}`),
          both(`x = ${rationalLatex(solution.numerator, solution.denominator)}`),
        ],
        hints: [
          { bm: `Buang ${c} dahulu, kemudian bahagi dengan ${a}.`, en: `Remove ${c} first, then divide by ${a}.` },
          { bm: 'Songsangkan tertib operasi: tambah/tolak dahulu, darab/bahagi kemudian.', en: 'Undo in reverse order: addition first, multiplication second.' },
        ],
      }
    },
  },

  {
    id: 'linear-equations.L4',
    number: 4,
    concept: { bm: 'Nombor negatif', en: 'Negatives' },
    generate(rng, scale) {
      const solution = pickSolution(rng, scale)
      const a = Math.abs(coefficient(rng, solution.denominator, scale)) || solution.denominator
      const c = rng.int(1, widen(9, scale))
      const b = (a * solution.numerator) / solution.denominator - c
      const answer = rationalAnswer(solution.numerator, solution.denominator)
      return {
        instruction: SOLVE,
        prompt: both(`${term(a, 'x')} - ${c} = ${b}`),
        answer,
        answerKind: kindOf(answer),
        steps: [
          both(`${term(a, 'x')} - ${c} = ${b}`),
          both(`${term(a, 'x')} = ${b} + ${c}`),
          both(`${term(a, 'x')} = ${b + c}`),
          both(`x = ${rationalLatex(solution.numerator, solution.denominator)}`),
        ],
        hints: [
          { bm: `Tambah ${c} pada kedua-dua belah untuk membuang -${c}.`, en: `Add ${c} to both sides to remove the -${c}.` },
          { bm: 'Jawapan boleh jadi negatif. Itu tidak salah.', en: 'The answer may be negative. That is fine.' },
        ],
      }
    },
  },

  {
    id: 'linear-equations.L5',
    number: 5,
    concept: { bm: 'Pekali negatif', en: 'Negative coefficient' },
    generate(rng, scale) {
      const solution = pickSolution(rng, scale)
      const a = Math.abs(coefficient(rng, solution.denominator, scale)) || solution.denominator
      const c = rng.int(1, widen(12, scale))
      const b = c - (a * solution.numerator) / solution.denominator
      const answer = rationalAnswer(solution.numerator, solution.denominator)
      return {
        instruction: SOLVE,
        prompt: both(`${c} - ${term(a, 'x')} = ${b}`),
        answer,
        answerKind: kindOf(answer),
        steps: [
          both(`${c} - ${term(a, 'x')} = ${b}`),
          both(`-${term(a, 'x')} = ${b} - ${c}`),
          both(`-${term(a, 'x')} = ${b - c}`),
          both(`${term(a, 'x')} = ${c - b}`),
          both(`x = ${rationalLatex(solution.numerator, solution.denominator)}`),
        ],
        hints: [
          { bm: 'Pekali x adalah negatif. Bawa sebutan x ke sebelah lain dahulu.', en: 'The coefficient of x is negative. Move the x term to the other side first.' },
          { bm: 'Membahagi dengan nombor negatif menukar tanda.', en: 'Dividing by a negative number flips the sign.' },
        ],
      }
    },
  },

  {
    id: 'linear-equations.L6',
    number: 6,
    concept: { bm: 'Pemboleh ubah pada kedua-dua belah', en: 'Variable on both sides' },
    generate(rng, scale) {
      const solution = pickSolution(rng, scale)
      const q = solution.denominator
      let a = coefficient(rng, q, scale) || q
      let d = coefficient(rng, q, scale) || 2 * q
      // A shared coefficient collapses the equation; the whole point is that
      // the x terms differ.
      if (a === d) d = a + q
      const c = rng.nonZero(-widen(9, scale), widen(9, scale))
      const e = ((a - d) * solution.numerator) / q + c
      const answer = rationalAnswer(solution.numerator, q)
      return {
        instruction: SOLVE,
        prompt: both(`${term(a, 'x')} ${signed(c)} = ${term(d, 'x')} ${signed(e)}`),
        answer,
        answerKind: kindOf(answer),
        steps: [
          both(`${term(a, 'x')} ${signed(c)} = ${term(d, 'x')} ${signed(e)}`),
          both(`${term(a, 'x')} ${signedTerm(-d, 'x')} = ${e} ${signed(-c)}`),
          both(`${term(a - d, 'x')} = ${e - c}`),
          both(`x = ${rationalLatex(solution.numerator, q)}`),
        ],
        hints: [
          { bm: 'Kumpulkan semua sebutan x di satu belah, nombor di belah yang lain.', en: 'Collect every x term on one side and the numbers on the other.' },
          { bm: `Tolak ${term(d, 'x')} daripada kedua-dua belah.`, en: `Subtract ${term(d, 'x')} from both sides.` },
        ],
      }
    },
  },

  {
    id: 'linear-equations.L7',
    number: 7,
    concept: { bm: 'Kurungan', en: 'Brackets' },
    generate(rng, scale) {
      const solution = pickSolution(rng, scale)
      const a = coefficient(rng, solution.denominator, scale) || solution.denominator
      const c = rng.nonZero(-widen(9, scale), widen(9, scale))
      // a is a multiple of the denominator, so this stays an integer.
      const b = (a * solution.numerator) / solution.denominator + a * c
      const answer = rationalAnswer(solution.numerator, solution.denominator)
      return {
        instruction: SOLVE,
        prompt: both(`${a === 1 ? '' : a}(x ${signed(c)}) = ${b}`),
        answer,
        answerKind: kindOf(answer),
        steps: [
          both(`${a === 1 ? '' : a}(x ${signed(c)}) = ${b}`),
          both(`x ${signed(c)} = \\frac{${b}}{${a}} = ${rationalLatex(b, a)}`),
          both(`x = ${rationalLatex(b, a)} ${signed(-c)}`),
          both(`x = ${rationalLatex(solution.numerator, solution.denominator)}`),
        ],
        hints: [
          { bm: `Bahagi kedua-dua belah dengan ${a} untuk membuang kurungan.`, en: `Divide both sides by ${a} to clear the bracket.` },
          { bm: 'Atau kembangkan kurungan dahulu, kemudian selesaikan seperti biasa.', en: 'Or expand the bracket first, then solve as usual.' },
        ],
      }
    },
  },

  {
    id: 'linear-equations.L8',
    number: 8,
    concept: { bm: 'Pecahan', en: 'Fractions' },
    generate(rng, scale) {
      const d = rng.int(2, Math.min(3 + scale, 9))
      const x = rng.nonZero(-widen(8, scale), widen(8, scale)) * d
      const c = rng.nonZero(-widen(9, scale), widen(9, scale))
      const b = x / d + c
      const answer = `${x}`
      return {
        instruction: SOLVE,
        prompt: both(`\\frac{x}{${d}} ${signed(c)} = ${b}`),
        answer,
        answerKind: kindOf(answer),
        steps: [
          both(`\\frac{x}{${d}} ${signed(c)} = ${b}`),
          both(`\\frac{x}{${d}} = ${b} ${signed(-c)} = ${b - c}`),
          both(`x = ${b - c} \\times ${d}`),
          both(`x = ${x}`),
        ],
        hints: [
          { bm: `Buang ${signed(c)} dahulu, kemudian darab kedua-dua belah dengan ${d}.`, en: `Remove the ${signed(c)} first, then multiply both sides by ${d}.` },
          { bm: `x dibahagi ${d}, jadi songsangnya adalah darab ${d}.`, en: `x is divided by ${d}, so the inverse is multiplying by ${d}.` },
        ],
      }
    },
  },

  {
    id: 'linear-equations.L9',
    number: 9,
    concept: { bm: 'Pecahan atas ungkapan', en: 'Fraction over an expression' },
    generate(rng, scale) {
      const d = rng.int(2, Math.min(3 + scale, 9))
      const a = rng.nonZero(-widen(6, scale), widen(6, scale))
      const x = rng.nonZero(-widen(8, scale), widen(8, scale))
      const c = rng.nonZero(-widen(9, scale), widen(9, scale))
      const numerator = a * x + c
      // The right-hand side must stay a whole number, so nudge c until it divides.
      const shortfall = ((numerator % d) + d) % d
      const adjustedC = c - shortfall
      const b = (a * x + adjustedC) / d
      const answer = `${x}`
      return {
        instruction: SOLVE,
        prompt: both(`\\frac{${term(a, 'x')} ${signed(adjustedC)}}{${d}} = ${b}`),
        answer,
        answerKind: kindOf(answer),
        steps: [
          both(`\\frac{${term(a, 'x')} ${signed(adjustedC)}}{${d}} = ${b}`),
          both(`${term(a, 'x')} ${signed(adjustedC)} = ${b} \\times ${d} = ${b * d}`),
          both(`${term(a, 'x')} = ${b * d} ${signed(-adjustedC)} = ${b * d - adjustedC}`),
          both(`x = ${x}`),
        ],
        hints: [
          { bm: `Darab kedua-dua belah dengan ${d} untuk membuang pecahan.`, en: `Multiply both sides by ${d} to clear the fraction.` },
          { bm: 'Seluruh pengangka dibahagi, bukan satu sebutan sahaja.', en: 'The whole numerator is divided, not just one term.' },
        ],
      }
    },
  },
]

/** Both locales share the same LaTeX; only the surrounding prose differs. */
function both(latex: string): { bm: string; en: string } {
  return { bm: latex, en: latex }
}

export const linearEquations: Topic = {
  id: 'linear-equations',
  chapter: 6,
  name: { bm: 'Persamaan Linear', en: 'Linear Equations' },
  levels,
}
