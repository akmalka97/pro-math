import type { Generated } from '../generators/types'
import { resolveLevel } from '../generators/types'
import type { Topic } from '../generators/types'
import { createRng } from '../generators/rng'
import type { Verdict } from '../types'

export const QUESTIONS_PER_SET = 10
export const PASS_MARK = 8
/** Two consecutive sets at or below this score drop the student a level. */
export const STRUGGLE_MARK = 4

export type SessionQuestion = {
  seed: number
  question: Generated
}

export type SessionAnswer = {
  seed: number
  studentAnswer: string
  verdict: Verdict
  durationMs: number
}

export type SessionState = {
  topicId: string
  level: number
  /** Scored answers so far; unreadable submissions are not included. */
  answers: SessionAnswer[]
  correct: number
  current: SessionQuestion
  /** Incremented for every question shown, including replaced ones. */
  ordinal: number
  finished: boolean
}

/**
 * Derives a per-question seed from the set seed and the question ordinal, so a
 * whole set is reproducible from one number.
 */
function seedFor(setSeed: number, ordinal: number): number {
  return (Math.imul(setSeed ^ 0x9e3779b9, 0x85ebca6b) + ordinal * 0x27d4eb2f) >>> 0
}

function generate(topic: Topic, level: number, setSeed: number, ordinal: number): SessionQuestion {
  const resolved = resolveLevel(topic, level)
  const seed = seedFor(setSeed, ordinal)
  return { seed, question: resolved.level.generate(createRng(seed), resolved.scale) }
}

export function startSession(topic: Topic, level: number, setSeed: number): SessionState {
  return {
    topicId: topic.id,
    level,
    answers: [],
    correct: 0,
    ordinal: 0,
    current: generate(topic, level, setSeed, 0),
    finished: false,
  }
}

/**
 * Records one submission. An unreadable answer replaces the question without
 * scoring it — a student who mistyped has not answered wrongly, and a set is
 * always ten scored answers.
 */
export function submit(
  state: SessionState,
  topic: Topic,
  setSeed: number,
  studentAnswer: string,
  verdict: Verdict,
  durationMs: number,
): SessionState {
  if (verdict === 'unreadable') {
    const ordinal = state.ordinal + 1
    return { ...state, ordinal, current: generate(topic, state.level, setSeed, ordinal) }
  }

  const answers = [
    ...state.answers,
    { seed: state.current.seed, studentAnswer, verdict, durationMs },
  ]
  const correct = state.correct + (verdict === 'correct' ? 1 : 0)
  const finished = answers.length >= QUESTIONS_PER_SET
  const ordinal = state.ordinal + 1

  return {
    ...state,
    answers,
    correct,
    finished,
    ordinal,
    current: finished ? state.current : generate(topic, state.level, setSeed, ordinal),
  }
}

export type SetOutcome = 'advance' | 'repeat' | 'drop'

/**
 * `previousWasStruggle` refers to the set immediately before this one at the
 * same level; a single bad set repeats, two in a row drop a level.
 */
export function outcomeFor(correct: number, previousWasStruggle: boolean): SetOutcome {
  if (correct >= PASS_MARK) return 'advance'
  if (correct <= STRUGGLE_MARK && previousWasStruggle) return 'drop'
  return 'repeat'
}

export function nextLevel(level: number, outcome: SetOutcome): number {
  if (outcome === 'advance') return level + 1
  if (outcome === 'drop') return Math.max(1, level - 1)
  return level
}
