# Implementation Plan

## Technology stack

| Concern | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Routing | React Router v6 |
| Styling | CSS Modules + CSS custom properties |
| Testing | Vitest + Testing Library |
| State | React Context (game) + localStorage (persistence) |
| PWA | Vite PWA plugin (Phase 6) |
| Deployment | Cloudflare Pages (Phase 7) |

## Folder structure

```
src/
  components/   Shared UI components (Button, Card, Toggle, …)
  pages/        One file per screen
  game/         Pure game logic (engine, rules, scoring)
  data/         Word bank and categories
  hooks/        React context and custom hooks
  storage/      localStorage read/write helpers
  styles/       Global CSS and design tokens
  types/        Shared TypeScript types
  utils/        Pure utility functions
  test/         Test setup and shared fixtures
```

## Phase-by-phase plan

| Phase | Goal | Status |
|---|---|---|
| 0 | Project scaffold, folder structure, docs | ✅ Done |
| 1 | Visual foundation, all screens, navigation | ✅ Done |
| 2 | Game engine, state machine, unit tests | ✅ Done |
| 3 | Full playable game (connect engine to UI) | ✅ Done |
| 4 | Settings, custom words, localStorage | ✅ Done |
| 5 | Complete word bank (248 entries) | ✅ Done |
| 6 | PWA, offline, accessibility, final QA | ✅ Done |
| 7 | Deployment and handoff | ✅ Done |
| 8 | Optional online multiplayer | 🔲 Pending |

## Naming conventions

- Components: `PascalCase.tsx` + `PascalCase.module.css`
- Pages: `PascalCase + "Page".tsx`
- Hooks: `use` prefix, `.tsx` for JSX providers, `.ts` otherwise
- Types: in `src/types/index.ts`
- Game logic: in `src/game/`, no React imports

## CSS strategy

- CSS custom properties defined in `:root` (globals.css).
- Component styles in `.module.css` co-located with component.
- No Tailwind. No CSS-in-JS.
- Mobile-first media queries.

## State management strategy

- `GameContext` + `useGame` hook for active game state.
- `localStorage` helper in `src/storage/` for persistence.
- No Redux / Zustand until complexity demands it.
