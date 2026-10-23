# IMPOSTER.MALAYALAM. 🕵️

> **One word. One liar. No trust.**  
> The modern, minimal, pass-the-phone party game inspired by authentic Kerala culture.

[![Tests](https://img.shields.io/badge/tests-100%2F100%20passing-5eed9c?style=flat-square)](https://github.com/adithyananil19/impostermalayalam)
[![Typecheck](https://img.shields.io/badge/typescript-strict%200%20errors-c6f36a?style=flat-square)](https://github.com/adithyananil19/impostermalayalam)
[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline%20Ready-c6f36a?style=flat-square)](https://github.com/adithyananil19/impostermalayalam)
[![License](https://img.shields.io/badge/license-MIT-9aa198?style=flat-square)](LICENSE)

---

## 🎮 Overview

**IMPOSTER.MALAYALAM.** is a sleek, mobile-first progressive web app (PWA) designed for real-world parties, college hostels, family get-togethers, and friend hangouts.

Players sit in a circle and pass a single phone around. Regular players receive a secret Malayali word, while secretly chosen Imposters receive an indirect clue, category name, or no word at all! During discussion, players give clever, subtle clues without giving the secret away to the imposter. Afterward, everyone votes on who they believe is bluffing.

---

## ✨ Features

- **3 to 20 Players Supported**: Flexible group sizing with dynamic party recommendations.
- **Random Party Name Generator**: Instant 1-tap name population (`🎲 Fill Random Names`) without duplicate entries.
- **3 Imposter Information Modes**:
  1. `No Word`: The imposter receives no word and must bluff entirely on social cues.
  2. `Vague Hint`: The imposter gets a subtle, indirect Malayalam cultural hint.
  3. `Category Reveal`: The imposter gets the category name (e.g. *Food & Bakery*, *College Life*).
- **Single Round & Multi-Round Tournament Modes**: Play quick standalone matches or multi-round tournaments with point tracking and celebratory final podiums.
- **Authentic 248-Word Kerala Cultural Bank**:
  - *Kerala Slang & Culture* (18 words)
  - *College Life* (17 words)
  - *Food & Bakery* (18 words)
  - *Memes & Viral Trends* (17 words)
  - *Places in Kerala* (17 words)
  - *Everyday Objects* (17 words)
  - *Politics & Public Life* (17 words)
  - *Relationships & Dating* (16 words)
  - *Tricky Words* (18 words)
  - *Sports & Games* (17 words)
  - *Malayalam Movies* (76 blockbuster films spanning classics to modern hits)
- **Discussion Screen with Screen Privacy**: Secret word is masked during discussion to prevent accidental shoulder-peeking. Includes optional countdown timer.
- **Quick Verdict Shortcut**: Skip full phone voting during casual parties with 1-tap "Caught" or "Got Away" buttons.
- **Custom Words & Categories**:
  - Create custom categories and words with hints.
  - Export and import custom word packs as structured JSON files to share with friends.
- **PWA & 100% Offline Resilience**:
  - Built-in Service Worker precaches the application shell and assets.
  - Play anywhere with zero cellular signal or internet connection.
  - Installable to home screens on iOS and Android.
- **Accessibility & Mobile UX**:
  - iPhone Dynamic Island & notch safe-area inset protection.
  - Touch targets >= 44px with active anti-flicker and selection prevention.
  - Keyboard navigation (Space/Enter hold-to-reveal) and WCAG AA contrast.
  - In-app Reduce Motion toggle and system preference integration.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 5](https://vitejs.dev/)
- **Styling**: Pure CSS Modules + CSS Custom Properties (zero bloated utility libraries)
- **State Architecture**: Pure State Machine Reducer + React Context
- **Persistence**: Type-safe versioned `localStorage` wrapper
- **Test Runner**: [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) (100 unit & integration tests)
- **Offline / PWA**: Native Service Worker (`public/sw.js`) + Web App Manifest

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher (tested on Node v20/v24)
- **npm**: `v9.0.0` or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/adithyananil19/impostermalayalam.git

# Navigate to project folder
cd impostermalayalam

# Install dependencies
npm install
```

### Local Development

```bash
# Start local development server
npm run dev

# Or expose to local Wi-Fi to test on mobile devices on the same network
npm run dev -- --host 0.0.0.0 --port 5173
```

Open your browser at `http://localhost:5173/` (or `http://<your-local-ip>:5173/` on your phone).

---

## 🧪 Testing & Verification

The project includes 100 comprehensive unit, integration, and QA tests:

```bash
# Run all tests once
npm test

# Run tests in interactive watch mode
npm run test:watch

# Run TypeScript strict type-check without emitting files
npm run typecheck
```

### Test Suites

1. `src/test/smoke.test.ts` (6 tests) — Initial token & setting integrity.
2. `src/test/gameEngine.test.ts` (39 tests) — Player validation, roles, voting, tie handling, scoring.
3. `src/test/playableGame.test.ts` (8 tests) — Complete end-to-end playable state transitions.
4. `src/test/persistence.test.ts` (16 tests) — Storage wrappers, custom category import/export, error recovery.
5. `src/test/wordBank.test.ts` (9 tests) — Content quotas, duplicate checking, hint sanitization.
6. `src/test/phase6QA.test.ts` (22 tests) — 3-to-20 player edge cases, imposter modes, storage resilience, PWA assets.

---

## 📦 Production Build

```bash
# Build production bundle to /dist
npm run build

# Preview production build locally
npm run preview
```

Output directory: `dist/` (includes HTML, hashed CSS/JS chunks, PWA manifest, service worker, and icons).

---

## 🌐 Deployment Instructions

The application is completely static and can be deployed for free on any modern static hosting platform.

### 1. Cloudflare Pages (Recommended)
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Workers & Pages**.
2. Click **Create Application** -> **Pages** -> **Connect to Git**.
3. Select the `impostermalayalam` repository.
4. Set Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**.
6. SPA routing is automatically handled via [`public/_redirects`](public/_redirects).

### 2. Vercel
1. Import repository on [Vercel](https://vercel.com/new).
2. Framework Preset: `Vite`.
3. Build command: `npm run build`.
4. Output Directory: `dist`.
5. Click **Deploy**. SPA routing and immutable cache headers are configured via [`vercel.json`](vercel.json).

### 3. GitHub Pages
1. Go to repository **Settings** -> **Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Pushing to `main` automatically triggers the `.github/workflows/deploy.yml` pipeline to build, test, and deploy to `<username>.github.io/impostermalayalam/`.

### 4. Netlify
1. Connect repository on [Netlify](https://app.netlify.com/).
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Deploy site. SPA routing is handled via [`public/_redirects`](public/_redirects).

---

## 📂 Custom Word Pack JSON Format

Custom words and categories can be imported and exported from the **Custom Words** page. The format adheres to this schema:

```json
{
  "version": 1,
  "exportedAt": "2026-10-24T05:00:00.000Z",
  "categories": [
    {
      "id": "hostel-lore",
      "name": "Hostel Lore",
      "description": "Late-night maggi, warden raids, and ghost stories"
    }
  ],
  "words": [
    {
      "word": "Maggi at 2 AM",
      "hint": "Boiling kettle secret",
      "category": "hostel-lore"
    },
    {
      "word": "Warden Inspection",
      "hint": "Hide the iron box",
      "category": "hostel-lore"
    }
  ]
}
```

---

## ⚠️ Known Limitations

1. **Local Single-Device Play**: Currently designed for pass-the-phone on a single shared device. Online multiplayer across separate phones is an optional future phase (Phase 8).
2. **Audio / Haptics Support**: Web Vibration API and HTML5 Web Audio depend on browser permissions and platform support (supported on Android Chrome; iOS Safari restricts vibration).
3. **Browser Storage Limits**: Custom words and lifetime stats are stored in browser `localStorage`. Clearing browser data or using private/incognito tabs resets local custom packs (exporting a backup JSON is recommended).

---

## 📄 License

MIT License. Designed and developed with ❤️ for Kerala party lovers.
