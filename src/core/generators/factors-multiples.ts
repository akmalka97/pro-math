import { factorsOf, gcd, lcm, primeFactors, widen } from './format'
import type { Rng } from './rng'
import type { Level, Topic } from './types'

function both(latex: string): { bm: string; en: string } {
  return { bm: latex, en: latex }
}

/** A composite number, so factor questions are never trivial. */
function composite(rng: Rng, min: number, max: number): number {
  for (;;) {
    const value = rng.int(min, max)
    if (factorsOf(value).length > 2) return value
  }
}

const levels: Level[] = [
  {
    id: 'factors-multiples.L1',
    number: 1,
    concept: { bm: 'Senaraikan faktor', en: 'Listing factors' },
    generate(rng, scale) {
      const n = composite(rng, 8, widen(40, scale))
      const factors = factorsOf(n)
      return {
        instruction: {
          bm: 'Senaraikan semua faktor, dipisahkan dengan koma',
          en: 'List every factor, separated by commas',
        },
        prompt: both(`${n}`),
        answer: factors.join(','),
        answerKind: 'set',
        steps: [both(`${n} = ${factors.join(' \\times ')}\\text{?}`), both(`\\{${factors.join(', ')}\\}`)],
        hints: [
          { bm: 'Uji setiap nombor dari 1 hingga ke nombor itu sendiri.', en: 'Test each number from 1 up to the number itself.' },
          { bm: 'Faktor datang berpasangan. Jika 2 ialah faktor, begitu juga hasil bahaginya.', en: 'Factors come in pairs. If 2 is a factor, so is the number it pairs with.' },
        ],
      }
    },
  },

  {
    id: 'factors-multiples.L2',
    number: 2,
    concept: { bm: 'Faktor yang hilang', en: 'Missing factor' },
    generate(rng, scale) {
      const a = rng.int(2, widen(9, scale))
      const b = rng.int(2, widen(12, scale))
      const product = a * b
      return {
        instruction: { bm: 'Cari nombor yang hilang', en: 'Find the missing number' },
        prompt: both(`${a} \\times \\square = ${product}`),
        answer: `${b}`,
        answerKind: 'integer',
        steps: [both(`\\square = ${product} \\div ${a}`), both(`\\square = ${b}`)],
        hints: [
          { bm: `Bahagi ${product} dengan ${a}.`, en: `Divide ${product} by ${a}.` },
          { bm: 'Pembahagian adalah songsangan pendaraban.', en: 'Division undoes multiplication.' },
        ],
      }
    },
  },

  {
    id: 'factors-multiples.L3',
    number: 3,
    concept: { bm: 'FSTB apabila satu membahagi yang lain', en: 'HCF when one divides the other' },
    generate(rng, scale) {
      const a = rng.int(2, widen(12, scale))
      const multiplier = rng.int(2, widen(6, scale))
      const b = a * multiplier
      return {
        instruction: { bm: 'Cari faktor sepunya terbesar (FSTB)', en: 'Find the highest common factor (HCF)' },
        prompt: both(`\\text{HCF}(${a},\\ ${b})`),
        answer: `${a}`,
        answerKind: 'integer',
        steps: [
          both(`${b} = ${a} \\times ${multiplier}`),
          both(`\\text{${a} membahagi ${b}, jadi HCF} = ${a}`),
        ],
        hints: [
          { bm: `Adakah ${a} membahagi ${b} dengan tepat?`, en: `Does ${a} divide ${b} exactly?` },
          { bm: 'Jika ya, nombor yang lebih kecil itu sendiri adalah FSTB.', en: 'If it does, the smaller number is itself the HCF.' },
        ],
      }
    },
  },

  {
    id: 'factors-multiples.L4',
    number: 4,
    concept: { bm: 'FSTB am', en: 'General HCF' },
    generate(rng, scale) {
      const common = rng.int(2, widen(9, scale))
      let p = rng.int(2, widen(9, scale))
      let q = rng.int(2, widen(9, scale))
      // Shared factors between p and q would raise the HCF above `common`.
      while (gcd(p, q) !== 1) q = rng.int(2, widen(12, scale))
      const a = common * p
      const b = common * q
      const answer = gcd(a, b)
      return {
        instruction: { bm: 'Cari faktor sepunya terbesar (FSTB)', en: 'Find the highest common factor (HCF)' },
        prompt: both(`\\text{HCF}(${a},\\ ${b})`),
        answer: `${answer}`,
        answerKind: 'integer',
        steps: [
          both(`${a} = ${common} \\times ${p}`),
          both(`${b} = ${common} \\times ${q}`),
          both(`\\text{HCF} = ${answer}`),
        ],
        hints: [
          { bm: 'Faktorkan kedua-dua nombor kepada faktor perdana.', en: 'Break both numbers into prime factors.' },
          { bm: 'Ambil setiap faktor perdana sepunya pada kuasa terkecil.', en: 'Take each shared prime factor at its lowest power.' },
        ],
      }
    },
  },

  {
    id: 'factors-multiples.L5',
    number: 5,
    concept: { bm: 'GSTK nombor kecil', en: 'LCM of small numbers' },
    generate(rng, scale) {
      const a = rng.int(2, widen(8, scale))
      let b = rng.int(2, widen(8, scale))
      if (b === a) b = a + 1
      const answer = lcm(a, b)
      return {
        instruction: { bm: 'Cari gandaan sepunya terkecil (GSTK)', en: 'Find the lowest common multiple (LCM)' },
        prompt: both(`\\text{LCM}(${a},\\ ${b})`),
        answer: `${answer}`,
        answerKind: 'integer',
        steps: [
          both(`\\text{HCF}(${a}, ${b}) = ${gcd(a, b)}`),
          both(`\\text{LCM} = \\frac{${a} \\times ${b}}{${gcd(a, b)}} = ${answer}`),
        ],
        hints: [
          { bm: 'Senaraikan gandaan setiap nombor sehingga bertemu.', en: 'List the multiples of each number until they meet.' },
          { bm: 'Atau gunakan: LCM = (a × b) ÷ HCF.', en: 'Or use: LCM = (a × b) ÷ HCF.' },
        ],
      }
    },
  },

  {
    id: 'factors-multiples.L6',
    number: 6,
    concept: { bm: 'GSTK am', en: 'General LCM' },
    generate(rng, scale) {
      const a = rng.int(10, widen(24, scale))
      let b = rng.int(10, widen(24, scale))
      if (b === a) b = a + 2
      const answer = lcm(a, b)
      return {
        instruction: { bm: 'Cari gandaan sepunya terkecil (GSTK)', en: 'Find the lowest common multiple (LCM)' },
        prompt: both(`\\text{LCM}(${a},\\ ${b})`),
        answer: `${answer}`,
        answerKind: 'integer',
        steps: [
          both(`\\text{HCF}(${a}, ${b}) = ${gcd(a, b)}`),
          both(`\\text{LCM} = \\frac{${a} \\times ${b}}{${gcd(a, b)}} = ${answer}`),
        ],
        hints: [
          { bm: 'Gunakan pemfaktoran perdana bagi kedua-dua nombor.', en: 'Use the prime factorisation of both numbers.' },
          { bm: 'Ambil setiap faktor perdana pada kuasa tertinggi.', en: 'Take every prime factor at its highest power.' },
        ],
      }
    },
  },

  {
    id: 'factors-multiples.L7',
    number: 7,
    concept: { bm: 'Pemfaktoran perdana', en: 'Prime factorisation' },
    generate(rng, scale) {
      const n = composite(rng, 20, widen(120, scale))
      const factors = [...primeFactors(n).entries()].sort((a, b) => a[0] - b[0])
      const answer = factors.map(([prime, power]) => (power === 1 ? `${prime}` : `${prime}^${power}`)).join('*')
      const latex = factors
        .map(([prime, power]) => (power === 1 ? `${prime}` : `${prime}^{${power}}`))
        .join(' \\times ')
      return {
        instruction: {
          bm: 'Tulis sebagai hasil darab faktor perdana (contoh: 2^3 * 3)',
          en: 'Write as a product of prime factors (for example 2^3 * 3)',
        },
        prompt: both(`${n}`),
        answer,
        answerKind: 'expression',
        steps: [both(`${n} = ${latex}`)],
        hints: [
          { bm: 'Bahagi berulang kali dengan perdana terkecil yang boleh.', en: 'Divide repeatedly by the smallest prime that fits.' },
          { bm: 'Mula dengan 2, kemudian 3, kemudian 5.', en: 'Start with 2, then 3, then 5.' },
        ],
      }
    },
  },

  {
    id: 'factors-multiples.L8',
    number: 8,
    concept: { bm: 'Tiga nombor', en: 'Three numbers' },
    generate(rng, scale) {
      const common = rng.int(2, widen(8, scale))
      const a = common * rng.int(2, widen(6, scale))
      const b = common * rng.int(2, widen(6, scale))
      const c = common * rng.int(2, widen(6, scale))
      const wantHcf = rng.chance(0.5)
      const answer = wantHcf ? gcd(gcd(a, b), c) : lcm(lcm(a, b), c)
      return {
        instruction: wantHcf
          ? { bm: 'Cari FSTB bagi ketiga-tiga nombor', en: 'Find the HCF of all three numbers' }
          : { bm: 'Cari GSTK bagi ketiga-tiga nombor', en: 'Find the LCM of all three numbers' },
        prompt: both(`${wantHcf ? '\\text{HCF}' : '\\text{LCM}'}(${a},\\ ${b},\\ ${c})`),
        answer: `${answer}`,
        answerKind: 'integer',
        steps: [
          both(`${wantHcf ? '\\text{HCF}' : '\\text{LCM}'}(${a}, ${b}) = ${wantHcf ? gcd(a, b) : lcm(a, b)}`),
          both(`${wantHcf ? '\\text{HCF}' : '\\text{LCM}'}(${wantHcf ? gcd(a, b) : lcm(a, b)}, ${c}) = ${answer}`),
        ],
        hints: [
          { bm: 'Selesaikan dua nombor dahulu, kemudian gabungkan dengan yang ketiga.', en: 'Handle two numbers first, then combine the result with the third.' },
          { bm: 'Urutan tidak penting.', en: 'The order does not matter.' },
        ],
      }
    },
  },

  {
    id: 'factors-multiples.L9',
    number: 9,
    concept: { bm: 'Masalah berayat GSTK', en: 'LCM word problem' },
    generate(rng, scale) {
      const a = rng.int(4, widen(20, scale))
      let b = rng.int(4, widen(20, scale))
      if (b === a) b = a + 3
      const answer = lcm(a, b)
      return {
        instruction: {
          bm: 'Jawab dalam minit',
          en: 'Answer in minutes',
        },
        prompt: {
          bm: `\\text{Dua loceng berbunyi setiap ${a} minit dan ${b} minit.}\\\\ \\text{Kedua-duanya berbunyi bersama sekarang.}\\\\ \\text{Berapa minit lagi sebelum berbunyi bersama semula?}`,
          en: `\\text{Two bells ring every ${a} minutes and ${b} minutes.}\\\\ \\text{They ring together now.}\\\\ \\text{How many minutes until they next ring together?}`,
        },
        answer: `${answer}`,
        answerKind: 'integer',
        steps: [
          both(`\\text{Cari LCM}(${a}, ${b})`),
          both(`\\text{LCM} = \\frac{${a} \\times ${b}}{${gcd(a, b)}} = ${answer}`),
        ],
        hints: [
          { bm: 'Loceng berbunyi bersama pada gandaan sepunya.', en: 'The bells coincide at common multiples.' },
          { bm: 'Yang pertama selepas ini adalah gandaan sepunya terkecil.', en: 'The next one is the lowest common multiple.' },
        ],
      }
    },
  },
]

export const factorsMultiples: Topic = {
  id: 'factors-multiples',
  chapter: 2,
  name: { bm: 'Faktor dan Gandaan', en: 'Factors & Multiples' },
  levels,
}
