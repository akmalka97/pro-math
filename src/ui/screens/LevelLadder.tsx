import { useNavigate, useParams } from 'react-router-dom'
import { topicById } from '../../core/generators/registry'
import { CONCEPT_LEVELS } from '../../core/generators/types'
import { t } from '../../i18n/strings'
import { useAppState } from '../app/AppState'

export function LevelLadder() {
  const { topicId } = useParams()
  const { locale, progress } = useAppState()
  const navigate = useNavigate()
  const topic = topicId ? topicById(topicId) : undefined

  if (!topic) {
    navigate('/t', { replace: true })
    return null
  }

  const current = progress[topic.id] ?? 1

  return (
    <div className="shell">
      <div className="topbar">
        <button className="btn btn-quiet" onClick={() => navigate('/t')}>
          ← {t('topics', locale)}
        </button>
        <span className="eyebrow eyebrow-muted">
          {t('chapter', locale)} {topic.chapter}
        </span>
      </div>

      <header className="hero">
        <h1>{topic.name[locale]}</h1>
        <p>
          {t('level', locale)} {current}
        </p>
      </header>

      <div className="ladder">
        {topic.levels.map((level) => {
          const locked = level.number > current
          const done = level.number < current
          return (
            <button
              key={level.id}
              className={`rung ${level.number === current ? 'rung-current' : ''} ${done ? 'rung-done' : ''}`}
              disabled={locked}
              onClick={() => navigate(`/t/${topic.id}/${level.number}`)}
            >
              <span className="rung-number">{done ? '✓' : level.number}</span>
              <span className="grow">
                <strong style={{ display: 'block', fontSize: 14 }}>{level.concept[locale]}</strong>
                <span className="muted">
                  {locked ? t('locked', locale) : `${t('level', locale)} ${level.number}`}
                </span>
              </span>
            </button>
          )
        })}

        {current > CONCEPT_LEVELS && (
          <button
            className="rung rung-current"
            onClick={() => navigate(`/t/${topic.id}/${current}`)}
          >
            <span className="rung-number">{current}</span>
            <span className="grow">
              <strong style={{ display: 'block', fontSize: 14 }}>{t('scaled', locale)}</strong>
              <span className="muted">{t('scaledNote', locale)}</span>
            </span>
          </button>
        )}
      </div>

      <button className="btn" onClick={() => navigate(`/t/${topic.id}/${current}`)}>
        {t('startSet', locale)}
      </button>

      {current > CONCEPT_LEVELS && <p className="muted">{t('scaledNote', locale)}</p>}
    </div>
  )
}
