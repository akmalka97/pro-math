import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getProgress,
  listProfiles,
  updateProfile as persistProfile,
  type Profile,
} from '../../core/progress/store'
import type { Locale } from '../../core/types'

type AppStateValue = {
  ready: boolean
  profiles: Profile[]
  profile: Profile | null
  locale: Locale
  /** topicId -> current level, for the selected profile. */
  progress: Record<string, number>
  selectProfile(profile: Profile | null): void
  refreshProfiles(): Promise<void>
  refreshProgress(): Promise<void>
  saveProfile(profile: Profile): Promise<void>
}

const AppStateContext = createContext<AppStateValue | null>(null)

const LAST_PROFILE_KEY = 'pro-math:last-profile'

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [progress, setProgress] = useState<Record<string, number>>({})

  const refreshProfiles = useCallback(async () => {
    setProfiles(await listProfiles())
  }, [])

  const refreshProgress = useCallback(async () => {
    setProgress(profile ? await getProgress(profile.id) : {})
  }, [profile])

  useEffect(() => {
    void (async () => {
      const all = await listProfiles()
      setProfiles(all)
      const remembered = all.find((candidate) => candidate.id === localStorage.getItem(LAST_PROFILE_KEY))
      if (remembered) setProfile(remembered)
      setReady(true)
    })()
  }, [])

  useEffect(() => {
    void refreshProgress()
  }, [refreshProgress])

  const selectProfile = useCallback((next: Profile | null) => {
    setProfile(next)
    if (next) localStorage.setItem(LAST_PROFILE_KEY, next.id)
    else localStorage.removeItem(LAST_PROFILE_KEY)
  }, [])

  const saveProfile = useCallback(async (next: Profile) => {
    await persistProfile(next)
    setProfile(next)
    setProfiles((current) => current.map((item) => (item.id === next.id ? next : item)))
  }, [])

  const value = useMemo<AppStateValue>(
    () => ({
      ready,
      profiles,
      profile,
      locale: profile?.locale ?? 'bm',
      progress,
      selectProfile,
      refreshProfiles,
      refreshProgress,
      saveProfile,
    }),
    [ready, profiles, profile, progress, selectProfile, refreshProfiles, refreshProgress, saveProfile],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext)
  if (!value) throw new Error('useAppState must be used inside AppStateProvider')
  return value
}
