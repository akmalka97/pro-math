import { signed, signedTerm, term, widen } from './format'
import type { Rng } from './rng'
import type { Generated, Level, Topic } from './types'

const SOLVE: Generated['instruction'] = {
  bm: 'Selesaikan ketaksamaan (contoh: x > 3)',
  en: 'Solve the inequality (for example x > 3)',
}

type Relation = '<' | '<=' | '>' | '>='

const LATEX: Record<Relation, string> = {
  '<': '<',
  '<=': '\\leq',
  '>': '>',
  '>=': '\\geq',
}

/** Multiplying or dividing an inequality by a negative reverses it. */
const REVERSED: Record<Relation, Relation> = { '<': '>', '<=': '>=', '>': '<', '>=': '<=' }

function pickRelation(rng: Rng): Relation {
  return rng.pick(['<', '<=', '>', '>='] as const)
}

function both(latex: string): { bm: string; en: string } {
  return { bm: latex, en: latex }
}

const FLIP_HINT = {
  bm: 'Membahagi dengan nombor negatif menyongsangkan arah ketaksamaan.',
  en: 'Dividing by a negative number reverses the direction of the inequality.',
}

const levels: Level[] = [
  {
    id: 'linear-inequalities.L1',
    number: 1,
    concept: { bm: 'Satu langkah, penambahan', en: 'One step, addition' },
    generate(rng, scale) {
      const range = widen(12, scale)
      const boundary = rng.nonZero(-range, range)
      const c = rng.nonZero(-range, range)
      const relation = pickRelation(rng)
      return {
        instruction: SOLVE,
        prompt: both(`x ${signed(c)} ${LATEX[relation]} ${boundary + c}`),
        answer: `x ${relation} ${boundary}`,
        answerKind: 'inequality',
        steps: [
          both(`x ${signed(c)} ${LATEX[relation]} ${boundary + c}`),
          both(`x ${LATEX[relation]} ${boundary + c} ${signed(-c)}`),
          both(`x ${LATEX[relation]} ${boundary}`),
        ],
        hints: [
          { bm: 'Selesaikan seperti persamaan biasa.', en: 'Solve it exactly like an ordinary equation.' },
          {
            bm: 'Menambah atau menolak tidak mengubah arah ketaksamaan.',
            en: 'Adding or subtracting never changes the direction of the inequality.',
          },
        ],
      }
    },
  },

  {
    id: 'linear-inequalities.L2',
    number: 2,
    concept: { bm: 'Satu langkah, pendaraban', en: 'One step, multiplication' },
    generate(rng, scale) {
      const a = rng.int(2, widen(9, scale))
      const boundary = rng.nonZero(-widen(10, scale), widen(10, scale))
      const relation = pickRelation(rng)
      return {
        instruction: SOLVE,
        prompt: both(`${term(a, 'x')} ${LATEX[relation]} ${a * boundary}`),
        answer: `x ${relation} ${boundary}`,
        answerKind: 'inequality',
        steps: [
          both(`${term(a, 'x')} ${LATEX[relation]} ${a * boundary}`),
          both(`x ${LATEX[relation]} \\frac{${a * boundary}}{${a}}`),
          both(`x ${LATEX[relation]} ${boundary}`),
        ],
        hints: [
          { bm: `Bahagi kedua-dua belah dengan ${a}.`, en: `Divide both sides by ${a}.` },
          {
            bm: `${a} adalah positif, jadi arah ketaksamaan kekal.`,
            en: `${a} is positive, so the direction stays the same.`,
          },
        ],
      }
    },
  },

  {
    id: 'linear-inequalities.L3',
    number: 3,
    concept: { bm: 'Dua langkah', en: 'Two step' },
    generate(rng, scale) {
      const a = rng.int(2, widen(9, scale))
      const c = rng.nonZero(-widen(9, scale), widen(9, scale))
      const boundary = rng.nonZero(-widen(10, scale), widen(10, scale))
      const relation = pickRelation(rng)
      const rightSide = a * boundary + c
      return {
        instruction: SOLVE,
        prompt: both(`${term(a, 'x')} ${signed(c)} ${LATEX[relation]} ${rightSide}`),
        answer: `x ${relation} ${boundary}`,
        answerKind: 'inequality',
        steps: [
          both(`${term(a, 'x')} ${signed(c)} ${LATEX[relation]} ${rightSide}`),
          both(`${term(a, 'x')} ${LATEX[relation]} ${rightSide - c}`),
          both(`x ${LATEX[relation]} ${boundary}`),
        ],
        hints: [
          { bm: `Buang ${signed(c)} dahulu, kemudian bahagi dengan ${a}.`, en: `Remove the ${signed(c)} first, then divide by ${a}.` },
          { bm: 'Kedua-dua langkah tidak menyongsangkan arah.', en: 'Neither step reverses the direction here.' },
        ],
      }
    },
  },

  {
    id: 'linear-inequalities.L4',
    number: 4,
    concept: { bm: 'Nombor negatif', en: 'Negatives' },
    generate(rng, scale) {
      const a = rng.int(2, widen(9, scale))
      const c = rng.int(1, widen(12, scale))
      const boundary = -rng.int(1, widen(10, scale))
      const relation = pickRelation(rng)
      const rightSide = a * boundary - c
      return {
        instruction: SOLVE,
        prompt: both(`${term(a, 'x')} - ${c} ${LATEX[relation]} ${rightSide}`),
        answer: `x ${relation} ${boundary}`,
        answerKind: 'inequality',
        steps: [
          both(`${term(a, 'x')} - ${c} ${LATEX[relation]} ${rightSide}`),
          both(`${term(a, 'x')} ${LATEX[relation]} ${rightSide} + ${c} = ${rightSide + c}`),
          both(`x ${LATEX[relation]} ${boundary}`),
        ],
        hints: [
          { bm: `Tambah ${c} pada kedua-dua belah.`, en: `Add ${c} to both sides.` },
          { bm: 'Sempadan boleh jadi negatif. Itu tidak salah.', en: 'The boundary may be negative. That is fine.' },
        ],
      }
    },
  },

  {
    id: 'linear-inequalities.L5',
    number: 5,
    concept: { bm: 'Pekali negatif, arah bertukar', en: 'Negative coefficient, direction flips' },
    generate(rng, scale) {
      const a = rng.int(2, widen(9, scale))
      const c = rng.int(1, widen(12, scale))
      const boundary = rng.nonZero(-widen(9, scale), widen(9, scale))
      const relation = pickRelation(rng)
      const rightSide = c - a * boundary
      return {
        instruction: SOLVE,
        prompt: both(`${c} - ${term(a, 'x')} ${LATEX[relation]} ${rightSide}`),
        // The coefficient of x is negative, so the relation reverses.
        answer: `x ${REVERSED[relation]} ${boundary}`,
        answerKind: 'inequality',
        steps: [
          both(`${c} - ${term(a, 'x')} ${LATEX[relation]} ${rightSide}`),
          both(`-${term(a, 'x')} ${LATEX[relation]} ${rightSide - c}`),
          both(`${term(a, 'x')} ${LATEX[REVERSED[relation]]} ${c - rightSide}`),
          both(`x ${LATEX[REVERSED[relation]]} ${boundary}`),
        ],
        hints: [
          {
            bm: 'Sebutan x mempunyai pekali negatif. Perhatikan arah ketaksamaan.',
            en: 'The x term has a negative coefficient. Watch the direction of the inequality.',
          },
          FLIP_HINT,
        ],
      }
    },
  },

  {
    id: 'linear-inequalities.L6',
    number: 6,
    concept: { bm: 'Pemboleh ubah pada kedua-dua belah', en: 'Variable on both sides' },
    generate(rng, scale) {
      const a = rng.int(3, widen(9, scale))
      const d = rng.int(1, a - 1)
      const c = rng.nonZero(-widen(9, scale), widen(9, scale))
      const boundary = rng.nonZero(-widen(9, scale), widen(9, scale))
      const relation = pickRelation(rng)
      // a > d, so the surviving coefficient is positive and the relation holds.
      const e = (a - d) * boundary + c
      return {
        instruction: SOLVE,
        prompt: both(`${term(a, 'x')} ${signed(c)} ${LATEX[relation]} ${term(d, 'x')} ${signed(e)}`),
        answer: `x ${relation} ${boundary}`,
        answerKind: 'inequality',
        steps: [
          both(`${term(a, 'x')} ${signed(c)} ${LATEX[relation]} ${term(d, 'x')} ${signed(e)}`),
          both(`${term(a, 'x')} ${signedTerm(-d, 'x')} ${LATEX[relation]} ${e} ${signed(-c)}`),
          both(`${term(a - d, 'x')} ${LATEX[relation]} ${e - c}`),
          both(`x ${LATEX[relation]} ${boundary}`),
        ],
        hints: [
          {
            bm: 'Kumpulkan sebutan x di sebelah yang membuatkan pekalinya positif.',
            en: 'Collect the x terms on whichever side keeps the coefficient positive.',
          },
          {
            bm: 'Dengan pekali positif, arah ketaksamaan tidak berubah.',
            en: 'With a positive coefficient the direction never changes.',
          },
        ],
      }
    },
  },

  {
    id: 'linear-inequalities.L7',
    number: 7,
    concept: { bm: 'Kurungan', en: 'Brackets' },
    generate(rng, scale) {
      const a = rng.int(2, widen(7, scale))
      const c = rng.nonZero(-widen(9, scale), widen(9, scale))
      const boundary = rng.nonZero(-widen(9, scale), widen(9, scale))
      const relation = pickRelation(rng)
      const rightSide = a * (boundary + c)
      return {
        instruction: SOLVE,
        prompt: both(`${a}(x ${signed(c)}) ${LATEX[relation]} ${rightSide}`),
        answer: `x ${relation} ${boundary}`,
        answerKind: 'inequality',
        steps: [
          both(`${a}(x ${signed(c)}) ${LATEX[relation]} ${rightSide}`),
          both(`x ${signed(c)} ${LATEX[relation]} \\frac{${rightSide}}{${a}} = ${boundary + c}`),
          both(`x ${LATEX[relation]} ${boundary}`),
        ],
        hints: [
          { bm: `Bahagi kedua-dua belah dengan ${a} untuk membuang kurungan.`, en: `Divide both sides by ${a} to clear the bracket.` },
          { bm: `${a} adalah positif, jadi arah kekal.`, en: `${a} is positive, so the direction is unchanged.` },
        ],
      }
    },
  },

  {
    id: 'linear-inequalities.L8',
    number: 8,
    concept: { bm: 'Pecahan', en: 'Fractions' },
    generate(rng, scale) {
      const d = rng.int(2, Math.min(3 + scale, 9))
      const boundary = rng.nonZero(-widen(8, scale), widen(8, scale)) * d
      const c = rng.nonZero(-widen(9, scale), widen(9, scale))
      const relation = pickRelation(rng)
      const rightSide = boundary / d + c
      return {
        instruction: SOLVE,
        prompt: both(`\\frac{x}{${d}} ${signed(c)} ${LATEX[relation]} ${rightSide}`),
        answer: `x ${relation} ${boundary}`,
        answerKind: 'inequality',
        steps: [
          both(`\\frac{x}{${d}} ${signed(c)} ${LATEX[relation]} ${rightSide}`),
          both(`\\frac{x}{${d}} ${LATEX[relation]} ${rightSide - c}`),
          both(`x ${LATEX[relation]} ${rightSide - c} \\times ${d} = ${boundary}`),
        ],
        hints: [
          { bm: `Buang ${signed(c)} dahulu, kemudian darab dengan ${d}.`, en: `Remove the ${signed(c)} first, then multiply by ${d}.` },
          { bm: `${d} adalah positif, jadi arah kekal.`, en: `${d} is positive, so the direction is unchanged.` },
        ],
      }
    },
  },

  {
    id: 'linear-inequalities.L9',
    number: 9,
    concept: { bm: 'Ketaksamaan serentak', en: 'Simultaneous inequalities' },
    generate(rng, scale) {
      const a = rng.int(2, widen(6, scale))
      const c = rng.nonZero(-widen(9, scale), widen(9, scale))
      const lower = rng.int(-widen(8, scale), widen(4, scale))
      const upper = lower + rng.int(1, widen(8, scale))
      const lowerStrict = rng.chance(0.5)
      const upperStrict = rng.chance(0.5)
      const lowerRelation = lowerStrict ? '<' : '<='
      const upperRelation = upperStrict ? '<' : '<='
      return {
        instruction: {
          bm: 'Selesaikan (contoh: 1 < x <= 5)',
          en: 'Solve (for example 1 < x <= 5)',
        },
        prompt: both(
          `${a * lower + c} ${LATEX[lowerRelation]} ${term(a, 'x')} ${signed(c)} ${LATEX[upperRelation]} ${a * upper + c}`,
        ),
        answer: `${lower} ${lowerRelation} x ${upperRelation} ${upper}`,
        answerKind: 'inequality',
        steps: [
          both(
            `${a * lower + c} ${LATEX[lowerRelation]} ${term(a, 'x')} ${signed(c)} ${LATEX[upperRelation]} ${a * upper + c}`,
          ),
          both(`${a * lower} ${LATEX[lowerRelation]} ${term(a, 'x')} ${LATEX[upperRelation]} ${a * upper}`),
          both(`${lower} ${LATEX[lowerRelation]} x ${LATEX[upperRelation]} ${upper}`),
        ],
        hints: [
          {
            bm: 'Lakukan operasi yang sama pada ketiga-tiga bahagian serentak.',
            en: 'Apply the same operation to all three parts at once.',
          },
          {
            bm: `Tolak ${signed(c)} daripada ketiga-tiga bahagian, kemudian bahagi dengan ${a}.`,
            en: `Subtract the ${signed(c)} from all three parts, then divide by ${a}.`,
          },
        ],
      }
    },
  },
]

export const linearInequalities: Topic = {
  id: 'linear-inequalities',
  chapter: 7,
  name: { bm: 'Ketaksamaan Linear', en: 'Linear Inequalities' },
  levels,
}
