import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { topicById } from '../../core/generators/registry'
import { PASS_MARK, QUESTIONS_PER_SET, type SetOutcome } from '../../core/progress/session'
import { t } from '../../i18n/strings'
import { useAppState } from '../app/AppState'

type ResultState = {
  correct: number
  outcome: SetOutcome
  target: number
}

export function SetResult() {
  const { topicId } = useParams()
  const { locale } = useAppState()
  const navigate = useNavigate()
  const state = useLocation().state as ResultState | null
  const topic = topicId ? topicById(topicId) : undefined

  if (!topic || !state) return <Navigate to="/t" replace />

  const passed = state.correct >= PASS_MARK
  const message =
    state.outcome === 'advance'
      ? t('advanceMessage', locale)
      : state.outcome === 'drop'
        ? t('dropMessage', locale)
        : t('repeatMessage', locale)

  return (
    <div className="shell">
      <header className="hero">
        <h1>{t('setComplete', locale)}</h1>
        <p>{topic.name[locale]}</p>
      </header>

      <div className={`card ${passed ? '' : ''}`} style={{ alignItems: 'center', textAlign: 'center' }}>
        <span className="eyebrow">{passed ? t('passed', locale) : t('notPassed', locale)}</span>
        <p className="score" style={{ color: passed ? 'var(--success)' : 'var(--error)' }}>
          {state.correct}/{QUESTIONS_PER_SET}
        </p>
        <p className="muted">{message}</p>
        <p className="muted">
          {t('level', locale)} {state.target}
        </p>
      </div>

      <button className="btn" onClick={() => navigate(`/t/${topic.id}/${state.target}`, { replace: true })}>
        {t('againSameLevel', locale)}
      </button>
      <button className="btn btn-outline" onClick={() => navigate('/t')}>
        {t('backToTopics', locale)}
      </button>
    </div>
  )
}
