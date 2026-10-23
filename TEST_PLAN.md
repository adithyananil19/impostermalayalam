# Test Plan

## Testing stack

- **Unit / integration:** Vitest + @testing-library/react
- **Setup file:** `src/test/setup.ts` (imports `@testing-library/jest-dom`)
- **Run tests:** `npm test` (or `pnpm test`)
- **Watch mode:** `npm run test:watch`

## Phase 1 tests (smoke)

| Test | File | Status |
|---|---|---|
| DEFAULT_SETTINGS values are valid | `src/test/smoke.test.ts` | ✅ |

## Phase 2 tests (game engine — planned)

- Valid and invalid player counts
- Imposter assignment (random, no duplicates)
- Secret word selection per category
- Category filters respected
- Duplicate voting rejected
- Vote ties detected
- Elimination logic
- Multiple imposters
- Victory conditions (all modes)
- Score calculations
- Restart and next-round transitions

## Phase 3 tests (integration — planned)

- Full role-reveal flow (3, 10, 20 players)
- Timer behavior
- Voting flow and confirmation gate
- Results display with correct data

## Phase 5 tests (content — planned)

- Every word entry has a unique ID
- No empty word, hint, or category fields
- No duplicate entries
- Category filter returns correct entries
- Skip Word selects a new word without changing roles

## Phase 6 tests (QA — planned)

- Offline reload after caching
- Corrupted localStorage recovery
- Keyboard navigation on all screens
- Contrast ratios pass WCAG AA
- Reduced-motion CSS applied correctly
