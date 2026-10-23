# Imposter Party Game — Product Specification

## Overview

**Imposter** is a mobile-first, offline-capable party game for 3–20 players. Players discuss a secret word; one or more among them is an "imposter" who either has no word, a vague hint, or a related word. Players discuss and vote to eliminate the imposter. The imposter wins if they survive the vote.

## Target platform

- Mobile-first responsive web (PWA).
- Works offline after first load.
- No sign-in or server required for core gameplay.

## Visual design

| Token | Value |
|---|---|
| Background | `#101110` |
| Surface | `#191B19` |
| Primary text | `#F3F3EF` |
| Secondary text | `#969B95` |
| Accent | `#C6F36A` |
| Danger | `#F26969` |
| Border | `#2A2E2A` |

Typography: Inter (Google Fonts), system-ui fallback.

## Players

- Min: 3, Max: 20.
- Names must be unique and non-empty.
- Each player has a `uuid`-like ID generated at setup.

## Imposter information modes

| Mode | What the imposter sees |
|---|---|
| `no_word` | Nothing |
| `vague_hint` | Indirect hint |
| `related_word` | Different but related word |

## Game state machine

```
setup → role_reveal → discussion → voting → vote_result → round_result → next_round (or game_over)
```

## Screens

1. Home
2. New Game
3. Player Entry
4. Category Selection
5. Game Settings
6. Role Reveal (pass-the-phone)
7. Discussion (optional timer)
8. Voting (one vote per player)
9. Results
10. Score / Leaderboard
11. Custom Words
12. Preferences

## Victory conditions

- **Regular players win:** all imposters are correctly identified and eliminated via vote.
- **Imposter wins:** the vote does not eliminate all imposters (tie, wrong target, or no majority).

## Word bank

- 11 built-in categories, ~171+ words.
- Each entry: `{ id, word, hint, category, difficulty, tags }`.
- Custom categories stored in `localStorage`.

## Custom words

- Users can create categories, add words and hints, import/export JSON.
- Custom entries override or supplement built-in entries.

## Offline support

- PWA with service worker (Phase 6).
- Word bank bundled locally.
- No dependency on external APIs for core game.

## Persistence

- `localStorage` with versioned schema.
- Stores: preferences, custom categories, optional stats.
- Does not store player secrets after round ends.
