import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { check } from '../../core/checker/equivalent'
import { topicById } from '../../core/generators/registry'
import { CONCEPT_LEVELS } from '../../core/generators/types'
import {
  QUESTIONS_PER_SET,
  STRUGGLE_MARK,
  outcomeFor,
  nextLevel,
  startSession,
  submit,
  type SessionState,
} from '../../core/progress/session'
import { previousSetWasStruggle, recordAttempts, recordSet, setLevel } from '../../core/progress/store'
import type { Verdict } from '../../core/types'
import { t } from '../../i18n/strings'
import { useAppState } from '../app/AppState'
import { AnswerInput } from '../input/AnswerInput'
import { MathText } from '../render/MathText'

export function Practice() {
  const { topicId, level: levelParam } = useParams()
  const { profile, locale, refreshProgress } = useAppState()
  const navigate = useNavigate()

  const topic = topicId ? topicById(topicId) : undefined
  const level = Math.max(1, Number(levelParam) || 1)

  // One seed per set makes the whole set reproducible from a single number.
  const setSeed = useMemo(() => Math.floor(Math.random() * 0xffffffff), [topicId, levelParam])
  const startedAt = useRef(new Date().toISOString())
  const questionShownAt = useRef(Date.now())

  const [session, setSession] = useState<SessionState | null>(null)
  const [answer, setAnswer] = useState('')
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [hintsShown, setHintsShown] = useState(0)
  const [scratch, setScratch] = useState('')
  const [showSteps, setShowSteps] = useState(false)

  useEffect(() => {
    if (!topic) return
    setSession(startSession(topic, level, setSeed))
    startedAt.current = new Date().toISOString()
    questionShownAt.current = Date.now()
  }, [topic, level, setSeed])

  const finish = useCallback(
    async (finished: SessionState) => {
      if (!profile || !topic) return
      const struggled = await previousSetWasStruggle(profile.id, topic.id, level, STRUGGLE_MARK)
      const outcome = outcomeFor(finished.correct, struggled)
      const target = nextLevel(level, outcome)

      await recordSet({
        profileId: profile.id,
        topicId: topic.id,
        level,
        correct: finished.correct,
        passed: outcome === 'advance',
        startedAt: startedAt.current,
        finishedAt: new Date().toISOString(),
      })
      await recordAttempts(
        finished.answers.map((entry) => ({
          profileId: profile.id,
          topicId: topic.id,
          level,
          seed: entry.seed,
          studentAnswer: entry.studentAnswer,
          verdict: entry.verdict,
          durationMs: entry.durationMs,
          at: new Date().toISOString(),
        })),
      )
      await setLevel(profile.id, topic.id, target)
      await refreshProgress()

      navigate(`/t/${topic.id}/${level}/done`, {
        replace: true,
        state: { correct: finished.correct, outcome, target },
      })
    },
    [profile, topic, level, navigate, refreshProgress],
  )

  if (!topic || !profile) {
    navigate('/t', { replace: true })
    return null
  }

  if (!session) return null

  const question = session.current.question

  function onSubmit() {
    if (!session || verdict === 'correct' || verdict === 'incorrect') return
    const result = check(answer, question.answer, question.answerKind, profile!.inputMode)
    setVerdict(result)
    if (result === 'unreadable') return
    setShowSteps(result === 'incorrect')
  }

  function onNext() {
    if (!session || !verdict || verdict === 'unreadable') return
    const advanced = submit(
      session,
      topic!,
      setSeed,
      answer,
      verdict,
      Date.now() - questionShownAt.current,
    )
    setSession(advanced)
    setAnswer('')
    setVerdict(null)
    setHintsShown(0)
    setScratch('')
    setShowSteps(false)
    questionShownAt.current = Date.now()
    if (advanced.finished) void finish(advanced)
  }

  function retryUnreadable() {
    if (!session) return
    setVerdict(null)
  }

  const answered = session.answers.length
  const settled = verdict === 'correct' || verdict === 'incorrect'

  return (
    <div className="shell">
      <div className="topbar">
        <button className="btn btn-quiet" onClick={() => navigate(`/t/${topic.id}`)}>
          ← {topic.name[locale]}
        </button>
        <span className="eyebrow eyebrow-muted">
          {t('level', locale)} {level}
          {level > CONCEPT_LEVELS ? ` · ${t('scaled', locale)}` : ''}
        </span>
      </div>

      <div className="pips">
        {Array.from({ length: QUESTIONS_PER_SET }, (_, index) => {
          const entry = session.answers[index]
          const state = entry ? (entry.verdict === 'correct' ? 'pip-correct' : 'pip-incorrect') : ''
          return <span key={index} className={`pip ${state}`} />
        })}
      </div>

      <div className="card">
        <div className="row-between">
          <span className="eyebrow">
            {t('question', locale)} {Math.min(answered + 1, QUESTIONS_PER_SET)} / {QUESTIONS_PER_SET}
          </span>
          <span className="eyebrow eyebrow-muted">{topic.levels[Math.min(level, CONCEPT_LEVELS) - 1].concept[locale]}</span>
        </div>

        <strong style={{ fontSize: 15, letterSpacing: '-0.2px' }}>{question.instruction[locale]}</strong>

        <div className="formula">
          <MathText latex={question.prompt[locale]} />
        </div>
      </div>

      <AnswerInput
        mode={profile.inputMode}
        answerKind={question.answerKind}
        value={answer}
        locale={locale}
        disabled={settled}
        onChange={setAnswer}
        onSubmit={onSubmit}
      />

      {verdict === 'unreadable' && (
        <div className="verdict verdict-unreadable" onClick={retryUnreadable}>
          <strong>?</strong>
          <span>{t('unreadable', locale)}</span>
        </div>
      )}

      {settled && (
        <div className={`verdict ${verdict === 'correct' ? 'verdict-correct' : 'verdict-incorrect'}`}>
          <strong>{verdict === 'correct' ? t('correct', locale) : t('incorrect', locale)}</strong>
        </div>
      )}

      {!settled && (
        <div className="card card-flat">
          <div className="row-between">
            <span className="eyebrow eyebrow-muted">{t('hints', locale)}</span>
            {hintsShown < question.hints.length ? (
              <button className="btn btn-outline btn-sm" onClick={() => setHintsShown(hintsShown + 1)}>
                {t('revealHint', locale)} ({hintsShown + 1}/{question.hints.length})
              </button>
            ) : (
              <span className="muted">{t('allHintsShown', locale)}</span>
            )}
          </div>
          {question.hints.slice(0, hintsShown).map((hint, index) => (
            <div key={index} className="hint">
              {hint[locale]}
            </div>
          ))}
        </div>
      )}

      {!settled && (
        <div className="card card-flat">
          <span className="eyebrow eyebrow-muted">{t('scratchpad', locale)}</span>
          <textarea
            className="field"
            style={{ minHeight: 76, fontSize: 15 }}
            value={scratch}
            placeholder={t('scratchpadPlaceholder', locale)}
            onChange={(event) => setScratch(event.target.value)}
          />
        </div>
      )}

      {showSteps && (
        <div className="card">
          <span className="eyebrow">{t('workedSolution', locale)}</span>
          <div className="steps">
            {question.steps.map((step, index) => (
              <MathText key={index} latex={step[locale]} className="formula-sm" />
            ))}
          </div>
        </div>
      )}

      {settled ? (
        <button className="btn" onClick={onNext}>
          {answered + 1 >= QUESTIONS_PER_SET ? t('finishSet', locale) : t('next', locale)}
        </button>
      ) : (
        <button className="btn" onClick={onSubmit} disabled={!answer.trim()}>
          {t('submit', locale)}
        </button>
      )}
    </div>
  )
}
