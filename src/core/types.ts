export type Verdict = 'correct' | 'incorrect' | 'unreadable'

export type AnswerKind = 'integer' | 'rational' | 'expression' | 'set' | 'ratio'

export type Locale = 'bm' | 'en'

/** Plain prose, shown as-is. */
export type LocalizedText = { bm: string; en: string }

/** LaTeX source, rendered by KaTeX. */
export type LocalizedLatex = { bm: string; en: string }

export type InputMode = 'numeric' | 'expression' | 'mathfield'
