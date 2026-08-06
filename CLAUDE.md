# Pro Math

Project-specific instructions. The global `C:\Users\Akmal\.claude\CLAUDE.md` still applies; anything here overrides it on conflict.

@MEMORY.md

## What this is

A maths practice PWA for Malaysian Form 1 (KSSM) students that generates questions instead of storing them. Every question is constructed backwards from a known answer.

The approved design in `docs/superpowers/specs/2026-08-07-pro-math-design.md` is the source of truth. Read it before changing anything structural.

## Commands

```
npm run dev      # Vite dev server on :5173
npm run build    # type-check, bundle, generate the service worker
npm test         # 196 tests: checker suite plus 54 generator property tests
```

`npm test` takes about 30 seconds — the generator property tests run 54,000 checks. Do not skip it after touching a generator or the checker.

## Conventions

- `src/core/` is pure TypeScript: no React, no DOM, no imports from `src/ui/`. This is what keeps a React Native port viable.
- Never use an LLM to produce the mathematics, the answers, or the worked steps. Prose only.
- Every generator declares its answer before the question exists. If you cannot state the answer in closed form, the level is wrong.
- Every stored record carries `profileId` and `syncedAt`, even though there is no server yet.
- All student-facing text is bilingual `{ bm, en }`. BM is the default locale.
