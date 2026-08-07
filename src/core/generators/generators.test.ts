import { describe, expect, it } from 'vitest'
import { check } from '../checker/equivalent'
import type { AnswerKind } from '../types'
import { ALL_TOPICS } from './registry'
import { createRng } from './rng'
import { CONCEPT_LEVELS } from './types'

const SEEDS_PER_LEVEL = 1000

/** Produces a deliberately wrong answer that no tolerance band could absorb. */
function perturb(answer: string, kind: AnswerKind): string {
  switch (kind) {
    case 'set': {
      const members = answer.split(',')
      return members.length > 1 ? members.slice(1).join(',') : `${answer},999`
    }
    case 'ratio': {
      const terms = answer.split(':').map((term) => term.trim())
      terms[terms.length - 1] = `${Number(terms[terms.length - 1]) + 1}`
      return terms.join(':')
    }
    case 'inequality': {
      // Shifting a bound is the perturbation a student would actually make;
      // adding 1 to the whole statement is meaningless.
      return answer.replace(/(-?\d+(?:\.\d+)?)\s*$/, (bound) => `${Number(bound) + 1}`)
    }
    case 'expression':
      return `(${answer}) + 1`
    default:
      return `(${answer}) + 1`
  }
}

describe.each(ALL_TOPICS)('$id', (topic) => {
  for (let number = 1; number <= CONCEPT_LEVELS; number++) {
    const level = topic.levels[number - 1]

    it(`L${number} declares answers that verify against the checker`, () => {
      for (let seed = 0; seed < SEEDS_PER_LEVEL; seed++) {
        const question = level.generate(createRng(seed), 0)

        const selfCheck = check(question.answer, question.answer, question.answerKind)
        expect(selfCheck, `${level.id} seed ${seed} answer ${question.answer}`).toBe('correct')

        const wrong = check(perturb(question.answer, question.answerKind), question.answer, question.answerKind)
        expect(wrong, `${level.id} seed ${seed} accepted a wrong answer`).toBe('incorrect')
      }
    })

    it(`L${number} produces well-formed questions`, () => {
      for (let seed = 0; seed < 200; seed++) {
        const question = level.generate(createRng(seed), 0)
        expect(question.prompt.bm.length, `${level.id} seed ${seed}`).toBeGreaterThan(0)
        expect(question.prompt.en.length, `${level.id} seed ${seed}`).toBeGreaterThan(0)
        expect(question.steps.length, `${level.id} seed ${seed}`).toBeGreaterThan(0)
        expect(question.hints.length, `${level.id} seed ${seed}`).toBeGreaterThan(0)
        expect(question.answer.trim(), `${level.id} seed ${seed}`).not.toBe('')
        expect(question.answer, `${level.id} seed ${seed} has a NaN answer`).not.toMatch(/NaN|Infinity|undefined/)
        expect(question.prompt.bm, `${level.id} seed ${seed} has a NaN prompt`).not.toMatch(/NaN|Infinity|undefined/)
      }
    })

    it(`L${number} still verifies when scaled above level 9`, () => {
      for (let scale = 1; scale <= 3; scale++) {
        for (let seed = 0; seed < 100; seed++) {
          const question = level.generate(createRng(seed * 31 + scale), scale)
          expect(
            check(question.answer, question.answer, question.answerKind),
            `${level.id} scale ${scale} seed ${seed} answer ${question.answer}`,
          ).toBe('correct')
          expect(question.answer, `${level.id} scale ${scale} seed ${seed}`).not.toMatch(/NaN|Infinity|undefined/)
        }
      }
    })
  }
})
