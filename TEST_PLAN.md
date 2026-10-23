# Test Plan & Verification Matrix

## Testing Stack

- **Framework**: [Vitest](https://vitest.dev/)
- **DOM Environment**: JSDOM + `@testing-library/react` + `@testing-library/jest-dom`
- **Setup File**: `src/test/setup.ts`
- **Execution Command**: `npm test`
- **Interactive Watch Command**: `npm run test:watch`
- **Typecheck Command**: `npm run typecheck`

---

## Test Suites & Coverage (100 Tests Total)

| Suite File | Focus Area | Tests | Status |
|---|---|:---:|:---:|
| `src/test/smoke.test.ts` | Default configuration tokens & baseline constants | 6 | ✅ 6/6 Passing |
| `src/test/gameEngine.test.ts` | Game engine rules, validation, role assignment, voting, tie-breaking, scoring | 39 | ✅ 39/39 Passing |
| `src/test/playableGame.test.ts` | End-to-end playable state machine transitions, multi-round gameplay | 8 | ✅ 8/8 Passing |
| `src/test/persistence.test.ts` | `localStorage` persistence, error recovery, custom categories/words, JSON export/import | 16 | ✅ 16/16 Passing |
| `src/test/wordBank.test.ts` | Word bank quotas (248 words), unique IDs, non-empty fields, hint sanity | 9 | ✅ 9/9 Passing |
| `src/test/phase6QA.test.ts` | Comprehensive QA: 3–20 players, all imposter modes, category combos, storage resilience | 22 | ✅ 22/22 Passing |
| **Total** | | **100** | **✅ 100/100 Passing** |

---

## Detailed Test Verification Matrix

### 1. Game Engine & State Machine (`gameEngine.test.ts` & `playableGame.test.ts`)
- Accepts valid player counts from 3 up to 20 players.
- Rejects player count < 3 or > 20.
- Rejects duplicate names (case-insensitive) and empty strings.
- Enforces imposter count boundaries: minimum 1, strictly less than total player count.
- Random Fisher-Yates assignment distributes exact imposter count without duplicate assignments.
- Secret word selection strictly filters enabled categories and avoids recently used words.
- All 3 Imposter Information Modes:
  - `no_word`: imposter receives empty string `""`.
  - `vague_hint`: imposter receives indirect cultural hint.
  - `category_reveal`: imposter receives the category name.
- Voting rules:
  - Prevents non-players from voting or being voted on.
  - Strictly rejects duplicate voting attempts from the same player in a round.
  - Resolves majority votes in favor of regular players when imposter is eliminated.
  - Resolves incorrect votes in favor of the imposter.
  - Deadlocks and ties explicitly result in imposter victory.
- Dynamic Skip Word:
  - Selects alternative word from active categories while preserving player roles and imposter identity.
- Multi-Round Scoring:
  - Regular victory: +100 points per player.
  - Imposter victory: +200 points per imposter.
  - Accumulates points across multi-round sessions and concludes at the configured round limit.

### 2. Word Bank & Content Quality (`wordBank.test.ts`)
- 248 total verified entries across 11 authentic Kerala categories.
- Every word entry has a strictly unique sequential ID (`cat-001`, etc.).
- Every word, hint, and category has non-empty trimmed text.
- No hint duplicates or directly reveals the secret word.
- Every category contains at least 10+ entries (blockbuster movies contains 76 entries).

### 3. Persistence & Custom Word Packs (`persistence.test.ts`)
- Encapsulated `localStorage` wrapper reads/writes JSON safely.
- Corrupted or invalid JSON recovers gracefully with default fallbacks without crashing the app.
- Custom categories and words persist across reloads and delete cascades correctly.
- Import/Export parser rejects invalid JSON, non-array payloads, and malformed entries.
- Valid exported JSON word packs can be shared and imported across devices.

### 4. PWA, Offline & Final QA (`phase6QA.test.ts`)
- Manifest configuration exists with valid names, start URL, theme colors, and icons.
- Service Worker precaches shell files and intercepts navigation requests with offline fallbacks.
- Edge case groups tested: 3 players with 1 imposter; 20 players with 4 imposters.
- Mobile accessibility: touch targets >= 44px, safe area insets, keyboard navigation.

