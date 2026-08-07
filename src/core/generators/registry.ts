import { algebraicExpressions } from './algebraic-expressions'
import { factorsMultiples } from './factors-multiples'
import { linearEquations } from './linear-equations'
import { linearInequalities } from './linear-inequalities'
import { pythagoras } from './pythagoras'
import { ratioRateProportion } from './ratio-rate-proportion'
import { rationalNumbers } from './rational-numbers'
import { squaresCubesRoots } from './squares-cubes-roots'
import type { Topic } from './types'

/**
 * Ordered as a student would meet them: Linear Equations first because it has
 * the cleanest ladder and everything downstream depends on it. This is
 * deliberately not KSSM chapter order — see each topic's `chapter` field for
 * the number printed in the workbook.
 */
export const ALL_TOPICS: Topic[] = [
  linearEquations,
  algebraicExpressions,
  rationalNumbers,
  factorsMultiples,
  squaresCubesRoots,
  ratioRateProportion,
  linearInequalities,
  pythagoras,
]

export function topicById(id: string): Topic | undefined {
  return ALL_TOPICS.find((topic) => topic.id === id)
}
