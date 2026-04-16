# The Clone Problem

An interactive recursion-teaching game built for CP192 (Computational Sciences, Minerva University).
Players write real Python code — executed in the browser via Pyodide — to advance a character up a building by deploying recursive clones. A live call-stack visualiser shows exactly what happens at each depth level.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | CSS Modules, Space Mono font |
| Python runtime | Pyodide v0.25 (real CPython in the browser) |
| Code editor | CodeMirror 6 |
| Auth + persistence | Firebase Auth + Firestore |
| Narrator voice | ElevenLabs TTS (Dr. Omarito) |
| Background music + SFX | Web Audio API + HTML Audio |
| Tests | Vitest |

## Getting started

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build
npm test           # run test suite (78 tests)
```

A `.env` file with the following keys is required:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Levels

| # | Name | Concept |
|---|---|---|
| 1 | The Floors | Base case |
| 2 | The Coin Stack | Recursive step + return values |
| 3 | Fibonacci | Multiple recursive calls (tree recursion) |

Each level has three phases: **Guided** (step-by-step walkthrough), **Scaffold** (fill-in-the-blanks), and **Free** (write from scratch). Progress and best times are persisted per user in Firestore.

## Project structure

```
src/
  components/      React screens and UI components
  levels/          Level configuration files (level1.js – level3.js)
  systems/
    narratorSystem.js    All dialogue + ElevenLabs TTS
    audioSystem.js       Background music + Web Audio SFX
    codeExecutor.js      Pyodide Python execution + step instrumentation
    recursionEngine.js   Pure JS simulation (reference implementation)
    edgeCaseDetector.js  Wrong-answer analysis — returns specific mistake keys
    firestoreService.js  All Firestore read/write operations
    firebaseConfig.js    Firebase app initialisation
    __tests__/           Vitest test suite
```
