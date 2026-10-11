# Vocab Flashcards

Mobile-first flashcard app for learning vocabulary (German ↔ French). Progress and preferences stay in the browser via `localStorage`. No login, no database.

## Features

- Built-in example set: **Bonjour de Nice – Unité 6**
- Create custom sets (manual card-by-card form), import/export JSON files
- Flip cards, then grade with swipe or buttons (**Kann ich** / **Kann ich noch nicht**)
- Random queue; when the queue is empty, continue with the “not yet” pile
- Browse the “I know” pile
- Direction toggle (DE→FR / FR→DE) and UI language (DE / EN)
- Installable PWA (service worker + offline cache, home-screen install)
- Static production build for simple hosting

## Local development

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

## Production / static deploy

```bash
npm run build
npm run preview   # optional local check of dist/
```

Deploy the contents of `dist/` to any static host (nginx, S3, Netlify, GitHub Pages, …).

PWA install works best over **HTTPS** (or `localhost`). After deploy, Chromium-based browsers can show an install prompt; on iOS use Share → Add to Home Screen.

The vocabulary JSON is copied to `dist/sets/bonjour-de-nice-unite-6.json`.

## Tests

```bash
npm test          # watch mode
npm run test:run  # CI / single run
```

## Set format (import / export)

Custom sets are stored in `localStorage`. Use **Load file** / **Save as file** on the home screen, or export while editing a set.

See `public/sets/bonjour-de-nice-unite-6.json`:

```json
{
  "id": "…",
  "title": "…",
  "sourceLanguage": "fr",
  "targetLanguage": "de",
  "cards": [
    {
      "id": "une-ville",
      "source": "une ville",
      "target": "eine Stadt",
      "phonetic": "ynvil",
      "explanation": "optional",
      "forms": "optional"
    }
  ]
}
```

## Tech

- Vite + React + TypeScript
- Tailwind CSS v4
- vite-plugin-pwa (Workbox)
- Vitest + React Testing Library
