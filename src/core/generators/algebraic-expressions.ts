import { signedTerm, term, widen } from './format'
import type { Rng } from './rng'
import type { Generated, Level, Topic } from './types'

const EVALUATE: Generated['instruction'] = {
  bm: 'Nilaikan ungkapan',
  en: 'Evaluate the expression',
}

const SIMPLIFY: Generated['instruction'] = {
  bm: 'Permudahkan ungkapan',
  en: 'Simplify the expression',
}

const EXPAND: Generated['instruction'] = {
  bm: 'Kembangkan dan permudahkan',
  en: 'Expand and simplify',
}

function both(latex: string): { bm: string; en: string } {
  return { bm: latex, en: latex }
}

function substitutionPrompt(expression: string, assignments: string): { bm: string; en: string } {
  return {
    bm: `${expression} \\quad \\text{apabila } ${assignments}`,
    en: `${expression} \\quad \\text{when } ${assignments}`,
  }
}

/** Keeps a simplification question from collapsing to nothing. */
function nonCancelling(rng: Rng, min: number, max: number, other: number): number {
  for (;;) {
    const value = rng.nonZero(min, max)
    if (value + other !== 0) return value
  }
}

const levels: Level[] = [
  {
    id: 'algebraic-expressions.L1',
    number: 1,
    concept: { bm: 'Penggantian, satu sebutan', en: 'Substitution, one term' },
    generate(rng, scale) {
      const a = rng.nonZero(-widen(9, scale), widen(9, scale))
      const x = rng.nonZero(-widen(9, scale), widen(9, scale))
      const value = a * x
      return {
        instruction: EVALUATE,
        prompt: substitutionPrompt(term(a, 'x'), `x = ${x}`),
        answer: `${value}`,
        answerKind: 'integer',
        steps: [both(`${term(a, 'x')} = ${a} \\times (${x})`), both(`= ${value}`)],
        hints: [
          { bm: `Gantikan x dengan ${x}.`, en: `Replace x with ${x}.` },
          { bm: `${term(a, 'x')} bermaksud ${a} didarab dengan x.`, en: `${term(a, 'x')} means ${a} multiplied by x.` },
        ],
      }
    },
  },

  {
    id: 'algebraic-expressions.L2',
    number: 2,
    concept: { bm: 'Penggantian, dua sebutan', en: 'Substitution, two terms' },
    generate(rng, scale) {
      const a = rng.nonZero(-widen(9, scale), widen(9, scale))
      const c = rng.nonZero(-widen(12, scale), widen(12, scale))
      const x = rng.nonZero(-widen(9, scale), widen(9, scale))
      const value = a * x + c
      return {
        instruction: EVALUATE,
        prompt: substitutionPrompt(`${term(a, 'x')} ${signedTerm(c, '')}`.trim(), `x = ${x}`),
        answer: `${value}`,
        answerKind: 'integer',
        steps: [
          both(`${term(a, 'x')} ${signedTerm(c, '')} = ${a} \\times (${x}) ${signedTerm(c, '')}`),
          both(`= ${a * x} ${signedTerm(c, '')}`),
          both(`= ${value}`),
        ],
        hints: [
          { bm: `Gantikan x dengan ${x} dahulu, kemudian kira.`, en: `Substitute ${x} for x first, then evaluate.` },
          { bm: 'Darab sebelum tambah.', en: 'Multiply before adding.' },
        ],
      }
    },
  },

  {
    id: 'algebraic-expressions.L3',
    number: 3,
    concept: { bm: 'Kumpul sebutan serupa', en: 'Collecting like terms' },
    generate(rng, scale) {
      const a = rng.int(2, widen(9, scale))
      const b = rng.int(2, widen(9, scale))
      const total = a + b
      return {
        instruction: SIMPLIFY,
        prompt: both(`${term(a, 'x')} + ${term(b, 'x')}`),
        answer: `${total}*x`,
        answerKind: 'expression',
        steps: [both(`${term(a, 'x')} + ${term(b, 'x')} = (${a} + ${b})x`), both(`= ${term(total, 'x')}`)],
        hints: [
          { bm: 'Kedua-dua sebutan mempunyai x yang sama, jadi pekalinya boleh dicampur.', en: 'Both terms share the same x, so their coefficients add.' },
          { bm: `${a} + ${b} = ${total}.`, en: `${a} + ${b} = ${total}.` },
        ],
      }
    },
  },

  {
    id: 'algebraic-expressions.L4',
    number: 4,
    concept: { bm: 'Tolak sebutan serupa', en: 'Subtracting like terms' },
    generate(rng, scale) {
      const a = rng.int(3, widen(12, scale))
      const b = nonCancelling(rng, 1, Math.max(2, a - 1), -a)
      const total = a - b
      return {
        instruction: SIMPLIFY,
        prompt: both(`${term(a, 'x')} - ${term(b, 'x')}`),
        answer: `${total}*x`,
        answerKind: 'expression',
        steps: [both(`${term(a, 'x')} - ${term(b, 'x')} = (${a} - ${b})x`), both(`= ${term(total, 'x')}`)],
        hints: [
          { bm: 'Tolak pekali, kekalkan x.', en: 'Subtract the coefficients and keep the x.' },
          { bm: `${a} - ${b} = ${total}.`, en: `${a} - ${b} = ${total}.` },
        ],
      }
    },
  },

  {
    id: 'algebraic-expressions.L5',
    number: 5,
    concept: { bm: 'Dua pemboleh ubah', en: 'Two variables' },
    generate(rng, scale) {
      const a = rng.int(2, widen(8, scale))
      const b = rng.int(2, widen(8, scale))
      const c = rng.int(2, widen(8, scale))
      const totalX = a + c
      return {
        instruction: SIMPLIFY,
        prompt: both(`${term(a, 'x')} + ${term(b, 'y')} + ${term(c, 'x')}`),
        answer: `${totalX}*x + ${b}*y`,
        answerKind: 'expression',
        steps: [
          both(`${term(a, 'x')} + ${term(c, 'x')} + ${term(b, 'y')}`),
          both(`= ${term(totalX, 'x')} + ${term(b, 'y')}`),
        ],
        hints: [
          { bm: 'x dan y bukan sebutan serupa. Ia tidak boleh dicampur.', en: 'x and y are not like terms. They cannot be combined.' },
          { bm: 'Kumpulkan sebutan x dahulu, biarkan sebutan y.', en: 'Group the x terms and leave the y term alone.' },
        ],
      }
    },
  },

  {
    id: 'algebraic-expressions.L6',
    number: 6,
    concept: { bm: 'Sebutan dan pemalar', en: 'Terms and constants' },
    generate(rng, scale) {
      const a = rng.int(2, widen(8, scale))
      const c = rng.int(1, widen(9, scale))
      const b = rng.int(1, widen(8, scale))
      const d = nonCancelling(rng, -widen(9, scale), widen(9, scale), c)
      const totalX = a + b
      const totalConstant = c + d
      const answer = totalConstant === 0 ? `${totalX}*x` : `${totalX}*x + (${totalConstant})`
      return {
        instruction: SIMPLIFY,
        prompt: both(`${term(a, 'x')} + ${c} + ${term(b, 'x')} ${signedTerm(d, '')}`),
        answer,
        answerKind: 'expression',
        steps: [
          both(`${term(a, 'x')} + ${term(b, 'x')} + ${c} ${signedTerm(d, '')}`),
          both(`= ${term(totalX, 'x')} ${signedTerm(totalConstant, '')}`),
        ],
        hints: [
          { bm: 'Kumpulkan sebutan x dengan sebutan x, nombor dengan nombor.', en: 'Group x terms with x terms and numbers with numbers.' },
          { bm: `${c} ${signedTerm(d, '')} = ${totalConstant}.`, en: `${c} ${signedTerm(d, '')} = ${totalConstant}.` },
        ],
      }
    },
  },

  {
    id: 'algebraic-expressions.L7',
    number: 7,
    concept: { bm: 'Mendarab sebutan', en: 'Multiplying terms' },
    generate(rng, scale) {
      const a = rng.int(2, widen(9, scale))
      const b = rng.int(2, widen(9, scale))
      const product = a * b
      return {
        instruction: SIMPLIFY,
        prompt: both(`${term(a, 'x')} \\times ${term(b, 'y')}`),
        answer: `${product}*x*y`,
        answerKind: 'expression',
        steps: [
          both(`${term(a, 'x')} \\times ${term(b, 'y')} = (${a} \\times ${b})(x \\times y)`),
          both(`= ${product}xy`),
        ],
        hints: [
          { bm: 'Darab pekali dengan pekali, huruf dengan huruf.', en: 'Multiply coefficient by coefficient and letter by letter.' },
          { bm: `${a} \\times ${b} = ${product}.`, en: `${a} \\times ${b} = ${product}.` },
        ],
      }
    },
  },

  {
    id: 'algebraic-expressions.L8',
    number: 8,
    concept: { bm: 'Kembangkan satu kurungan', en: 'Expanding one bracket' },
    generate(rng, scale) {
      const a = rng.nonZero(-widen(6, scale), widen(6, scale))
      const b = rng.int(2, widen(8, scale))
      const c = rng.nonZero(-widen(9, scale), widen(9, scale))
      return {
        instruction: EXPAND,
        prompt: both(`${term(a, '')}(${term(b, 'x')} ${signedTerm(c, '')})`),
        answer: `${a * b}*x + (${a * c})`,
        answerKind: 'expression',
        steps: [
          both(`${term(a, '')}(${term(b, 'x')} ${signedTerm(c, '')})`),
          both(`= ${a} \\times ${term(b, 'x')} ${signedTerm(a, '')} \\times (${c})`),
          both(`= ${term(a * b, 'x')} ${signedTerm(a * c, '')}`),
        ],
        hints: [
          { bm: `Darab ${a} dengan setiap sebutan di dalam kurungan.`, en: `Multiply ${a} by every term inside the bracket.` },
          { bm: 'Jangan lupa sebutan kedua.', en: 'Do not forget the second term.' },
        ],
      }
    },
  },

  {
    id: 'algebraic-expressions.L9',
    number: 9,
    concept: { bm: 'Kembangkan dua kurungan', en: 'Expanding two brackets' },
    generate(rng, scale) {
      const a = rng.nonZero(-widen(5, scale), widen(5, scale))
      const b = rng.nonZero(-widen(9, scale), widen(9, scale))
      const c = nonCancelling(rng, -widen(5, scale), widen(5, scale), a)
      const d = rng.nonZero(-widen(9, scale), widen(9, scale))
      const totalX = a + c
      const totalConstant = a * b + c * d
      return {
        instruction: EXPAND,
        prompt: both(`${term(a, '')}(x ${signedTerm(b, '')}) + ${term(c, '')}(x ${signedTerm(d, '')})`),
        answer: `${totalX}*x + (${totalConstant})`,
        answerKind: 'expression',
        steps: [
          both(`${term(a, '')}(x ${signedTerm(b, '')}) + ${term(c, '')}(x ${signedTerm(d, '')})`),
          both(`= ${term(a, 'x')} ${signedTerm(a * b, '')} + ${term(c, 'x')} ${signedTerm(c * d, '')}`),
          both(`= ${term(totalX, 'x')} ${signedTerm(totalConstant, '')}`),
        ],
        hints: [
          { bm: 'Kembangkan setiap kurungan berasingan dahulu.', en: 'Expand each bracket separately first.' },
          { bm: 'Kemudian kumpulkan sebutan serupa.', en: 'Then collect the like terms.' },
        ],
      }
    },
  },
]

export const algebraicExpressions: Topic = {
  id: 'algebraic-expressions',
  chapter: 5,
  name: { bm: 'Ungkapan Algebra', en: 'Algebraic Expressions' },
  levels,
}
