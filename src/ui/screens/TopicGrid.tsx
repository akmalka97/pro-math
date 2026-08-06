import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ALL_TOPICS } from '../../core/generators/registry'
import { CONCEPT_LEVELS } from '../../core/generators/types'
import { t } from '../../i18n/strings'
import { useAppState } from '../app/AppState'

export function TopicGrid() {
  const { profile, locale, progress } = useAppState()
  const navigate = useNavigate()

  if (!profile) return <Navigate to="/" replace />

  return (
    <div className="shell">
      <div className="topbar">
        <div className="row">
          <span className="avatar-face" style={{ width: 40, height: 40, fontSize: 20, borderRadius: 12 }}>
            {profile.avatar}
          </span>
          <strong>{profile.name}</strong>
        </div>
        <Link className="btn btn-quiet" to="/settings">
          {t('settings', locale)}
        </Link>
      </div>

      <p className="eyebrow">{t('topics', locale)}</p>

      <div className="tiles">
        {ALL_TOPICS.map((topic) => {
          const level = progress[topic.id] ?? 1
          return (
            <button key={topic.id} className="tile" onClick={() => navigate(`/t/${topic.id}`)}>
              <span className="eyebrow eyebrow-muted">
                {t('chapter', locale)} {topic.chapter}
              </span>
              <h3>{topic.name[locale]}</h3>
              <span>
                {t('level', locale)} {level}
                {level > CONCEPT_LEVELS ? ` · ${t('scaled', locale)}` : ` / ${CONCEPT_LEVELS}`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
