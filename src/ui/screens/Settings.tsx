import { useNavigate } from 'react-router-dom'
import type { InputMode, Locale } from '../../core/types'
import { t } from '../../i18n/strings'
import { useAppState } from '../app/AppState'

const INPUT_MODES: Array<{ mode: InputMode; key: 'inputNumeric' | 'inputExpression' | 'inputMathfield' }> = [
  { mode: 'numeric', key: 'inputNumeric' },
  { mode: 'expression', key: 'inputExpression' },
  { mode: 'mathfield', key: 'inputMathfield' },
]

export function Settings() {
  const { profile, locale, saveProfile, selectProfile } = useAppState()
  const navigate = useNavigate()

  if (!profile) {
    navigate('/', { replace: true })
    return null
  }

  return (
    <div className="shell">
      <div className="topbar">
        <button className="btn btn-quiet" onClick={() => navigate('/t')}>
          ← {t('topics', locale)}
        </button>
        <span className="eyebrow eyebrow-muted">{t('settings', locale)}</span>
      </div>

      <div className="card">
        <span className="eyebrow">{t('language', locale)}</span>
        <div className="segmented">
          {(['bm', 'en'] as const).map((option: Locale) => (
            <button
              key={option}
              className={`segment ${profile.locale === option ? 'segment-active' : ''}`}
              onClick={() => void saveProfile({ ...profile, locale: option })}
            >
              {option === 'bm' ? 'Bahasa Malaysia' : 'English'}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <span className="eyebrow">{t('inputMode', locale)}</span>
        <div className="segmented" style={{ flexWrap: 'wrap' }}>
          {INPUT_MODES.map(({ mode, key }) => (
            <button
              key={mode}
              className={`segment ${profile.inputMode === mode ? 'segment-active' : ''}`}
              onClick={() => void saveProfile({ ...profile, inputMode: mode })}
            >
              {t(key, locale)}
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn btn-outline"
        onClick={() => {
          selectProfile(null)
          navigate('/')
        }}
      >
        {t('switchProfile', locale)}
      </button>
    </div>
  )
}
