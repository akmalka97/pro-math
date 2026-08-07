import { widen } from './format'
import type { Rng } from './rng'
import type { Generated, Level, Topic } from './types'

const CALCULATE: Generated['instruction'] = {
  bm: 'Kira, betul kepada 3 angka bererti jika perlu',
  en: 'Calculate, correct to 3 significant figures where needed',
}

function both(latex: string): { bm: string; en: string } {
  return { bm: latex, en: latex }
}

/** Primitive triples, scaled as the level rises. No diagram is ever required. */
const TRIPLES: ReadonlyArray<readonly [number, number, number]> = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
]

function triple(rng: Rng, scale: number): readonly [number, number, number] {
  const [a, b, c] = rng.pick(TRIPLES)
  const factor = scale === 0 ? 1 : rng.int(1, 1 + scale)
  return [a * factor, b * factor, c * factor]
}

const levels: Level[] = [
  {
    id: 'pythagoras.L1',
    number: 1,
    concept: { bm: 'Cari hipotenus', en: 'Finding the hypotenuse' },
    generate(rng, scale) {
      const [a, b, c] = triple(rng, scale)
      return {
        instruction: CALCULATE,
        prompt: {
          bm: `\\text{Segi tiga bersudut tegak mempunyai dua sisi ${a} cm dan ${b} cm.}\\\\ \\text{Cari panjang hipotenus.}`,
          en: `\\text{A right-angled triangle has two sides of ${a} cm and ${b} cm.}\\\\ \\text{Find the length of the hypotenuse.}`,
        },
        answer: `${c}`,
        answerKind: 'integer',
        steps: [
          both(`c^2 = ${a}^2 + ${b}^2`),
          both(`c^2 = ${a * a} + ${b * b} = ${a * a + b * b}`),
          both(`c = \\sqrt{${a * a + b * b}} = ${c}`),
        ],
        hints: [
          { bm: 'Teorem Pythagoras: a² + b² = c², dengan c ialah hipotenus.', en: 'Pythagoras: a² + b² = c², where c is the hypotenuse.' },
          { bm: 'Hipotenus sentiasa sisi terpanjang, bertentangan sudut tegak.', en: 'The hypotenuse is always the longest side, opposite the right angle.' },
        ],
      }
    },
  },

  {
    id: 'pythagoras.L2',
    number: 2,
    concept: { bm: 'Cari sisi yang hilang', en: 'Finding a missing leg' },
    generate(rng, scale) {
      const [a, b, c] = triple(rng, scale)
      const askForA = rng.chance(0.5)
      const known = askForA ? b : a
      const missing = askForA ? a : b
      return {
        instruction: CALCULATE,
        prompt: {
          bm: `\\text{Hipotenus sebuah segi tiga bersudut tegak ialah ${c} cm.}\\\\ \\text{Satu sisi lain ialah ${known} cm. Cari sisi yang ketiga.}`,
          en: `\\text{The hypotenuse of a right-angled triangle is ${c} cm.}\\\\ \\text{Another side is ${known} cm. Find the third side.}`,
        },
        answer: `${missing}`,
        answerKind: 'integer',
        steps: [
          both(`a^2 = ${c}^2 - ${known}^2`),
          both(`a^2 = ${c * c} - ${known * known} = ${c * c - known * known}`),
          both(`a = \\sqrt{${c * c - known * known}} = ${missing}`),
        ],
        hints: [
          { bm: 'Susun semula: a² = c² − b².', en: 'Rearrange to a² = c² − b².' },
          { bm: 'Tolak, jangan tambah — yang dicari bukan hipotenus.', en: 'Subtract rather than add — the missing side is not the hypotenuse.' },
        ],
      }
    },
  },

  {
    id: 'pythagoras.L3',
    number: 3,
    concept: { bm: 'Hipotenus bukan nombor bulat', en: 'Hypotenuse that is not a whole number' },
    generate(rng, scale) {
      let a = rng.int(2, widen(12, scale))
      let b = rng.int(2, widen(12, scale))
      // A perfect square here would make it level 1 again.
      while (Number.isInteger(Math.sqrt(a * a + b * b))) b++
      return {
        instruction: CALCULATE,
        prompt: {
          bm: `\\text{Dua sisi bersudut tegak ialah ${a} cm dan ${b} cm.}\\\\ \\text{Cari hipotenus.}`,
          en: `\\text{The two shorter sides are ${a} cm and ${b} cm.}\\\\ \\text{Find the hypotenuse.}`,
        },
        answer: `sqrt(${a * a + b * b})`,
        answerKind: 'rational',
        steps: [
          both(`c^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}`),
          both(`c = \\sqrt{${a * a + b * b}} \\approx ${Math.sqrt(a * a + b * b).toPrecision(3)}`),
        ],
        hints: [
          { bm: 'Jawapannya bukan nombor bulat. Beri 3 angka bererti.', en: 'The answer is not a whole number. Give 3 significant figures.' },
          {
            bm: `Ia terletak antara ${Math.floor(Math.sqrt(a * a + b * b))} dan ${Math.ceil(Math.sqrt(a * a + b * b))}.`,
            en: `It lies between ${Math.floor(Math.sqrt(a * a + b * b))} and ${Math.ceil(Math.sqrt(a * a + b * b))}.`,
          },
        ],
      }
    },
  },

  {
    id: 'pythagoras.L4',
    number: 4,
    concept: { bm: 'Sisi bukan nombor bulat', en: 'Leg that is not a whole number' },
    generate(rng, scale) {
      const known = rng.int(3, widen(12, scale))
      let hypotenuse = known + rng.int(1, widen(9, scale))
      while (Number.isInteger(Math.sqrt(hypotenuse * hypotenuse - known * known))) hypotenuse++
      const squared = hypotenuse * hypotenuse - known * known
      return {
        instruction: CALCULATE,
        prompt: {
          bm: `\\text{Hipotenus ialah ${hypotenuse} cm dan satu sisi ialah ${known} cm.}\\\\ \\text{Cari sisi yang satu lagi.}`,
          en: `\\text{The hypotenuse is ${hypotenuse} cm and one side is ${known} cm.}\\\\ \\text{Find the other side.}`,
        },
        answer: `sqrt(${squared})`,
        answerKind: 'rational',
        steps: [
          both(`a^2 = ${hypotenuse}^2 - ${known}^2 = ${squared}`),
          both(`a = \\sqrt{${squared}} \\approx ${Math.sqrt(squared).toPrecision(3)}`),
        ],
        hints: [
          { bm: 'Kuasa duakan kedua-duanya dahulu, kemudian tolak.', en: 'Square both first, then subtract.' },
          { bm: 'Punca kuasa dua di akhir sekali.', en: 'Take the square root last.' },
        ],
      }
    },
  },

  {
    id: 'pythagoras.L5',
    number: 5,
    concept: { bm: 'Pepenjuru segi empat tepat', en: 'Diagonal of a rectangle' },
    generate(rng, scale) {
      const [a, b, c] = triple(rng, scale)
      return {
        instruction: CALCULATE,
        prompt: {
          bm: `\\text{Sebuah segi empat tepat berukuran ${a} cm \\times ${b} cm.}\\\\ \\text{Cari panjang pepenjurunya.}`,
          en: `\\text{A rectangle measures ${a} cm by ${b} cm.}\\\\ \\text{Find the length of its diagonal.}`,
        },
        answer: `${c}`,
        answerKind: 'integer',
        steps: [
          both(`\\text{Pepenjuru membahagi segi empat tepat kepada dua segi tiga bersudut tegak.}`),
          both(`d^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}`),
          both(`d = ${c}`),
        ],
        hints: [
          {
            bm: 'Pepenjuru adalah hipotenus bagi segi tiga yang dibentuk oleh dua sisi.',
            en: 'The diagonal is the hypotenuse of the triangle formed by two sides.',
          },
          { bm: 'Panjang dan lebar adalah dua sisi bersudut tegak.', en: 'The length and width are the two shorter sides.' },
        ],
      }
    },
  },

  {
    id: 'pythagoras.L6',
    number: 6,
    concept: { bm: 'Masalah berayat: tangga', en: 'Word problem: a ladder' },
    generate(rng, scale) {
      const [a, b, c] = triple(rng, scale)
      return {
        instruction: { bm: 'Jawab dalam meter', en: 'Answer in metres' },
        prompt: {
          bm: `\\text{Sebatang tangga sepanjang ${c} m bersandar pada dinding.}\\\\ \\text{Kakinya ${a} m dari dinding.}\\\\ \\text{Berapa tinggi tangga itu mencapai dinding?}`,
          en: `\\text{A ${c} m ladder leans against a wall.}\\\\ \\text{Its foot is ${a} m from the wall.}\\\\ \\text{How far up the wall does it reach?}`,
        },
        answer: `${b}`,
        answerKind: 'integer',
        steps: [
          both(`\\text{Tangga ialah hipotenus.}`),
          both(`h^2 = ${c}^2 - ${a}^2 = ${c * c - a * a}`),
          both(`h = ${b}`),
        ],
        hints: [
          { bm: 'Tangga sentiasa sisi terpanjang, jadi ia hipotenus.', en: 'The ladder is the longest side, so it is the hypotenuse.' },
          { bm: 'Dinding dan tanah bertemu pada sudut tegak.', en: 'The wall and the ground meet at a right angle.' },
        ],
      }
    },
  },

  {
    id: 'pythagoras.L7',
    number: 7,
    concept: { bm: 'Perimeter segi tiga', en: 'Perimeter of the triangle' },
    generate(rng, scale) {
      const [a, b, c] = triple(rng, scale)
      return {
        instruction: { bm: 'Jawab dalam cm', en: 'Answer in cm' },
        prompt: {
          bm: `\\text{Dua sisi bersudut tegak ialah ${a} cm dan ${b} cm.}\\\\ \\text{Cari perimeter segi tiga itu.}`,
          en: `\\text{The two shorter sides are ${a} cm and ${b} cm.}\\\\ \\text{Find the perimeter of the triangle.}`,
        },
        answer: `${a + b + c}`,
        answerKind: 'integer',
        steps: [
          both(`c = \\sqrt{${a}^2 + ${b}^2} = ${c}`),
          both(`\\text{Perimeter} = ${a} + ${b} + ${c} = ${a + b + c}`),
        ],
        hints: [
          { bm: 'Cari hipotenus dahulu, kemudian campurkan ketiga-tiga sisi.', en: 'Find the hypotenuse first, then add all three sides.' },
          { bm: 'Perimeter adalah jumlah kesemua sisi.', en: 'The perimeter is the sum of every side.' },
        ],
      }
    },
  },

  {
    id: 'pythagoras.L8',
    number: 8,
    concept: { bm: 'Luas daripada hipotenus', en: 'Area from the hypotenuse' },
    generate(rng, scale) {
      const [a, b, c] = triple(rng, scale)
      const area = (a * b) / 2
      return {
        instruction: { bm: 'Jawab dalam cm²', en: 'Answer in cm²' },
        prompt: {
          bm: `\\text{Hipotenus ialah ${c} cm dan satu sisi ialah ${a} cm.}\\\\ \\text{Cari luas segi tiga itu.}`,
          en: `\\text{The hypotenuse is ${c} cm and one side is ${a} cm.}\\\\ \\text{Find the area of the triangle.}`,
        },
        answer: `${area}`,
        answerKind: 'rational',
        steps: [
          both(`\\text{Sisi yang hilang} = \\sqrt{${c}^2 - ${a}^2} = ${b}`),
          both(`\\text{Luas} = \\frac{1}{2} \\times ${a} \\times ${b} = ${area}`),
        ],
        hints: [
          { bm: 'Cari sisi yang hilang dahulu menggunakan Pythagoras.', en: 'Use Pythagoras to find the missing side first.' },
          {
            bm: 'Luas segi tiga bersudut tegak ialah setengah hasil darab dua sisi bersudut tegak.',
            en: 'The area is half the product of the two shorter sides.',
          },
        ],
      }
    },
  },

  {
    id: 'pythagoras.L9',
    number: 9,
    concept: { bm: 'Dua segi tiga bergabung', en: 'Two triangles combined' },
    generate(rng, scale) {
      const [a, b, c] = triple(rng, scale)
      // A second right triangle standing on the first one's hypotenuse.
      const d = rng.int(2, widen(10, scale))
      const finalSquared = c * c + d * d
      return {
        instruction: CALCULATE,
        prompt: {
          bm: `\\text{Segi tiga bersudut tegak pertama mempunyai sisi ${a} cm dan ${b} cm.}\\\\ \\text{Hipotenusnya menjadi satu sisi bagi segi tiga bersudut tegak kedua,}\\\\ \\text{yang sisi satu laginya ialah ${d} cm. Cari hipotenus kedua.}`,
          en: `\\text{A right triangle has sides ${a} cm and ${b} cm.}\\\\ \\text{Its hypotenuse becomes one side of a second right triangle}\\\\ \\text{whose other side is ${d} cm. Find the second hypotenuse.}`,
        },
        answer: Number.isInteger(Math.sqrt(finalSquared)) ? `${Math.sqrt(finalSquared)}` : `sqrt(${finalSquared})`,
        answerKind: Number.isInteger(Math.sqrt(finalSquared)) ? 'integer' : 'rational',
        steps: [
          both(`\\text{Hipotenus pertama} = \\sqrt{${a}^2 + ${b}^2} = ${c}`),
          both(`\\text{Hipotenus kedua} = \\sqrt{${c}^2 + ${d}^2} = \\sqrt{${finalSquared}}`),
          both(`\\approx ${Math.sqrt(finalSquared).toPrecision(3)}`),
        ],
        hints: [
          { bm: 'Gunakan Pythagoras dua kali.', en: 'Apply Pythagoras twice.' },
          {
            bm: 'Jawapan pertama menjadi salah satu sisi bagi pengiraan kedua.',
            en: 'The first answer becomes one of the sides in the second calculation.',
          },
        ],
      }
    },
  },
]

export const pythagoras: Topic = {
  id: 'pythagoras',
  chapter: 13,
  name: { bm: 'Teorem Pythagoras', en: 'The Pythagoras Theorem' },
  levels,
}
