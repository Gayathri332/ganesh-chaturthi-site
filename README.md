# Ganpati Bappa Morya — Ganesh Chaturthi site

An interactive Ganesh Chaturthi greeting built with Next.js (App Router),
TypeScript, and Tailwind CSS:

- **Hero** with a festival headline and a hand-drawn underline flourish.
- **The Bappa Gallery** — the fan-carousel component you provided
  (`components/ui/card-fan-carousel.tsx`, powered by GSAP), showing
  Ganesha's eight Ashtavinayak forms (Vakratunda, Ekadanta, Mahodara,
  Gajanana, Lambodara, Vikata, Vighnaraja, Dhumravarna) in a
  hover-to-spread fan layout with arrow/dot navigation.
- **A looping hero video** (`public/video/ganpati-hero.mp4`) plays muted
  behind the headline, with a maroon/gold gradient over it for readability.
- **Background bhajan** (`public/audio/ganpati-bhajan.mp3`) starts playing
  as soon as the site loads (or on the visitor's first tap/click, if the
  browser blocks autoplay-with-sound), with a mute/unmute button fixed in
  the bottom-right corner — see `components/MusicPlayer.tsx`.
- **Ask about Ganapati** — a chat widget that answers questions using (1)
  PDF stories you provide and (2) a live web search, optionally polished
  by Cohere into one fluent answer. The suggested-question chips below
  each answer change to relate to what was just discussed — see
  "Contextual follow-up questions" below.

## 1. Install

```bash
npm install
```

## 2. Project structure & shadcn note

This is a plain Next.js + Tailwind + TypeScript project (not scaffolded
via the shadcn CLI), but it already follows shadcn's conventions:
Tailwind is configured at the root, and shared UI components live in
`/components/ui/` with a `cn()` helper in `lib/utils.ts`. That means if
you later want to pull in real shadcn components, you can run
`npx shadcn@latest init` from this folder and it will detect the
existing Tailwind setup and target this same `/components/ui/` folder —
keep that folder as-is rather than renaming it, since shadcn's CLI and
its generated components assume that exact path.

## 3. Gallery photos

`public/images/ganesha/` already has 8 photos (`ganesha-vakratunda.jpg`
… `ganesha-dhumravarna.jpg`), cut from the collage image you provided.
To swap in different photos, replace those files (or add new ones) and
update the `GALLERY_CARDS` array in `app/page.tsx` with the filenames
(or full URLs, and an optional `linkUrl` per card). The carousel looks
best with 5–8 images in a portrait aspect ratio.

## 3b. Hero video & background music

- Hero video: replace `public/video/ganpati-hero.mp4` with your own clip
  (any length — it loops). It plays muted, since browsers block autoplay
  with sound; keep clips short since they're downloaded on every visit.
- Background music: replace `public/audio/ganpati-bhajan.mp3` with your
  own track. It also loops. If a visitor's browser blocks the initial
  autoplay attempt, it starts automatically on their first click/tap
  anywhere on the page instead — this is a browser restriction, not
  something the site can override.

## 4. Add Ganapati story PDFs

1. Drop your PDF files into `data/pdfs/`.
2. Run:
   ```bash
   npm run ingest
   ```
   This extracts the text from each PDF, splits it into ~600-character
   chunks, and writes them to `data/knowledge.json`. Re-run it any time
   you add or change PDFs.

The Ask widget searches these chunks with a lightweight, dependency-free
term-overlap ranker (`lib/localSearch.ts`) — no embedding API key
required. If you'd rather use closer-to-semantic search (matching your
Resume Intelligence app's FAISS + Sentence-Transformers + Cohere setup),
swap the scoring function in that file for a Cohere `embed` call and
cosine similarity; the rest of the pipeline doesn't need to change.

## 5. Web search fallback (SerpApi)

Get a key at [serpapi.com](https://serpapi.com), then create `.env.local`:

```bash
cp .env.example .env.local
```

```
SERPAPI_KEY=your_key_here
```

Without a key, the widget simply skips the web lookup and answers from
the PDF stories alone.

## 6. Optional: fluent answers via Cohere

By default, answers are **extractive** — the best-matching PDF excerpt
and/or web snippet, shown as-is. To have Cohere's Command model weave
those into one natural-sounding answer instead, grab a key at
[dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys)
and add to `.env.local`:

```
COHERE_API_KEY=your_key_here
```

This calls Cohere's Chat API server-side from `app/api/ask/route.ts` /
`lib/llm.ts` — the key never reaches the browser.

**About Cohere's free tier:** the "trial" key you get without adding
billing is free, but it's not unlimited — currently around 1,000 API
calls per month (shared across all Cohere endpoints), resetting monthly
rather than annually, plus a per-minute rate limit. It's also meant for
evaluation/testing only under Cohere's terms, not production traffic —
see [docs.cohere.com/docs/rate-limits](https://docs.cohere.com/docs/rate-limits)
for current numbers, and Cohere's dashboard for upgrading to a paid
production key once you outgrow it. For a low-traffic personal site
like this, the trial tier will likely be plenty.

## 7. Contextual follow-up questions

The four suggestion chips under the Ask widget start as generic starter
prompts, but after each answer they're replaced with follow-ups related
to what was just asked — e.g. asking about the elephant head surfaces
things like "Tell me the full story" or "Why did Shiva behead his own
son?" instead of the same four prompts every time.

- If `COHERE_API_KEY` is set, `generateFollowUps()` in `lib/llm.ts` asks
  Cohere to write 4 follow-ups tailored to the exact answer just given.
- Either way (key or no key), `getFollowUps()` in `lib/followUps.ts` is
  the offline fallback — it matches keywords in the question/answer
  against ~12 Ganesha topics (elephant head, modak, parents, the eight
  Ashtavinayak forms, the mouse vahana, the broken tusk, etc.) and picks
  4 related questions, skipping anything already asked in the
  conversation. Add more topics/keywords there any time.

## 8. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Notes

- All chat network calls happen in the `/api/ask` route (server-side),
  so your SerpApi and Cohere keys stay out of client-side JavaScript.
- `data/pdfs/*.pdf` is gitignored — commit `data/knowledge.json` instead
  (or re-run `npm run ingest` on deploy) if you want the built site to
  ship with the extracted text but not the source PDFs.
- Fonts (Fraunces, Work Sans) load via `next/font/google`, so no manual
  font files are needed.
