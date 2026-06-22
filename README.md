# Citi Sprints

**The fastest Citi Bike riders in New York City.** Upload a screenshot of your
ride, get it read and verified automatically, pick a handle, and climb the
leaderboard.

An independent fan project — not affiliated with Citi Bike, Lyft, or Citigroup.

## How it works

1. **Upload** a screenshot of the Citi Bike app's ride summary (drag, browse, or
   paste from the clipboard).
2. **Read & verify** — client-side OCR (Tesseract.js) pulls the distance and
   elapsed time straight from the image and checks it looks like a real Citi
   Bike ride. Every extracted value is editable before you post, so a bad read
   never blocks you.
3. **Rank** — you land on two boards: **Fastest** (best single-ride average
   speed) and **Longest** (total miles ridden).

Only rides of **0.3 miles or more** qualify, so nobody games a top speed by
coasting to the corner.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with a custom token system
- **Tesseract.js** for in-browser OCR (no server, no API keys, no cost)
- Rides persist in **localStorage** today; the data layer in `src/lib/store.ts`
  is isolated so it can be swapped for a real backend (e.g. Supabase) without
  touching the UI.

## Design

A race-classification board for the city: a cool blue-grey field, deep ink
type, Citi azure as the working accent, and a single warm signal-orange
reserved for the current leader. All speeds, times, and distances are set in a
tabular monospace so the board reads like a stopwatch. The hero sits over a
generated Manhattan street grid, and the leader's speed counts up on load.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## Project structure

```
src/
  app/            layout, global tokens, page orchestrator
  components/     Nav, Hero, Leaderboard, AddRideModal, GridCanvas, …
  lib/
    ocr.ts        Tesseract wrapper + ride-text parser
    store.ts      ride persistence + leaderboard ranking
    format.ts     speed/time/distance helpers, qualifying threshold
    mockData.ts   seed riders
    types.ts
```
