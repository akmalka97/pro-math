import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProfile, deleteProfile } from '../../core/progress/store'
import type { Locale } from '../../core/types'
import { t } from '../../i18n/strings'
import { useAppState } from '../app/AppState'

const AVATARS = ['🦊', '🐼', '🦉', '🐙', '🐝', '🦖', '🐢', '🦁']

export function ProfilePicker() {
  const { profiles, selectProfile, refreshProfiles, locale } = useAppState()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [newLocale, setNewLocale] = useState<Locale>('bm')

  async function create() {
    if (!name.trim()) return
    const profile = await createProfile(name.trim(), avatar, newLocale)
    await refreshProfiles()
    selectProfile(profile)
    navigate('/t')
  }

  async function remove(id: string) {
    if (!confirm(t('deleteConfirm', locale))) return
    await deleteProfile(id)
    await refreshProfiles()
  }

  return (
    <div className="shell">
      <header className="hero">
        <h1>{t('appName', locale)}</h1>
        <p>{t('tagline', locale)}</p>
      </header>

      <p className="eyebrow">{t('whoIsPractising', locale)}</p>

      <div className="avatars">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            className="avatar-tile"
            onClick={() => {
              selectProfile(profile)
              navigate('/t')
            }}
            onContextMenu={(event) => {
              event.preventDefault()
              void remove(profile.id)
            }}
          >
            <span className="avatar-face">{profile.avatar}</span>
            <strong>{profile.name}</strong>
            <span className="muted">{profile.locale === 'bm' ? 'Bahasa Malaysia' : 'English'}</span>
          </button>
        ))}

        {!adding && (
          <button className="avatar-tile" onClick={() => setAdding(true)}>
            <span className="avatar-face">＋</span>
            <strong>{t('addProfile', locale)}</strong>
          </button>
        )}
      </div>

      {adding && (
        <div className="card">
          <p className="eyebrow">{t('addProfile', locale)}</p>
          <input
            className="field"
            value={name}
            placeholder={t('profileName', locale)}
            onChange={(event) => setName(event.target.value)}
          />
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {AVATARS.map((option) => (
              <button
                key={option}
                className="key"
                style={{
                  fontSize: 22,
                  width: 48,
                  borderColor: option === avatar ? 'var(--indigo)' : 'var(--indigo-line)',
                }}
                onClick={() => setAvatar(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="segmented">
            {(['bm', 'en'] as const).map((option) => (
              <button
                key={option}
                className={`segment ${newLocale === option ? 'segment-active' : ''}`}
                onClick={() => setNewLocale(option)}
              >
                {option === 'bm' ? 'Bahasa Malaysia' : 'English'}
              </button>
            ))}
          </div>
          <div className="row">
            <button className="btn grow" onClick={() => void create()} disabled={!name.trim()}>
              {t('create', locale)}
            </button>
            <button className="btn btn-quiet" onClick={() => setAdding(false)}>
              {t('cancel', locale)}
            </button>
          </div>
        </div>
      )}

      {profiles.length > 0 && (
        <p className="muted">
          {locale === 'bm'
            ? 'Tekan lama pada profil untuk memadamnya.'
            : 'Long-press a profile to delete it.'}
        </p>
      )}
    </div>
  )
}
