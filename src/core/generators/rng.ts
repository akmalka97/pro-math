/**
 * Deterministic random source. Every question is identified by (levelId, seed),
 * so a question can be regenerated exactly — for tests, for "try this one
 * again", and for inspecting months later what a student actually got wrong.
 */
export type Rng = {
  int(min: number, max: number): number
  pick<T>(items: readonly T[]): T
  /** Non-zero integer in the range, useful for coefficients. */
  nonZero(min: number, max: number): number
  sign(): 1 | -1
  chance(probability: number): boolean
}

/** mulberry32 — small, fast, and stable across engines. */
export function createRng(seed: number): Rng {
  let state = (seed >>> 0) || 0x2f6e2b1

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const int = (min: number, max: number): number => min + Math.floor(next() * (max - min + 1))

  return {
    int,
    pick: (items) => items[int(0, items.length - 1)],
    nonZero: (min, max) => {
      for (;;) {
        const value = int(min, max)
        if (value !== 0) return value
      }
    },
    sign: () => (next() < 0.5 ? -1 : 1),
    chance: (probability) => next() < probability,
  }
}
