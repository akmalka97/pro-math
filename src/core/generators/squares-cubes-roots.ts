import { rationalAnswer, widen } from './format'
import type { Level, Topic } from './types'

function both(latex: string): { bm: string; en: string } {
  return { bm: latex, en: latex }
}

const CALCULATE = { bm: 'Kira', en: 'Calculate' }

const levels: Level[] = [
  {
    id: 'squares-cubes-roots.L1',
    number: 1,
    concept: { bm: 'Kuasa dua', en: 'Squares' },
    generate(rng, scale) {
      const n = rng.int(2, widen(15, scale))
      return {
        instruction: CALCULATE,
        prompt: both(`${n}^2`),
        answer: `${n * n}`,
        answerKind: 'integer',
        steps: [both(`${n}^2 = ${n} \\times ${n} = ${n * n}`)],
        hints: [
          { bm: 'Kuasa dua bermaksud darab nombor itu dengan dirinya sendiri.', en: 'Squaring means multiplying the number by itself.' },
          { bm: `${n} \\times ${n}.`, en: `${n} \\times ${n}.` },
        ],
      }
    },
  },

  {
    id: 'squares-cubes-roots.L2',
    number: 2,
    concept: { bm: 'Punca kuasa dua', en: 'Square roots' },
    generate(rng, scale) {
      const n = rng.int(2, widen(15, scale))
      return {
        instruction: CALCULATE,
        prompt: both(`\\sqrt{${n * n}}`),
        answer: `${n}`,
        answerKind: 'integer',
        steps: [both(`${n} \\times ${n} = ${n * n}`), both(`\\sqrt{${n * n}} = ${n}`)],
        hints: [
          { bm: 'Nombor manakah yang apabila didarab dengan dirinya memberi nombor ini?', en: 'Which number multiplied by itself gives this number?' },
          { bm: 'Punca kuasa dua adalah songsangan kuasa dua.', en: 'A square root undoes a square.' },
        ],
      }
    },
  },

  {
    id: 'squares-cubes-roots.L3',
    number: 3,
    concept: { bm: 'Kuasa tiga', en: 'Cubes' },
    generate(rng, scale) {
      const n = rng.int(2, widen(8, scale))
      return {
        instruction: CALCULATE,
        prompt: both(`${n}^3`),
        answer: `${n ** 3}`,
        answerKind: 'integer',
        steps: [both(`${n}^3 = ${n} \\times ${n} \\times ${n} = ${n ** 3}`)],
        hints: [
          { bm: 'Kuasa tiga bermaksud darab nombor itu tiga kali.', en: 'Cubing means multiplying the number three times.' },
          { bm: `${n} \\times ${n} = ${n * n}, kemudian \\times ${n}.`, en: `${n} \\times ${n} = ${n * n}, then \\times ${n}.` },
        ],
      }
    },
  },

  {
    id: 'squares-cubes-roots.L4',
    number: 4,
    concept: { bm: 'Punca kuasa tiga', en: 'Cube roots' },
    generate(rng, scale) {
      const n = rng.int(2, widen(8, scale))
      return {
        instruction: CALCULATE,
        prompt: both(`\\sqrt[3]{${n ** 3}}`),
        answer: `${n}`,
        answerKind: 'integer',
        steps: [both(`${n}^3 = ${n ** 3}`), both(`\\sqrt[3]{${n ** 3}} = ${n}`)],
        hints: [
          { bm: 'Cari nombor yang kuasa tiganya memberi nombor ini.', en: 'Find the number whose cube gives this number.' },
          { bm: 'Cuba 2, 3, 4, 5 dan seterusnya.', en: 'Try 2, 3, 4, 5 and so on.' },
        ],
      }
    },
  },

  {
    id: 'squares-cubes-roots.L5',
    number: 5,
    concept: { bm: 'Asas negatif', en: 'Negative base' },
    generate(rng, scale) {
      const n = rng.int(2, widen(12, scale))
      const cube = rng.chance(0.4)
      if (cube) {
        return {
          instruction: CALCULATE,
          prompt: both(`(-${n})^3`),
          answer: `${-(n ** 3)}`,
          answerKind: 'integer',
          steps: [both(`(-${n})^3 = -${n} \\times -${n} \\times -${n}`), both(`= ${-(n ** 3)}`)],
          hints: [
            { bm: 'Kuasa ganjil bagi nombor negatif kekal negatif.', en: 'An odd power of a negative number stays negative.' },
            { bm: `${n}^3 = ${n ** 3}.`, en: `${n}^3 = ${n ** 3}.` },
          ],
        }
      }
      return {
        instruction: CALCULATE,
        prompt: both(`(-${n})^2`),
        answer: `${n * n}`,
        answerKind: 'integer',
        steps: [both(`(-${n})^2 = -${n} \\times -${n}`), both(`= ${n * n}`)],
        hints: [
          { bm: 'Negatif darab negatif memberi positif.', en: 'A negative times a negative gives a positive.' },
          { bm: 'Kuasa dua bagi mana-mana nombor nyata tidak pernah negatif.', en: 'The square of any real number is never negative.' },
        ],
      }
    },
  },

  {
    id: 'squares-cubes-roots.L6',
    number: 6,
    concept: { bm: 'Punca bagi pecahan', en: 'Root of a fraction' },
    generate(rng, scale) {
      const numerator = rng.int(2, widen(9, scale))
      let denominator = rng.int(2, widen(12, scale))
      if (denominator === numerator) denominator = numerator + 1
      return {
        instruction: CALCULATE,
        prompt: both(`\\sqrt{\\frac{${numerator ** 2}}{${denominator ** 2}}}`),
        answer: rationalAnswer(numerator, denominator),
        answerKind: 'rational',
        steps: [
          both(`\\sqrt{\\frac{${numerator ** 2}}{${denominator ** 2}}} = \\frac{\\sqrt{${numerator ** 2}}}{\\sqrt{${denominator ** 2}}}`),
          both(`= \\frac{${numerator}}{${denominator}}`),
        ],
        hints: [
          { bm: 'Ambil punca kuasa dua bagi pengangka dan penyebut secara berasingan.', en: 'Take the square root of the numerator and the denominator separately.' },
          { bm: 'Kedua-duanya adalah kuasa dua sempurna.', en: 'Both are perfect squares.' },
        ],
      }
    },
  },

  {
    id: 'squares-cubes-roots.L7',
    number: 7,
    concept: { bm: 'Operasi bercampur', en: 'Mixed operations' },
    generate(rng, scale) {
      const a = rng.int(2, widen(12, scale))
      const b = rng.int(2, widen(6, scale))
      const value = a + b ** 3
      return {
        instruction: CALCULATE,
        prompt: both(`\\sqrt{${a * a}} + ${b}^3`),
        answer: `${value}`,
        answerKind: 'integer',
        steps: [both(`\\sqrt{${a * a}} = ${a}`), both(`${b}^3 = ${b ** 3}`), both(`${a} + ${b ** 3} = ${value}`)],
        hints: [
          { bm: 'Kira punca dan kuasa secara berasingan dahulu.', en: 'Work out the root and the power separately first.' },
          { bm: 'Kemudian campurkan hasilnya.', en: 'Then add the two results.' },
        ],
      }
    },
  },

  {
    id: 'squares-cubes-roots.L8',
    number: 8,
    concept: { bm: 'Punca tidak sempurna, 3 angka bererti', en: 'Non-perfect root, 3 s.f.' },
    generate(rng, scale) {
      let n = rng.int(10, widen(90, scale))
      // A perfect square would defeat the point of the level.
      while (Number.isInteger(Math.sqrt(n))) n++
      return {
        instruction: {
          bm: 'Kira, betul kepada 3 angka bererti',
          en: 'Calculate, correct to 3 significant figures',
        },
        prompt: both(`\\sqrt{${n}}`),
        answer: `sqrt(${n})`,
        answerKind: 'rational',
        steps: [
          both(`\\sqrt{${n}} \\approx ${Math.sqrt(n).toPrecision(3)}`),
        ],
        hints: [
          { bm: `${n} bukan kuasa dua sempurna, jadi jawapannya adalah anggaran.`, en: `${n} is not a perfect square, so the answer is an approximation.` },
          {
            bm: `Ia terletak antara ${Math.floor(Math.sqrt(n))} dan ${Math.ceil(Math.sqrt(n))}.`,
            en: `It lies between ${Math.floor(Math.sqrt(n))} and ${Math.ceil(Math.sqrt(n))}.`,
          },
        ],
      }
    },
  },

  {
    id: 'squares-cubes-roots.L9',
    number: 9,
    concept: { bm: 'Tertib operasi penuh', en: 'Full order of operations' },
    generate(rng, scale) {
      const a = rng.int(2, widen(6, scale))
      const b = rng.int(2, widen(9, scale))
      const c = rng.int(2, widen(9, scale))
      const value = a * b - c * c
      return {
        instruction: CALCULATE,
        prompt: both(`\\sqrt[3]{${a ** 3}} \\times \\sqrt{${b * b}} - ${c}^2`),
        answer: `${value}`,
        answerKind: 'integer',
        steps: [
          both(`\\sqrt[3]{${a ** 3}} = ${a}, \\quad \\sqrt{${b * b}} = ${b}, \\quad ${c}^2 = ${c * c}`),
          both(`${a} \\times ${b} = ${a * b}`),
          both(`${a * b} - ${c * c} = ${value}`),
        ],
        hints: [
          { bm: 'Selesaikan punca dan kuasa dahulu.', en: 'Resolve the roots and powers first.' },
          { bm: 'Kemudian darab, dan tolak paling akhir.', en: 'Then multiply, and subtract last.' },
        ],
      }
    },
  },
]

export const squaresCubesRoots: Topic = {
  id: 'squares-cubes-roots',
  chapter: 3,
  name: { bm: 'Kuasa Dua, Kuasa Tiga dan Punca', en: 'Squares, Cubes & Roots' },
  levels,
}
