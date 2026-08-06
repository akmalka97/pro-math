# Pro Math — memory

Durable facts about this project only. Loaded on every session in this directory via the `@MEMORY.md` import in `CLAUDE.md`.

Record what the code and git history cannot say: why a choice was made, what was tried and rejected, what constraint forced a design. Skip what a `README` or `git log` already covers.

Absolute dates only (`2026-08-07`) — relative dates rot the moment a session ends.

## Status

As of 2026-08-07: v1 PWA builds and runs. Approved design lives in `docs/superpowers/specs/2026-08-07-pro-math-design.md` and is the source of truth. Answer checker, LaTeX-to-infix converter, seeded RNG, all 54 generators (6 topics x 9 levels), session rules, IndexedDB storage, profiles, bilingual UI, and all three input modes are implemented. 196 tests pass. Not a git repo yet.

Remaining before the twenty-student trial: nothing structural. The build is at step 10 of the spec's build order.

## Decisions

- **Never use an LLM for the mathematics.** A wrong answer told to a student who was right destroys trust invisibly — the operator never finds out it happened. Questions are constructed backwards from a chosen answer, so correctness is structural. LLMs are acceptable for prose only, never numbers and never worked steps.
- **Checker before generators.** It is the component most likely to be wrong and everything depends on it. Built and tested first, and that order caught the tolerance-band defect below.
- **Tolerance band restricted to non-terminating answers.** A flat 3 s.f. band would accept `1198` for a correct answer of `1200`. The band now applies only when the answer's decimal expansion does not terminate, which keeps `0.333` passing for `1/3` without the defect. An exact fraction such as `3/4` is *not* exempt — it terminates, so it demands an exact match.
- **Three verdicts, not two.** `unreadable` never counts against the ten-question set. A student who mistyped has not answered wrongly, and conflating the two is another silent way to lose trust.
- **Local-only, profile-shaped.** No backend in v1, but every record carries `profileId` and `syncedAt: null`, so server accounts later become an insert rather than a schema rewrite.
- **Flat generator registry, not a class hierarchy or a constraint engine.** Each level's logic genuinely differs, so inheritance shares nothing but the RNG. A constraint solver would reintroduce exactly the "is this answer actually correct?" risk that backwards generation eliminates.
- **Seeded RNG (`mulberry32`).** Every question is `(levelId, seed)`. Makes generators deterministically testable, makes "retry this exact question" free, lets a wrong answer be regenerated months later, and lets a QR code address a specific question.
- **IndexedDB, not localStorage.** The attempt log outgrows the 5 MB limit and localStorage fails silently when it does.
- **Payment model deliberately deferred.** It decides the tenancy schema; nothing in v1 writes a server table, so deciding now would be guessing.

## Constraints

- KSSM Form 1, algebra and number topics only. Geometry, sets, statistics and data handling need a rendering stack this build does not have.
- Bilingual Bahasa Malaysia and English throughout, BM default. No i18n library — two hardcoded locales need a typed dictionary, not a runtime.
- `src/core/` must never import from `src/ui/`. This is what makes a later React Native port viable.

## Dead ends

- `NFKC` normalisation flattens `x²` to `x2`, which mathjs then reads as `x*2`. Superscript digits must be converted to explicit `^` powers *before* any Unicode folding.
- `mathjs.simplify` misses more equivalences than expected. Random-point evaluation at ~20 values is the authoritative check for expressions; `simplify` is only a fast path.

## Lessons

- The property test (54 levels x 1000 seeds, each level's own declared answer checked, plus a perturbed answer that must fail) is what makes the "generate backwards" principle mechanical rather than aspirational. Run it before trusting any generator change: `npm test`.
- Known limitation, not yet resolved: Factors & Multiples L7 asks for a prime factorisation, but the answer kind is `expression`, so a student typing `72` instead of `2^3 * 3^2` is marked correct. This follows from the approved "any equivalent form is correct" policy. Fixing it needs either a structural answer kind or a reworded question.
