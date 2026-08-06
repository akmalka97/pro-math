import { fracLatex, rationalAnswer, rationalLatex, reduce, widen } from './format'
import type { Rng } from './rng'
import type { Generated, Level, Topic } from './types'

const CALCULATE: Generated['instruction'] = {
  bm: 'Kira',
  en: 'Calculate',
}

function both(latex: string): { bm: string; en: string } {
  return { bm: latex, en: latex }
}

/** LaTeX for a signed integer that may need brackets, as in 3 - (-8). */
function bracketed(value: number): string {
  return value < 0 ? `(${value})` : `${value}`
}

function signedFractionLatex(numerator: number, denominator: number): string {
  const [n, d] = reduce(numerator, denominator)
  if (d === 1) return `${n}`
  return n < 0 ? `\\left(-${fracLatex(Math.abs(n), d)}\\right)` : fracLatex(n, d)
}

function pickDenominator(rng: Rng, scale: number): number {
  return rng.int(2, Math.min(6 + scale * 2, 12))
}

const levels: Level[] = [
  {
    id: 'rational-numbers.L1',
    number: 1,
    concept: { bm: 'Tambah integer, tanda sama', en: 'Adding integers, same sign' },
    generate(rng, scale) {
      const range = widen(12, scale)
      const sign = rng.sign()
      const a = sign * rng.int(1, range)
      const b = sign * rng.int(1, range)
      const total = a + b
      return {
        instruction: CALCULATE,
        prompt: both(`${a} + ${bracketed(b)}`),
        answer: `${total}`,
        answerKind: 'integer',
        steps: [both(`${a} + ${bracketed(b)} = ${total}`)],
        hints: [
          { bm: 'Kedua-dua nombor mempunyai tanda yang sama, jadi campurkan magnitud dan kekalkan tanda.', en: 'Both numbers share a sign, so add the magnitudes and keep that sign.' },
          { bm: `${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(total)}.`, en: `${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(total)}.` },
        ],
      }
    },
  },

  {
    id: 'rational-numbers.L2',
    number: 2,
    concept: { bm: 'Tambah integer, tanda berbeza', en: 'Adding integers, mixed sign' },
    generate(rng, scale) {
      const range = widen(12, scale)
      const a = -rng.int(1, range)
      const b = rng.int(1, range)
      const total = a + b
      return {
        instruction: CALCULATE,
        prompt: both(`${a} + ${b}`),
        answer: `${total}`,
        answerKind: 'integer',
        steps: [both(`${a} + ${b} = ${total}`)],
        hints: [
          { bm: 'Tanda berbeza: tolak magnitud yang kecil daripada yang besar.', en: 'Different signs: subtract the smaller magnitude from the larger.' },
          { bm: 'Ambil tanda daripada nombor yang magnitudnya lebih besar.', en: 'Take the sign of the number with the larger magnitude.' },
        ],
      }
    },
  },

  {
    id: 'rational-numbers.L3',
    number: 3,
    concept: { bm: 'Tolak nombor negatif', en: 'Subtracting a negative' },
    generate(rng, scale) {
      const range = widen(12, scale)
      const a = rng.nonZero(-range, range)
      const b = -rng.int(1, range)
      const total = a - b
      return {
        instruction: CALCULATE,
        prompt: both(`${a} - (${b})`),
        answer: `${total}`,
        answerKind: 'integer',
        steps: [both(`${a} - (${b}) = ${a} + ${Math.abs(b)}`), both(`= ${total}`)],
        hints: [
          { bm: 'Tolak nombor negatif sama dengan tambah nombor positif.', en: 'Subtracting a negative is the same as adding a positive.' },
          { bm: `Dua tanda tolak berturutan menjadi tambah.`, en: `Two minus signs in a row become a plus.` },
        ],
      }
    },
  },

  {
    id: 'rational-numbers.L4',
    number: 4,
    concept: { bm: 'Darab dan bahagi integer', en: 'Multiplying and dividing integers' },
    generate(rng, scale) {
      const range = widen(9, scale)
      const a = rng.nonZero(-range, range)
      const b = rng.nonZero(-range, range)
      if (rng.chance(0.5)) {
        const product = a * b
        return {
          instruction: CALCULATE,
          prompt: both(`${a} \\times ${bracketed(b)}`),
          answer: `${product}`,
          answerKind: 'integer',
          steps: [both(`${a} \\times ${bracketed(b)} = ${product}`)],
          hints: [
            { bm: 'Tanda sama memberi hasil positif, tanda berbeza memberi hasil negatif.', en: 'Like signs give a positive result; unlike signs give a negative one.' },
            { bm: `${Math.abs(a)} \\times ${Math.abs(b)} = ${Math.abs(product)}.`, en: `${Math.abs(a)} \\times ${Math.abs(b)} = ${Math.abs(product)}.` },
          ],
        }
      }
      const dividend = a * b
      return {
        instruction: CALCULATE,
        prompt: both(`${dividend} \\div ${bracketed(b)}`),
        answer: `${a}`,
        answerKind: 'integer',
        steps: [both(`${dividend} \\div ${bracketed(b)} = ${a}`)],
        hints: [
          { bm: 'Peraturan tanda bagi bahagi sama dengan darab.', en: 'The sign rule for division is the same as for multiplication.' },
          { bm: `${Math.abs(dividend)} \\div ${Math.abs(b)} = ${Math.abs(a)}.`, en: `${Math.abs(dividend)} \\div ${Math.abs(b)} = ${Math.abs(a)}.` },
        ],
      }
    },
  },

  {
    id: 'rational-numbers.L5',
    number: 5,
    concept: { bm: 'Penyebut sama', en: 'Common denominator' },
    generate(rng, scale) {
      const d = pickDenominator(rng, scale)
      const a = rng.int(1, d - 1)
      const b = rng.int(1, d - 1)
      return {
        instruction: CALCULATE,
        prompt: both(`${fracLatex(a, d)} + ${fracLatex(b, d)}`),
        answer: rationalAnswer(a + b, d),
        answerKind: 'rational',
        steps: [
          both(`${fracLatex(a, d)} + ${fracLatex(b, d)} = ${fracLatex(`${a} + ${b}`, d)}`),
          both(`= ${fracLatex(a + b, d)} = ${rationalLatex(a + b, d)}`),
        ],
        hints: [
          { bm: 'Penyebut sudah sama, jadi campurkan pengangka sahaja.', en: 'The denominators already match, so just add the numerators.' },
          { bm: 'Penyebut kekal tidak berubah.', en: 'The denominator does not change.' },
        ],
      }
    },
  },

  {
    id: 'rational-numbers.L6',
    number: 6,
    concept: { bm: 'Penyebut berbeza', en: 'Unlike denominators' },
    generate(rng, scale) {
      const d1 = pickDenominator(rng, scale)
      let d2 = pickDenominator(rng, scale)
      if (d2 === d1) d2 = d1 + 1
      const a = rng.int(1, d1 - 1)
      const b = rng.int(1, d2 - 1)
      const numerator = a * d2 + b * d1
      const denominator = d1 * d2
      return {
        instruction: CALCULATE,
        prompt: both(`${fracLatex(a, d1)} + ${fracLatex(b, d2)}`),
        answer: rationalAnswer(numerator, denominator),
        answerKind: 'rational',
        steps: [
          both(`${fracLatex(a, d1)} + ${fracLatex(b, d2)}`),
          both(`= ${fracLatex(a * d2, denominator)} + ${fracLatex(b * d1, denominator)}`),
          both(`= ${fracLatex(numerator, denominator)} = ${rationalLatex(numerator, denominator)}`),
        ],
        hints: [
          { bm: `Cari penyebut sepunya bagi ${d1} dan ${d2}.`, en: `Find a common denominator for ${d1} and ${d2}.` },
          { bm: `${d1} \\times ${d2} = ${denominator} sentiasa berfungsi sebagai penyebut sepunya.`, en: `${d1} \\times ${d2} = ${denominator} always works as a common denominator.` },
        ],
      }
    },
  },

  {
    id: 'rational-numbers.L7',
    number: 7,
    concept: { bm: 'Pecahan negatif', en: 'Negative fractions' },
    generate(rng, scale) {
      const d1 = pickDenominator(rng, scale)
      let d2 = pickDenominator(rng, scale)
      if (d2 === d1) d2 = d1 + 1
      const a = -rng.int(1, d1 - 1)
      const b = rng.int(1, d2 - 1)
      const numerator = a * d2 + b * d1
      const denominator = d1 * d2
      return {
        instruction: CALCULATE,
        prompt: both(`${signedFractionLatex(a, d1)} + ${fracLatex(b, d2)}`),
        answer: rationalAnswer(numerator, denominator),
        answerKind: 'rational',
        steps: [
          both(`${signedFractionLatex(a, d1)} + ${fracLatex(b, d2)}`),
          both(`= ${fracLatex(a * d2, denominator)} + ${fracLatex(b * d1, denominator)}`),
          both(`= ${fracLatex(numerator, denominator)} = ${rationalLatex(numerator, denominator)}`),
        ],
        hints: [
          { bm: 'Samakan penyebut dahulu, kemudian campurkan pengangka mengikut tanda.', en: 'Match the denominators first, then add the numerators with their signs.' },
          { bm: 'Jawapan boleh jadi negatif.', en: 'The answer may be negative.' },
        ],
      }
    },
  },

  {
    id: 'rational-numbers.L8',
    number: 8,
    concept: { bm: 'Darab dan bahagi pecahan', en: 'Multiplying and dividing fractions' },
    generate(rng, scale) {
      const d1 = pickDenominator(rng, scale)
      const d2 = pickDenominator(rng, scale)
      const a = rng.int(1, d1 - 1)
      const b = rng.int(1, d2 - 1)
      if (rng.chance(0.5)) {
        return {
          instruction: CALCULATE,
          prompt: both(`${fracLatex(a, d1)} \\times ${fracLatex(b, d2)}`),
          answer: rationalAnswer(a * b, d1 * d2),
          answerKind: 'rational',
          steps: [
            both(`${fracLatex(a, d1)} \\times ${fracLatex(b, d2)} = ${fracLatex(`${a} \\times ${b}`, `${d1} \\times ${d2}`)}`),
            both(`= ${fracLatex(a * b, d1 * d2)} = ${rationalLatex(a * b, d1 * d2)}`),
          ],
          hints: [
            { bm: 'Darab pengangka dengan pengangka, penyebut dengan penyebut.', en: 'Multiply numerator by numerator and denominator by denominator.' },
            { bm: 'Permudahkan di akhir.', en: 'Simplify at the end.' },
          ],
        }
      }
      return {
        instruction: CALCULATE,
        prompt: both(`${fracLatex(a, d1)} \\div ${fracLatex(b, d2)}`),
        answer: rationalAnswer(a * d2, d1 * b),
        answerKind: 'rational',
        steps: [
          both(`${fracLatex(a, d1)} \\div ${fracLatex(b, d2)} = ${fracLatex(a, d1)} \\times ${fracLatex(d2, b)}`),
          both(`= ${fracLatex(a * d2, d1 * b)} = ${rationalLatex(a * d2, d1 * b)}`),
        ],
        hints: [
          { bm: 'Bahagi dengan pecahan sama dengan darab dengan salingannya.', en: 'Dividing by a fraction is multiplying by its reciprocal.' },
          { bm: `Salingan bagi ${fracLatex(b, d2)} ialah ${fracLatex(d2, b)}.`, en: `The reciprocal of ${fracLatex(b, d2)} is ${fracLatex(d2, b)}.` },
        ],
      }
    },
  },

  {
    id: 'rational-numbers.L9',
    number: 9,
    concept: { bm: 'Tertib operasi', en: 'Order of operations' },
    generate(rng, scale) {
      const d1 = pickDenominator(rng, scale)
      const d2 = pickDenominator(rng, scale)
      const d3 = pickDenominator(rng, scale)
      const a = -rng.int(1, d1 - 1)
      const b = rng.int(1, d2 - 1)
      const c = rng.int(1, d3 - 1)
      const productNumerator = b * c
      const productDenominator = d2 * d3
      const numerator = a * productDenominator + productNumerator * d1
      const denominator = d1 * productDenominator
      return {
        instruction: CALCULATE,
        prompt: both(`${signedFractionLatex(a, d1)} + ${fracLatex(b, d2)} \\times ${fracLatex(c, d3)}`),
        answer: rationalAnswer(numerator, denominator),
        answerKind: 'rational',
        steps: [
          both(`${fracLatex(b, d2)} \\times ${fracLatex(c, d3)} = ${rationalLatex(productNumerator, productDenominator)}`),
          both(`${signedFractionLatex(a, d1)} + ${rationalLatex(productNumerator, productDenominator)}`),
          both(`= ${rationalLatex(numerator, denominator)}`),
        ],
        hints: [
          { bm: 'Darab dahulu, tambah kemudian.', en: 'Multiply first, add second.' },
          { bm: 'Selesaikan pendaraban sepenuhnya sebelum menyamakan penyebut.', en: 'Finish the multiplication before finding a common denominator.' },
        ],
      }
    },
  },
]

export const rationalNumbers: Topic = {
  id: 'rational-numbers',
  chapter: 4,
  name: { bm: 'Nombor Nisbah', en: 'Rational Numbers' },
  levels,
}
