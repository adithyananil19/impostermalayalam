# IMPOSTER.MALAYALAM. — Product Specification

## Overview

**IMPOSTER.MALAYALAM.** is a mobile-first, 100% offline-capable progressive web party game for 3–20 players. Players sit in a circle and pass a single device around. Regular players receive an authentic secret Malayalam word, while one or more imposters receive either no word, an indirect cultural hint, or the category name. During open discussion, players give clever, subtle clues without giving the secret away to the imposter. Afterward, everyone votes on who they believe is bluffing.

## Target Platform & Architecture

- Mobile-first responsive web application / Progressive Web App (PWA).
- Operates 100% offline after the initial load via Service Worker.
- Zero server, backend, or account creation required for core local party gameplay.
- Data persistence via versioned `localStorage`.

## Visual Design System

| Token | Value | Purpose |
|---|---|---|
| Background (`--clr-bg`) | `#0D0F0D` | Atmospheric deep charcoal |
| Surface (`--clr-surface`) | `#141714` | Slightly elevated card surface |
| Surface 2 (`--clr-surface-2`) | `#1B1F1B` | Secondary interactive containers |
| Elevated (`--clr-surface-elevated`)| `#222722` | Modals, active states, and steppers |
| Primary text | `#F5F6F2` | Headings, secret words, primary copy |
| Secondary text | `#9AA198` | Helper text, descriptions, hints |
| Accent (`--clr-accent`) | `#C6F36A` | Restrained vibrant lime for key highlights |
| Danger (`--clr-danger`) | `#FF6B6B` | Imposter badge and elimination alerts |
| Success (`--clr-success`) | `#5EED9C` | Regular player victory highlights |
| Border | `rgba(255, 255, 255, 0.08)` | Micro-borders with subtle inner highlights |

**Typography**: Space Grotesk (display headings), Plus Jakarta Sans (body copy), JetBrains Mono (timer, counts, code).

## Players & Setup Flow

- **Min Players:** 3, **Max Players:** 20.
- Streamlined 3-step setup flow:
  1. **Step 1 (`/new-game`)**: Giant tactile counter selecting exact player count.
  2. **Step 2 (`/players`)**: Name entry with `🎲 Fill Random Names` button for instant deduplicated random name autofill.
  3. **Step 3 (`/settings`)**: Expanded all-in-one settings with game mode (Single vs Multi-round), imposter count stepper, imposter information mode, discussion timer, and embedded category picker with live word counts.

## Imposter Information Modes

| Mode | What the Imposter Sees | Playstyle |
|---|---|---|
| `no_word` | Nothing (`""`) | Hardcore social deduction; must bluff entirely from others' clues. |
| `vague_hint` | Vague Hint | Moderate difficulty; gets an indirect, playful Malayalam clue. |
| `category_reveal` | Category Name | Beginner-friendly; knows the category theme (e.g. *Food & Bakery*). |

## Game State Machine & Screens

```
setup → role_reveal → discussion → voting (or quick_verdict) → vote_result → round_result → next_round (or game_over)
```

1. **Home (`/`)**: Brand presentation (`IMPOSTER.MALAYALAM.`), lifetime stats, quick start, install app trigger.
2. **Player Count (`/new-game`)**: Step 1 counter (3–20 players).
3. **Player Names (`/players`)**: Step 2 name entries with random name generator.
4. **Game Settings (`/settings`)**: Step 3 unified settings with embedded category multi-select.
5. **Role Reveal (`/reveal`)**: Confidential pass-the-phone screen with tap or hold-to-reveal.
6. **Discussion (`/discussion`)**: Discussion in progress with masked secret word, optional countdown timer, and Quick Verdict shortcut.
7. **Quick Verdict (`/quick-verdict`)**: Instant 1-tap outcome ("Caught" or "Got Away") for casual fast games.
8. **Voting (`/voting`)**: Pass-the-phone private ballot with confirmation gate.
9. **Results (`/results`)**: Outcome announcement, secret word reveal, imposter identity, and vote breakdown.
10. **Leaderboard (`/score`)**: Multi-round tournament rankings and cumulative scores.
11. **Custom Words (`/custom-words`)**: User-authored categories & words, JSON import/export.
12. **Settings & Preferences (`/preferences`)**: Accessibility toggles (Reduce motion, Sound, Haptic) and lifetime statistics.

## Victory & Scoring Rules

- **Regular Players Win:** If all active imposters are correctly identified and eliminated by vote or Quick Verdict.
- **Imposter Wins:** If an innocent regular player is eliminated, votes result in a deadlock/tie, or surviving imposters remain.
- **Points:** In score tracking mode, winning regulars receive 100 points each; winning imposters receive 200 points each.

## Word Bank & Categories

- **248 authentic cultural entries** across 11 diverse categories:
  - Kerala Slang & Culture (18)
  - College Life (17)
  - Food & Bakery (18)
  - Memes & Viral Trends (17)
  - Places in Kerala (17)
  - Everyday Objects (17)
  - Politics & Public Life (17)
  - Relationships & Dating (16)
  - Tricky Words (18)
  - Sports & Games (17)
  - Malayalam Movies (76)
- Structured format: `{ id, word, hint, category, tags }` (zero artificial difficulty tiers).

## PWA & Offline Support

- Custom Service Worker (`public/sw.js`) with cache-first and stale-while-revalidate policies.
- Network-first navigation with offline fallback to `/index.html` guaranteeing seamless offline reloads.
- Standalone Web App Manifest (`public/manifest.webmanifest`) with adaptive SVG icons (`192x192`, `512x512`, `maskable`).
- Native install prompt hook (`usePWA`).
- Safe-area insets (`viewport-fit=cover`) protecting against device notches and navigation bars.

