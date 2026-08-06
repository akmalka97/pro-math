import { algebraicExpressions } from './algebraic-expressions'
import { factorsMultiples } from './factors-multiples'
import { linearEquations } from './linear-equations'
import { ratioRateProportion } from './ratio-rate-proportion'
import { rationalNumbers } from './rational-numbers'
import { squaresCubesRoots } from './squares-cubes-roots'
import type { Topic } from './types'

/** Ordered as a student would meet them, not by KSSM chapter number. */
export const ALL_TOPICS: Topic[] = [
  linearEquations,
  algebraicExpressions,
  rationalNumbers,
  factorsMultiples,
  squaresCubesRoots,
  ratioRateProportion,
]

export function topicById(id: string): Topic | undefined {
  return ALL_TOPICS.find((topic) => topic.id === id)
}
