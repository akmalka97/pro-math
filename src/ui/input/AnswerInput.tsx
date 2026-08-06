import { parse } from 'mathjs'
import { useEffect, useMemo, useRef } from 'react'
import { normalize } from '../../core/checker/normalize'
import type { AnswerKind, InputMode, Locale } from '../../core/types'
import { t } from '../../i18n/strings'
import { MathText } from '../render/MathText'

type Props = {
  mode: InputMode
  answerKind: AnswerKind
  value: string
  locale: Locale
  disabled: boolean
  onChange(value: string): void
  onSubmit(): void
}

const KEYPAD = ['(', ')', '/', '^', 'sqrt(', '-'] as const

/** Renders the student's typed expression back to them as real mathematics. */
function previewLatex(raw: string, mode: InputMode): string | null {
  if (!raw.trim()) return null
  try {
    return parse(normalize(raw, mode)).toTex({ parenthesis: 'auto' })
  } catch {
    return null
  }
}

export function AnswerInput({ mode, answerKind, value, locale, disabled, onChange, onSubmit }: Props) {
  const fieldRef = useRef<HTMLInputElement>(null)
  const mathfieldRef = useRef<HTMLElement & { value: string }>(null)

  // Loading MathLive registers the <math-field> custom element as a side effect.
  useEffect(() => {
    if (mode === 'mathfield') void import('mathlive')
  }, [mode])

  useEffect(() => {
    const element = mathfieldRef.current
    if (mode !== 'mathfield' || !element) return
    if (element.value !== value) element.value = value
    const handler = () => onChange(element.value)
    element.addEventListener('input', handler)
    return () => element.removeEventListener('input', handler)
  }, [mode, value, onChange])

  const preview = useMemo(() => previewLatex(value, mode), [value, mode])

  if (mode === 'mathfield') {
    return (
      <div className="card card-flat">
        <p className="eyebrow eyebrow-muted">{t('yourAnswer', locale)}</p>
        {/* @ts-expect-error MathLive registers this custom element at runtime. */}
        <math-field ref={mathfieldRef} />
      </div>
    )
  }

  const isNumeric = mode === 'numeric'

  return (
    <div className="card card-flat">
      <p className="eyebrow eyebrow-muted">{t('yourAnswer', locale)}</p>
      <input
        ref={fieldRef}
        className="field"
        value={value}
        disabled={disabled}
        placeholder={t('answerPlaceholder', locale)}
        inputMode={isNumeric ? 'text' : 'text'}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !disabled) onSubmit()
        }}
      />

      {!isNumeric && (
        // The phone keyboard hides these behind its symbol layer, which is
        // enough friction to stop a student answering at all.
        <div className="keypad">
          {KEYPAD.map((key) => (
            <button
              key={key}
              type="button"
              className="key"
              disabled={disabled}
              onClick={() => {
                onChange(value + key)
                fieldRef.current?.focus()
              }}
            >
              {key === 'sqrt(' ? '√' : key}
            </button>
          ))}
        </div>
      )}

      {isNumeric && (
        <div className="keypad" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <button type="button" className="key" disabled={disabled} onClick={() => onChange(value + '-')}>
            −
          </button>
          <button type="button" className="key" disabled={disabled} onClick={() => onChange(value + '.')}>
            .
          </button>
          <button type="button" className="key" disabled={disabled} onClick={() => onChange(value.slice(0, -1))}>
            ⌫
          </button>
        </div>
      )}

      <div className="preview formula-sm">
        {preview ? <MathText latex={preview} /> : <span className="muted">{hintFor(answerKind, locale)}</span>}
      </div>
    </div>
  )
}

function hintFor(kind: AnswerKind, locale: Locale): string {
  const examples: Record<AnswerKind, { bm: string; en: string }> = {
    integer: { bm: 'Contoh: -7', en: 'For example: -7' },
    rational: { bm: 'Contoh: 3/4 atau 0.75', en: 'For example: 3/4 or 0.75' },
    expression: { bm: 'Contoh: 5x + 3', en: 'For example: 5x + 3' },
    set: { bm: 'Contoh: 1, 2, 3, 6', en: 'For example: 1, 2, 3, 6' },
    ratio: { bm: 'Contoh: 2:3', en: 'For example: 2:3' },
  }
  return examples[kind][locale]
}
