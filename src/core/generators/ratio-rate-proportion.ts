import { gcd, rationalAnswer, widen } from './format'
import type { Level, Topic } from './types'

function both(latex: string): { bm: string; en: string } {
  return { bm: latex, en: latex }
}

function reduceRatio(terms: number[]): number[] {
  const divisor = terms.reduce((acc, value) => gcd(acc, value), terms[0])
  return terms.map((value) => value / divisor)
}

const levels: Level[] = [
  {
    id: 'ratio-rate-proportion.L1',
    number: 1,
    concept: { bm: 'Permudahkan nisbah', en: 'Simplifying a ratio' },
    generate(rng, scale) {
      const multiplier = rng.int(2, widen(9, scale))
      const a = rng.int(1, widen(9, scale))
      let b = rng.int(1, widen(9, scale))
      if (b === a) b = a + 1
      const [ra, rb] = reduceRatio([a * multiplier, b * multiplier])
      return {
        instruction: { bm: 'Permudahkan nisbah (contoh: 2:3)', en: 'Simplify the ratio (for example 2:3)' },
        prompt: both(`${a * multiplier} : ${b * multiplier}`),
        answer: `${ra}:${rb}`,
        answerKind: 'ratio',
        steps: [
          both(`\\text{HCF}(${a * multiplier}, ${b * multiplier}) = ${gcd(a * multiplier, b * multiplier)}`),
          both(`${a * multiplier} : ${b * multiplier} = ${ra} : ${rb}`),
        ],
        hints: [
          { bm: 'Bahagi kedua-dua sebutan dengan faktor sepunya terbesar.', en: 'Divide both terms by their highest common factor.' },
          { bm: 'Nisbah dipermudahkan sama seperti pecahan.', en: 'A ratio simplifies just like a fraction.' },
        ],
      }
    },
  },

  {
    id: 'ratio-rate-proportion.L2',
    number: 2,
    concept: { bm: 'Nisbah tiga sebutan', en: 'Three-part ratio' },
    generate(rng, scale) {
      const multiplier = rng.int(2, widen(6, scale))
      const parts = [rng.int(1, widen(6, scale)), rng.int(1, widen(6, scale)), rng.int(1, widen(6, scale))]
      const scaled = parts.map((part) => part * multiplier)
      const reduced = reduceRatio(scaled)
      return {
        instruction: { bm: 'Permudahkan nisbah (contoh: 2:3:5)', en: 'Simplify the ratio (for example 2:3:5)' },
        prompt: both(scaled.join(' : ')),
        answer: reduced.join(':'),
        answerKind: 'ratio',
        steps: [
          both(`\\text{HCF} = ${scaled.reduce((acc, value) => gcd(acc, value), scaled[0])}`),
          both(`${scaled.join(' : ')} = ${reduced.join(' : ')}`),
        ],
        hints: [
          { bm: 'Cari faktor sepunya terbesar bagi ketiga-tiga sebutan.', en: 'Find the highest common factor of all three terms.' },
          { bm: 'Bahagi setiap sebutan dengan faktor yang sama.', en: 'Divide every term by that same factor.' },
        ],
      }
    },
  },

  {
    id: 'ratio-rate-proportion.L3',
    number: 3,
    concept: { bm: 'Sebutan yang hilang', en: 'Missing term' },
    generate(rng, scale) {
      const a = rng.int(2, widen(9, scale))
      let b = rng.int(2, widen(9, scale))
      if (b === a) b = a + 1
      const multiplier = rng.int(2, widen(8, scale))
      return {
        instruction: { bm: 'Cari sebutan yang hilang', en: 'Find the missing term' },
        prompt: both(`${a} : ${b} = ${a * multiplier} : \\square`),
        answer: `${b * multiplier}`,
        answerKind: 'integer',
        steps: [
          both(`${a * multiplier} \\div ${a} = ${multiplier}`),
          both(`\\square = ${b} \\times ${multiplier} = ${b * multiplier}`),
        ],
        hints: [
          { bm: `Berapa kali ganda ${a} menjadi ${a * multiplier}?`, en: `What does ${a} multiply by to become ${a * multiplier}?` },
          { bm: 'Kenakan faktor yang sama pada sebutan kedua.', en: 'Apply that same factor to the second term.' },
        ],
      }
    },
  },

  {
    id: 'ratio-rate-proportion.L4',
    number: 4,
    concept: { bm: 'Bahagi kuantiti kepada dua bahagian', en: 'Dividing a quantity in two parts' },
    generate(rng, scale) {
      const a = rng.int(1, widen(6, scale))
      let b = rng.int(1, widen(6, scale))
      if (b === a) b = a + 1
      const unit = rng.int(5, widen(30, scale))
      const total = (a + b) * unit
      const larger = Math.max(a, b) * unit
      return {
        instruction: { bm: 'Cari bahagian yang lebih besar', en: 'Find the larger share' },
        prompt: {
          bm: `\\text{RM ${total} dibahagi mengikut nisbah } ${a} : ${b}`,
          en: `\\text{RM ${total} is divided in the ratio } ${a} : ${b}`,
        },
        answer: `${larger}`,
        answerKind: 'integer',
        steps: [
          both(`\\text{Jumlah bahagian} = ${a} + ${b} = ${a + b}`),
          both(`\\text{Satu bahagian} = ${total} \\div ${a + b} = ${unit}`),
          both(`\\text{Bahagian besar} = ${Math.max(a, b)} \\times ${unit} = ${larger}`),
        ],
        hints: [
          { bm: `Jumlahkan bahagian: ${a} + ${b} = ${a + b}.`, en: `Add the parts: ${a} + ${b} = ${a + b}.` },
          { bm: 'Bahagi jumlah dengan bilangan bahagian untuk mendapat nilai satu bahagian.', en: 'Divide the total by the number of parts to get one part.' },
        ],
      }
    },
  },

  {
    id: 'ratio-rate-proportion.L5',
    number: 5,
    concept: { bm: 'Bahagi kuantiti kepada tiga bahagian', en: 'Dividing a quantity in three parts' },
    generate(rng, scale) {
      const parts = [rng.int(1, widen(5, scale)), rng.int(1, widen(5, scale)), rng.int(1, widen(5, scale))]
      const unit = rng.int(4, widen(25, scale))
      const total = parts.reduce((sum, part) => sum + part, 0) * unit
      const largest = Math.max(...parts) * unit
      return {
        instruction: { bm: 'Cari bahagian yang terbesar', en: 'Find the largest share' },
        prompt: {
          bm: `\\text{RM ${total} dibahagi mengikut nisbah } ${parts.join(' : ')}`,
          en: `\\text{RM ${total} is divided in the ratio } ${parts.join(' : ')}`,
        },
        answer: `${largest}`,
        answerKind: 'integer',
        steps: [
          both(`\\text{Jumlah bahagian} = ${parts.join(' + ')} = ${parts.reduce((sum, part) => sum + part, 0)}`),
          both(`\\text{Satu bahagian} = ${total} \\div ${parts.reduce((sum, part) => sum + part, 0)} = ${unit}`),
          both(`\\text{Bahagian terbesar} = ${Math.max(...parts)} \\times ${unit} = ${largest}`),
        ],
        hints: [
          { bm: 'Kaedahnya sama seperti dua bahagian, cuma tiga sebutan.', en: 'The method is the same as two parts, just with three terms.' },
          { bm: 'Cari nilai satu bahagian dahulu.', en: 'Find the value of one part first.' },
        ],
      }
    },
  },

  {
    id: 'ratio-rate-proportion.L6',
    number: 6,
    concept: { bm: 'Kadar seunit', en: 'Unit rate' },
    generate(rng, scale) {
      const hours = rng.int(2, widen(8, scale))
      const speed = rng.int(20, widen(90, scale))
      const distance = speed * hours
      return {
        instruction: { bm: 'Jawab dalam km/j', en: 'Answer in km/h' },
        prompt: {
          bm: `\\text{Sebuah kereta bergerak ${distance} km dalam ${hours} jam.}\\\\ \\text{Berapakah lajunya?}`,
          en: `\\text{A car travels ${distance} km in ${hours} hours.}\\\\ \\text{What is its speed?}`,
        },
        answer: `${speed}`,
        answerKind: 'integer',
        steps: [both(`\\text{Laju} = \\frac{${distance}}{${hours}} = ${speed}\\ \\text{km/j}`)],
        hints: [
          { bm: 'Kadar seunit bermaksud jumlah dibahagi bilangan unit.', en: 'A unit rate is the total divided by the number of units.' },
          { bm: `${distance} \\div ${hours}.`, en: `${distance} \\div ${hours}.` },
        ],
      }
    },
  },

  {
    id: 'ratio-rate-proportion.L7',
    number: 7,
    concept: { bm: 'Kadaran terus', en: 'Direct proportion' },
    generate(rng, scale) {
      const unitPrice = rng.int(3, widen(15, scale))
      const boughtCount = rng.int(2, widen(8, scale))
      const askedCount = rng.int(2, widen(12, scale))
      const boughtCost = unitPrice * boughtCount
      return {
        instruction: { bm: 'Jawab dalam RM', en: 'Answer in RM' },
        prompt: {
          bm: `\\text{${boughtCount} buah buku berharga RM ${boughtCost}.}\\\\ \\text{Berapakah harga ${askedCount} buah buku?}`,
          en: `\\text{${boughtCount} books cost RM ${boughtCost}.}\\\\ \\text{What do ${askedCount} books cost?}`,
        },
        answer: `${unitPrice * askedCount}`,
        answerKind: 'integer',
        steps: [
          both(`\\text{Harga seunit} = ${boughtCost} \\div ${boughtCount} = ${unitPrice}`),
          both(`${askedCount} \\times ${unitPrice} = ${unitPrice * askedCount}`),
        ],
        hints: [
          { bm: 'Cari harga satu buku dahulu.', en: 'Find the price of one book first.' },
          { bm: 'Kemudian darab dengan bilangan yang ditanya.', en: 'Then multiply by the number asked for.' },
        ],
      }
    },
  },

  {
    id: 'ratio-rate-proportion.L8',
    number: 8,
    concept: { bm: 'Penukaran kadar', en: 'Rate conversion' },
    generate(rng, scale) {
      const kmh = rng.int(2, widen(30, scale)) * 3.6
      const rounded = Math.round(kmh * 10) / 10
      const ms = rationalAnswer(Math.round(rounded * 10), 36)
      return {
        instruction: { bm: 'Tukar kepada m/s', en: 'Convert to m/s' },
        prompt: both(`${rounded}\\ \\text{km/j}`),
        answer: ms,
        answerKind: 'rational',
        steps: [
          both(`1\\ \\text{km/j} = \\frac{1000}{3600}\\ \\text{m/s} = \\frac{1}{3.6}\\ \\text{m/s}`),
          both(`${rounded} \\div 3.6 = ${ms}`),
        ],
        hints: [
          { bm: 'Bahagi dengan 3.6 untuk menukar km/j kepada m/s.', en: 'Divide by 3.6 to convert km/h to m/s.' },
          { bm: '1 km = 1000 m dan 1 jam = 3600 saat.', en: '1 km = 1000 m and 1 hour = 3600 seconds.' },
        ],
      }
    },
  },

  {
    id: 'ratio-rate-proportion.L9',
    number: 9,
    concept: { bm: 'Nisbah bergabung', en: 'Combined ratio' },
    generate(rng, scale) {
      const a = rng.int(1, widen(6, scale))
      const b1 = rng.int(1, widen(6, scale))
      const b2 = rng.int(1, widen(6, scale))
      const c = rng.int(1, widen(6, scale))
      // Scale each ratio so the shared term b matches, then reduce.
      const combined = reduceRatio([a * b2, b1 * b2, b1 * c])
      return {
        instruction: { bm: 'Cari a : c (contoh: 2:3)', en: 'Find a : c (for example 2:3)' },
        prompt: both(`a : b = ${a} : ${b1}, \\quad b : c = ${b2} : ${c}`),
        answer: `${combined[0]}:${combined[2]}`,
        answerKind: 'ratio',
        steps: [
          both(`a : b = ${a * b2} : ${b1 * b2}`),
          both(`b : c = ${b1 * b2} : ${b1 * c}`),
          both(`a : b : c = ${combined.join(' : ')}`),
          both(`a : c = ${combined[0]} : ${combined[2]}`),
        ],
        hints: [
          { bm: 'Samakan sebutan b dalam kedua-dua nisbah.', en: 'Make the b term match in both ratios.' },
          { bm: `Darab nisbah pertama dengan ${b2} dan yang kedua dengan ${b1}.`, en: `Multiply the first ratio by ${b2} and the second by ${b1}.` },
        ],
      }
    },
  },
]

export const ratioRateProportion: Topic = {
  id: 'ratio-rate-proportion',
  chapter: 4,
  name: { bm: 'Nisbah, Kadar dan Kadaran', en: 'Ratio, Rate & Proportion' },
  levels,
}
