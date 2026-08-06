import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { InputMode, Locale, Verdict } from '../types'

export type Profile = {
  /** uuid — becomes the server primary key unchanged when accounts arrive. */
  id: string
  name: string
  avatar: string
  locale: Locale
  inputMode: InputMode
  createdAt: string
  syncedAt: string | null
}

export type SetResult = {
  id: string
  profileId: string
  topicId: string
  level: number
  correct: number
  passed: boolean
  startedAt: string
  finishedAt: string
  syncedAt: string | null
}

export type TopicProgress = {
  /** `${profileId}:${topicId}` */
  key: string
  profileId: string
  topicId: string
  level: number
  syncedAt: string | null
}

export type Attempt = {
  id: string
  profileId: string
  topicId: string
  level: number
  /** Regenerates the exact question the student saw. */
  seed: number
  studentAnswer: string
  verdict: Verdict
  durationMs: number
  at: string
  syncedAt: string | null
}

interface ProMathDB extends DBSchema {
  profiles: { key: string; value: Profile }
  progress: { key: string; value: TopicProgress; indexes: { byProfile: string } }
  sets: { key: string; value: SetResult; indexes: { byProfile: string } }
  attempts: { key: string; value: Attempt; indexes: { byProfile: string } }
}

let database: Promise<IDBPDatabase<ProMathDB>> | null = null

function db(): Promise<IDBPDatabase<ProMathDB>> {
  // localStorage is not an option here: the attempt log outgrows its 5 MB limit
  // and fails silently when it does.
  database ??= openDB<ProMathDB>('pro-math', 1, {
    upgrade(instance) {
      instance.createObjectStore('profiles', { keyPath: 'id' })
      const progress = instance.createObjectStore('progress', { keyPath: 'key' })
      progress.createIndex('byProfile', 'profileId')
      const sets = instance.createObjectStore('sets', { keyPath: 'id' })
      sets.createIndex('byProfile', 'profileId')
      const attempts = instance.createObjectStore('attempts', { keyPath: 'id' })
      attempts.createIndex('byProfile', 'profileId')
    },
  })
  return database
}

function uuid(): string {
  return crypto.randomUUID()
}

export async function listProfiles(): Promise<Profile[]> {
  const all = await (await db()).getAll('profiles')
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function createProfile(name: string, avatar: string, locale: Locale): Promise<Profile> {
  const profile: Profile = {
    id: uuid(),
    name,
    avatar,
    locale,
    inputMode: 'expression',
    createdAt: new Date().toISOString(),
    syncedAt: null,
  }
  await (await db()).put('profiles', profile)
  return profile
}

export async function updateProfile(profile: Profile): Promise<void> {
  await (await db()).put('profiles', profile)
}

export async function deleteProfile(profileId: string): Promise<void> {
  const instance = await db()
  await instance.delete('profiles', profileId)
  for (const store of ['progress', 'sets', 'attempts'] as const) {
    const keys = await instance.getAllKeysFromIndex(store, 'byProfile', profileId)
    await Promise.all(keys.map((key) => instance.delete(store, key)))
  }
}

export async function getProgress(profileId: string): Promise<Record<string, number>> {
  const rows = await (await db()).getAllFromIndex('progress', 'byProfile', profileId)
  return Object.fromEntries(rows.map((row) => [row.topicId, row.level]))
}

export async function setLevel(profileId: string, topicId: string, level: number): Promise<void> {
  await (await db()).put('progress', {
    key: `${profileId}:${topicId}`,
    profileId,
    topicId,
    level,
    syncedAt: null,
  })
}

export async function recordSet(result: Omit<SetResult, 'id' | 'syncedAt'>): Promise<void> {
  await (await db()).put('sets', { ...result, id: uuid(), syncedAt: null })
}

export async function recordAttempts(attempts: Array<Omit<Attempt, 'id' | 'syncedAt'>>): Promise<void> {
  const instance = await db()
  const transaction = instance.transaction('attempts', 'readwrite')
  await Promise.all(attempts.map((attempt) => transaction.store.put({ ...attempt, id: uuid(), syncedAt: null })))
  await transaction.done
}

export async function listSets(profileId: string): Promise<SetResult[]> {
  const rows = await (await db()).getAllFromIndex('sets', 'byProfile', profileId)
  return rows.sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))
}

export async function listAttempts(profileId: string): Promise<Attempt[]> {
  const rows = await (await db()).getAllFromIndex('attempts', 'byProfile', profileId)
  return rows.sort((a, b) => b.at.localeCompare(a.at))
}

/** True when the previous set at this level was a struggle, for the drop rule. */
export async function previousSetWasStruggle(
  profileId: string,
  topicId: string,
  level: number,
  struggleMark: number,
): Promise<boolean> {
  const sets = await listSets(profileId)
  const atLevel = sets.filter((set) => set.topicId === topicId && set.level === level)
  return atLevel.length > 0 && atLevel[0].correct <= struggleMark
}
