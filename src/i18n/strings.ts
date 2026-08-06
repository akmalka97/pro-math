import type { Locale } from '../core/types'

/**
 * Two hardcoded locales need a typed dictionary, not an i18n runtime with
 * loaders and interpolation.
 */
const strings = {
  appName: { bm: 'Pro Math', en: 'Pro Math' },
  tagline: { bm: 'Latihan Matematik Tingkatan 1 · KSSM', en: 'Form 1 Maths Practice · KSSM' },

  whoIsPractising: { bm: 'Siapa berlatih?', en: 'Who is practising?' },
  addProfile: { bm: 'Tambah profil', en: 'Add profile' },
  profileName: { bm: 'Nama', en: 'Name' },
  create: { bm: 'Cipta', en: 'Create' },
  cancel: { bm: 'Batal', en: 'Cancel' },
  deleteProfile: { bm: 'Padam profil', en: 'Delete profile' },
  deleteConfirm: {
    bm: 'Padam profil ini dan semua kemajuannya? Tindakan ini tidak boleh dibatalkan.',
    en: 'Delete this profile and all of its progress? This cannot be undone.',
  },

  topics: { bm: 'Topik', en: 'Topics' },
  chapter: { bm: 'Bab', en: 'Chapter' },
  level: { bm: 'Tahap', en: 'Level' },
  levels: { bm: 'Tahap', en: 'Levels' },
  locked: { bm: 'Berkunci', en: 'Locked' },
  mastered: { bm: 'Dikuasai', en: 'Mastered' },
  scaled: { bm: 'Lanjutan', en: 'Extended' },
  scaledNote: {
    bm: 'Tiada konsep baharu di atas tahap 9 — hanya nombor yang lebih mencabar.',
    en: 'No new concepts above level 9 — only harder arithmetic.',
  },
  startSet: { bm: 'Mula set 10 soalan', en: 'Start a set of 10' },
  continueLevel: { bm: 'Teruskan', en: 'Continue' },

  question: { bm: 'Soalan', en: 'Question' },
  yourAnswer: { bm: 'Jawapan anda', en: 'Your answer' },
  answerPlaceholder: { bm: 'Taip jawapan…', en: 'Type your answer…' },
  submit: { bm: 'Semak jawapan', en: 'Check answer' },
  next: { bm: 'Soalan seterusnya', en: 'Next question' },
  finishSet: { bm: 'Lihat keputusan', en: 'See result' },
  correct: { bm: 'Betul', en: 'Correct' },
  incorrect: { bm: 'Belum betul', en: 'Not yet' },
  unreadable: {
    bm: 'Jawapan itu tidak dapat dibaca. Cuba taip semula — ini tidak dikira salah.',
    en: 'That answer could not be read. Try again — this does not count as wrong.',
  },
  workedSolution: { bm: 'Jalan penyelesaian', en: 'Worked solution' },
  hints: { bm: 'Petunjuk', en: 'Hints' },
  revealHint: { bm: 'Beri petunjuk', en: 'Give me a hint' },
  allHintsShown: { bm: 'Semua petunjuk ditunjukkan', en: 'All hints shown' },
  scratchpad: { bm: 'Ruang kerja', en: 'Scratchpad' },
  scratchpadPlaceholder: {
    bm: 'Tulis langkah pengiraan anda di sini…',
    en: 'Work out your steps here…',
  },

  setComplete: { bm: 'Set selesai', en: 'Set complete' },
  passed: { bm: 'Lulus', en: 'Passed' },
  notPassed: { bm: 'Belum lulus', en: 'Not passed' },
  advanceMessage: { bm: 'Naik ke tahap berikutnya.', en: 'Moving up a level.' },
  repeatMessage: { bm: 'Ulang tahap ini sekali lagi.', en: 'Repeat this level once more.' },
  dropMessage: { bm: 'Kembali satu tahap untuk mengukuhkan asas.', en: 'Dropping one level to rebuild the basics.' },
  againSameLevel: { bm: 'Set baharu', en: 'New set' },
  backToTopics: { bm: 'Kembali ke topik', en: 'Back to topics' },

  settings: { bm: 'Tetapan', en: 'Settings' },
  language: { bm: 'Bahasa', en: 'Language' },
  inputMode: { bm: 'Cara menaip jawapan', en: 'Answer input' },
  inputNumeric: { bm: 'Nombor sahaja', en: 'Numbers only' },
  inputExpression: { bm: 'Teks dengan papan kekunci', en: 'Text with keypad' },
  inputMathfield: { bm: 'Editor matematik', en: 'Maths editor' },
  switchProfile: { bm: 'Tukar profil', en: 'Switch profile' },

  offlineReady: { bm: 'Sedia digunakan tanpa internet', en: 'Ready to use offline' },
} as const

export type StringKey = keyof typeof strings

export function t(key: StringKey, locale: Locale): string {
  return strings[key][locale]
}
