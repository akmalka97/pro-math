# Pro Math — Design Specification

**Date:** 2026-08-07
**Status:** Approved design, ready for implementation planning
**Owner:** Akmal
**Scope of this document:** v1 PWA, KSSM Form 1, algebra and number topics only

---

## 1. What this is

A maths practice PWA for Malaysian Form 1 students that **generates** questions
rather than storing them. Every question is constructed backwards from a known
answer, so correctness is structural rather than checked after the fact.

Consequences of generating rather than storing:

- Unlimited unique questions per topic
- Answers are correct by construction
- No question bank to author or maintain
- Students cannot memorise their way through

Content follows the KSSM syllabus and is aligned to the existing printed
workbook product, which doubles as the distribution channel.

---

## 2. Core principle: generate backwards, never forwards

Do not use an LLM to produce the mathematics. An LLM asked to write
"solve 3x + 7 = 22" will occasionally produce a question with no clean answer,
or state the wrong answer. For a maths app that failure is fatal: a student told
they are wrong when they are right stops trusting the app immediately, and the
failure is invisible to the operator.

Construct from the solution instead:

```
pick x   in range (-10..10)
pick a   in range (2..9),  a != 0
pick c   in range (-9..9)
compute  b = a*x + c
render:  "{a}x + {c} = {b}"
answer:  x
```

The answer exists before the question does.

An LLM is acceptable for prose only — hint text, encouragement copy, dressing a
template as a word problem. Never for the numbers, and never for the worked
solution steps.

---

## 3. Decisions taken

These were open questions before this design. Each is now closed.

| # | Decision | Resolution |
|---|----------|------------|
| 1 | v1 scope and profiles | Local-only, no backend, but profile-shaped from day one |
| 2 | Language | Bilingual Bahasa Malaysia and English, user-toggleable, BM default |
| 3 | Answer simplification policy | Any exactly equivalent form is correct; no per-topic strictness about simplification |
| 4 | Decimal tolerance | 3 significant figures, but only for non-terminating answers |
| 5 | Input method | All three modes ship in v1: numeric, expression, MathLive |
| 6 | Topic coverage | All six algebra and number topics |
| 7 | Level progression | Fixed set of 10 questions, pass at 8 |
| 8 | Difficulty ceiling | 9 concept levels, then unbounded parameter scaling above |
| 9 | Payment model and tenancy schema | Deliberately deferred; not blocking while storage is local |

### Rationale for the non-obvious ones

**Local-only but profile-shaped.** Every stored record carries a `profileId`
from the first line of code, and a profile picker exists locally. This costs
almost nothing now and means the eventual move to server accounts is an insert
of existing rows rather than a schema rewrite.

**Tolerance band restricted to non-terminating answers.** A 3-significant-figure
band applied to all answers would accept `1198` for a correct answer of `1200`,
which is the exact trust-destroying failure the whole design is built to avoid.
Restricting the band to answers that cannot be written exactly preserves the
intent (`0.333` should pass for `1/3`) without the defect.

**Payment model deferred.** Tenancy shape follows the payment model — household
subscription, school licence, or free-with-workbook produce different schemas.
Deciding now would be guessing. It becomes blocking on the day the first server
table is written, and not before.

---

## 4. Topic coverage

In v1:

| Topic | Answer kinds produced |
|-------|-----------------------|
| Linear Equations | integer, rational |
| Algebraic Expressions | expression |
| Rational Numbers | rational |
| Factors & Multiples | integer, set, expression |
| Squares, Cubes & Roots | integer, rational |
| Ratio, Rate & Proportion | ratio, rational |

Explicitly out of v1: Linear Inequalities, Lines & Angles, Basic Polygons,
Perimeter & Area, Introduction to Set, Data Handling. All six require a
rendering stack this build does not have — number lines, geometry, Venn
diagrams, charts. Geometry is a separate build.

---

## 5. Difficulty ladders

Each topic has nine levels. Each level introduces exactly one new concept.
Larger numbers alone are not a new level — that is tedium, not difficulty.

### Linear Equations

| Level | Pattern | Concept |
|-------|---------|---------|
| 1 | `x + 5 = 12` | one step, addition |
| 2 | `3x = 15` | one step, multiplication |
| 3 | `2x + 3 = 11` | two step |
| 4 | `2x - 7 = 5` | negatives |
| 5 | `5 - 2x = 1` | negative coefficient |
| 6 | `3x + 2 = x + 10` | variable on both sides |
| 7 | `2(x + 3) = 14` | brackets |
| 8 | `x/3 + 2 = 5` | fractions |
| 9 | `(2x + 1)/3 = 5` | fraction over an expression |

### Algebraic Expressions

| Level | Example | Concept |
|-------|---------|---------|
| 1 | `3x` when `x = 4` | substitution, one term |
| 2 | `2x + 5` when `x = 3` | substitution, two terms |
| 3 | `3x + 5x` | collecting like terms |
| 4 | `7x - 2x` | subtraction of like terms |
| 5 | `3x + 2y + 4x` | two variables |
| 6 | `3x + 4 + 2x - 1` | terms and constants |
| 7 | `2x * 3y` | multiplying terms |
| 8 | `2(3x + 4)` | expanding one bracket |
| 9 | `2(x + 3) + 3(x - 1)` | expand and simplify |

### Rational Numbers

| Level | Example | Concept |
|-------|---------|---------|
| 1 | `-4 + (-7)` | addition, same sign |
| 2 | `-9 + 5` | addition, mixed sign |
| 3 | `3 - (-8)` | subtracting a negative |
| 4 | `-6 * 7` | multiplying and dividing integers |
| 5 | `3/7 + 2/7` | common denominator |
| 6 | `1/3 + 1/4` | unlike denominators |
| 7 | `-2/5 + 1/3` | negative fractions |
| 8 | `3/4 / (2/5)` | multiplying and dividing fractions |
| 9 | `-1/2 + 3/4 * 2/3` | order of operations |

### Factors & Multiples

| Level | Example | Concept |
|-------|---------|---------|
| 1 | factors of `18` | listing factors |
| 2 | `6 * ? = 48` | missing factor |
| 3 | HCF of `8, 24` | one number divides the other |
| 4 | HCF of `36, 48` | general HCF |
| 5 | LCM of `4, 6` | small LCM |
| 6 | LCM of `12, 18` | general LCM |
| 7 | prime factorisation of `72` | answer given as `2^3 * 3^2` |
| 8 | HCF and LCM of `12, 18, 24` | three numbers |
| 9 | bells ringing every 12 and 18 minutes | LCM word problem |

### Squares, Cubes & Roots

| Level | Example | Concept |
|-------|---------|---------|
| 1 | `7^2` | squares |
| 2 | `sqrt(144)` | square roots |
| 3 | `4^3` | cubes |
| 4 | `cbrt(216)` | cube roots |
| 5 | `(-9)^2` | negative base |
| 6 | `sqrt(9/25)` | root of a fraction |
| 7 | `sqrt(81) + 3^3` | mixed operations |
| 8 | `sqrt(50)` to 3 s.f. | non-perfect root; the tolerance band applies here |
| 9 | `cbrt(64) * sqrt(49) - 5^2` | full order of operations |

### Ratio, Rate & Proportion

| Level | Example | Concept |
|-------|---------|---------|
| 1 | `12 : 18` | simplifying a ratio |
| 2 | `8 : 12 : 20` | three-part ratio |
| 3 | `3 : 5 = 12 : ?` | missing term |
| 4 | RM 120 in the ratio `2 : 3` | dividing a quantity |
| 5 | RM 180 in the ratio `1 : 2 : 3` | three parts |
| 6 | 240 km in 3 hours | unit rate |
| 7 | 5 books cost RM 40, cost of 8 | direct proportion |
| 8 | 72 km/h to m/s | rate conversion |
| 9 | `a:b = 2:3`, `b:c = 4:5`, find `a:c` | combined ratio |

### Above level 9

No new concept ever appears above level 9. Level 10 and beyond keep the level 9
pattern and widen the parameter space: larger coefficients, solutions permitted
to go negative or fractional, more terms, larger denominators. The generator
signature takes a `scale` integer that has no upper bound.

The mapping is explicit: levels 1 to 9 call their own generator with
`scale = 0`; level `n` for `n > 9` calls the level 9 generator with
`scale = n - 9`. There is no level 10 generator to write.

The interface must label this honestly — showing both the concept level and the
scale — so that no student believes they are learning new mathematics when they
are only doing harder arithmetic.

---

## 6. The answer checker

The checker is built and tested before any generator exists. It is the component
most likely to be wrong and everything else depends on it.

### Verdicts

```ts
type Verdict = 'correct' | 'incorrect' | 'unreadable'
```

Three verdicts, not two. A student who submits `2x+` has mistyped, not answered
incorrectly. An `unreadable` verdict never counts against the ten-question set;
the question is replaced and the set still requires ten scored answers.

### Answer kinds

```ts
type AnswerKind = 'integer' | 'rational' | 'expression' | 'set' | 'ratio'
```

`set` compares order-independently and ignores duplicates, for questions such as
"list the factors of 18". `ratio` compares by cross-multiplication, so `2:3` and
`4:6` are both accepted where either is correct.

### Pipeline

```
raw input -> normalize -> parse (mathjs) -> compare -> verdict
```

`normalize` reduces all three input modes to a single canonical infix string.
Numeric and expression modes pass through with whitespace and unicode cleanup.
MathLive emits LaTeX, which goes through the LaTeX-to-infix converter.

### Comparison order

1. **Symbolic.** `simplify(student - correct) === 0`. Catches `4/8` against
   `1/2`, `2x` against `x*2`, `sqrt(4)` against `2`.
2. **Exact rational.** Evaluate both sides as exact fractions, not floating
   point. `1/3` remains `1/3`.
3. **Random-point evaluation.** For answers containing free variables, evaluate
   both expressions at approximately twenty random values. This catches
   equivalences that `simplify` does not reduce.
4. **Tolerance band.** Last resort, and only under the restriction below.

### The tolerance rule

The 3-significant-figure band applies **only when the correct answer's decimal
expansion does not terminate** — that is, when the reduced denominator has a
prime factor other than 2 or 5, or the value is irrational. Whenever the answer
can be written exactly as a decimal, an exact match is required.

Note that an exact fraction is not automatically exempt: `3/4` terminates and
so demands an exact match, while `1/3` does not terminate and so admits the
band. Writing `1/3` itself still passes, via exact rational comparison, before
the band is ever consulted.

| Correct answer | Student input | Verdict | Reason |
|----------------|---------------|---------|--------|
| `1/3` | `0.333` | correct | non-terminating, band applies |
| `1/3` | `0.33` | incorrect | outside 3 s.f. |
| `1200` | `1198` | incorrect | answer is exact, no band |
| `3/4` | `0.75` | correct | exact equality |
| `4/8` | `1/2` | correct | symbolic |
| `sqrt(2)` | `1.41` | correct | non-terminating, band applies |
| `0` | `0.001` | incorrect | answer is exact |

### LaTeX-to-infix converter

Required because MathLive ships in v1. Must handle at minimum:

- `\frac{a}{b}`
- `\sqrt{x}` and `\sqrt[n]{x}`
- superscripts, including `x^{2}` and `x^2`
- `\times`, `\div`, `\cdot`
- implicit multiplication, including `2x` and `2(x+1)`
- unary minus and parenthesised negatives
- `\left(` and `\right)` wrappers

### Checker test list

Written before the implementation.

```
equivalent forms      4/8 = 1/2 = 0.5 = 2/4
commutativity         2x = x*2
non-terminating       1/3 accepts 0.333, 0.3333, 1/3; rejects 0.33
exact answers         1200 rejects 1198 and 1199.9; accepts 1200 and 1200.0
zero                  0 accepts 0, -0, 0.0; rejects 0.001
negatives             -3 accepts -3, (-3), 0-3
surds                 sqrt(8) = 2*sqrt(2) = 2.83
expressions           2(x+3) = 2x+6, verified by random-point evaluation
sets                  {1,2,3,6,9,18} in any order, duplicates ignored
ratios                2:3 = 4:6 = 6:9
unreadable            "2x+", "", "??", "abc" produce unreadable, never incorrect
latex converter       \frac{1}{2}, \sqrt[3]{8}, x^{2}, 2\times3, implicit times
```

---

## 7. Generator architecture

Generators are a flat registry of plain data objects holding pure functions. No
inheritance, no constraint-solving engine.

```ts
type LocalizedText = { bm: string; en: string }   // plain prose
type LocalizedLatex = { bm: string; en: string }  // LaTeX, rendered by KaTeX

type Generated = {
  prompt: LocalizedLatex
  answer: string            // canonical infix
  answerKind: AnswerKind
  steps: LocalizedLatex[]   // worked solution, precomputed by the generator
}

type Level = {
  id: string                // "linear-equations.L6"
  concept: LocalizedText
  generate(rng: Rng, scale: number): Generated
}
```

Fifty-four such objects, one per topic per level, each roughly fifteen to thirty
lines. A defect in one level cannot affect another.

Two approaches were considered and rejected. A class hierarchy per topic shares
nothing but the random number generator, because each level's logic genuinely
differs; inheritance would only obscure where the numbers come from. A generic
constraint-solving engine is elegant but reintroduces the exact risk that
backwards generation exists to eliminate — it becomes a solver whose output must
be trusted.

### Seeded randomness

Every question is identified by `(levelId, seed)`. This makes generators
deterministically testable, makes "retry this exact question" free, allows a
wrong answer to be regenerated and inspected months later, and lets a QR code
address a specific question rather than only a topic.

### Worked solution steps

Steps are produced by the generator, not by an LLM, for the same reason the
numbers are. The generator knows the solution path because it built the question
along that path in reverse.

---

## 8. Module boundaries

```
src/
  core/                      no UI imports, no DOM access, pure TypeScript
    checker/
      normalize.ts           all input modes -> canonical infix
      latex-to-infix.ts      MathLive output -> mathjs input
      equivalent.ts          comparison order and the tolerance rule
    generators/
      types.ts               Level, Generated, AnswerKind, Rng
      rng.ts                 seeded, deterministic
      linear-equations/      L1..L9
      algebraic-expressions/
      rational-numbers/
      factors-multiples/
      squares-cubes-roots/
      ratio-rate-proportion/
      registry.ts            topic -> levels
    progress/
      session.ts             ten-question set, pass at eight
      store.ts               profileId -> topic -> level and history
  ui/                        React; imports core, never the reverse
    input/                   numeric | expression | mathfield
    render/                  KaTeX wrapper
    screens/
  i18n/
    bm.ts
    en.ts
```

**The rule that makes a future React Native port viable:** nothing under `core/`
may import from `ui/`. This is enforced by a lint rule, not by discipline.

---

## 9. Answer input

One interface, three modes behind it. The checker never learns which mode
produced the string it receives.

```ts
interface AnswerInput {
  mode: 'numeric' | 'expression' | 'mathfield'
  onChange(normalized: string): void   // always mathjs-parseable infix
}
```

- **numeric** — restricted field for integer-only answers.
- **expression** — text field plus a custom on-screen keypad supplying
  `/ ^ ( ) sqrt` and a minus sign, so the phone keyboard never has to switch to
  its symbol layer. A live KaTeX preview below the field renders what has been
  typed.
- **mathfield** — MathLive, giving true two-dimensional entry with the cursor
  moving inside numerators and denominators.

Each generator declares its `answerKind`, which selects the default mode. The
student can override the default in settings.

---

## 10. Data model and storage

```ts
type Profile = {
  id: string              // uuid; becomes the server primary key unchanged
  name: string
  avatar: string          // preset identifier; no uploads in v1
  locale: 'bm' | 'en'
  createdAt: string
}

type TopicProgress = {
  profileId: string
  topicId: string
  level: number           // 1-9 concept levels, 10+ indicates scaling
  sets: SetResult[]
}

type SetResult = {
  level: number
  correct: number
  passed: boolean
  startedAt: string
  finishedAt: string
}

type Attempt = {
  profileId: string
  topicId: string
  level: number
  seed: number            // regenerates the exact question
  studentAnswer: string
  verdict: Verdict
  durationMs: number
  at: string
}
```

`Attempt` is what makes the twenty-student trial informative. Without it, the
trial produces impressions; with it, the trial answers which level students
stall on, which questions get abandoned, and how long each level takes relative
to the one before.

**Storage:** IndexedDB via the `idb` wrapper. Not `localStorage` — the attempt
log will exceed its five-megabyte limit and it fails silently when it does.
Every record carries `syncedAt: null` from the outset.

**Profiles:** a Netflix-style grid of avatars with add, edit and delete. No
login and no password. On a device with no server, a password protects nothing;
whoever holds the phone selects a profile.

---

## 11. Practice session rules

```
start set   ->  ten questions at the current level
                an unreadable verdict replaces the question rather than
                scoring it; a set always comprises ten scored answers

end of set  ->  8 or more correct       ->  advance one level
                5 to 7 correct          ->  repeat the current level
                4 or fewer, twice in a row -> drop one level, floor of 1
```

Feedback is immediate per question. On a wrong answer the worked steps are
shown.

---

## 12. Application shell

**Stack**

| Package | Purpose |
|---------|---------|
| `vite`, `react`, `typescript` | application shell |
| `vite-plugin-pwa` | service worker, manifest, install prompt |
| `katex` | rendering mathematics |
| `mathjs` | parsing, simplification, exact rational arithmetic |
| `mathlive` | two-dimensional input mode |
| `idb` | IndexedDB wrapper |

No internationalisation library. Two hardcoded locales need a typed dictionary,
not a runtime with loaders and interpolation.

**Offline.** v1 has no backend, so the service worker precaches the entire
application and it is fully functional offline after first load. This matters
disproportionately for students on prepaid data.

**Routes**

```
/                       profile picker
/t                      topic grid, showing per-profile level on each topic
/t/:topic               level ladder; levels above current + 1 are locked
/t/:topic/:level        practice session
/t/:topic/:level/done   set result
/settings               locale toggle, input mode, profile management
```

`/t/:topic/:level` is the QR code target. A code printed in the workbook opens
that topic's ladder directly with no navigation.

---

## 13. Testing

Unit tests cover the checker against the test list in section 6.

Per generator level, a property test rather than an example test:

```ts
test.each(levels)('%s answers verify', (level) => {
  for (let seed = 0; seed < 1000; seed++) {
    const q = level.generate(rng(seed), 0)
    expect(check(q.answer, q.answer, q.answerKind)).toBe('correct')
    expect(check(perturb(q.answer), q.answer, q.answerKind)).toBe('incorrect')
  }
})
```

`perturb` produces a deliberately wrong answer whose form depends on the answer
kind: numeric kinds shift by a value larger than any tolerance band could
absorb, `expression` alters one coefficient, `set` removes one member, and
`ratio` changes one term without preserving the proportion.

This exercises every generator against the checker fifty-four thousand times and
fails the build if any level can produce a question whose own declared answer
does not verify. It is the mechanical expression of the core principle, and it
is the reason the checker is built first.

One Playwright smoke test covers the full path: select a profile, open Linear
Equations level 1, answer ten questions, reach the result screen.

---

## 14. Build order

1. Answer checker, driven by the test list
2. LaTeX-to-infix converter
3. Seeded RNG, `Level` type, KaTeX rendering of one hardcoded question
4. Linear Equations levels 1 to 9, with the property test
5. Practice loop: question, answer, verdict, worked steps, next
6. Session rules and IndexedDB progress storage
7. Profile picker, bilingual toggle, all three input modes
8. The remaining five topics
9. PWA manifest, service worker, install flow
10. Put it in front of twenty Form 1 students

Everything after step 10 should be shaped by what those students actually do.

---

## 15. Workbook integration

The existing printed workbook is the distribution channel, not a competitor. A
QR code is printed per topic; scanning it opens that topic's generator directly.
The book sells the app and the app justifies the book's price.

This matters because Malaysian parents do not browse app stores for maths apps,
but they do buy workbooks at MPH and Popular. Distribution is the harder
problem, and the workbook already solves it.

---

## 16. Non-goals for v1

- Geometry, sets, statistics
- Forms 2 to 5
- Teacher dashboards and class reporting
- Native app store release
- Leaderboards, streaks, gamification
- AI tutoring chat
- Accounts, server-side storage, payments

Each is defensible later. None of them answers whether the core generator loop
works.
