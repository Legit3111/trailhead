# Trailhead

Learn anything through a roadmap that **remembers where you are**.

Open the app → click one button → you're back in your tutoring session at the
exact point you left off. Progress, notes, and quiz scores save themselves as
you learn — no manual saving, no copy-paste ceremony.

> Replaces a GitHub-repo-as-memory workflow with a real app: the database *is*
> the memory, and the Claude API key stays safely server-side.

## What it does

- **One-button resume** — home screen shows your active curriculum and a single
  "Continue" button that drops you into the right module + phase.
- **In-app AI tutor** — runs theory → practical → quiz, calling the Claude API
  through a server backend (key never reaches the browser).
- **Continuous auto-save** — the tutor emits structured tool calls
  (`mark_phase_complete`, `record_quiz_result`, `save_note`, …) that the backend
  writes to the database *the moment they fire*.
- **Build any curriculum** — describe a topic + goal; the AI drafts a roadmap;
  you review/edit/approve, then learn through the same engine.
- **Seeded** with the 28-day anti-jam RF/SDR curriculum.

## Stack

- **Next.js 15** (App Router) — frontend + server API routes in one deploy.
- **Anthropic Claude API** — server-side only (`src/lib/anthropic.ts`).
- **Prisma + PostgreSQL** — schema in `prisma/schema.prisma`.
- **Vercel** + a hosted Postgres (Neon / Supabase / Vercel Postgres) for cloud.

## Project layout

```
src/
  app/
    page.tsx                 # home / one-button resume
    learn/page.tsx           # tutoring chat view
    curriculum/build/page.tsx# new-curriculum generator
    api/
      chat/route.ts          # tutor loop + instant tool-based saving
      curriculum/route.ts    # roadmap generation
      progress/route.ts      # resume point + stats
  lib/
    anthropic.ts             # Claude client + model config (server only)
    prisma.ts                # db client
    tutor-tools.ts           # THE auto-save mechanic (PRD §5)
    context.ts               # system prompt + conversation replay
prisma/schema.prisma         # data model
seed/seed.ts                 # anti-jam curriculum seed
docs/PRD.md                  # product requirements
```

## Local setup

```bash
npm install
cp .env.example .env.local      # fill in ANTHROPIC_API_KEY + DATABASE_URL
npm run db:push                 # create tables
npm run db:seed                 # load the anti-jam curriculum
npm run dev                     # http://localhost:3000
```

## Deploy (cloud, private)

1. Push this repo to GitHub.
2. Create a Postgres DB (Neon/Supabase/Vercel Postgres) → copy its URL.
3. Import the repo into Vercel.
4. Set env vars in Vercel: `ANTHROPIC_API_KEY`, `DATABASE_URL`, optional
   `ANTHROPIC_MODEL`.
5. Run `db:push` and `db:seed` against the prod DB (locally with prod
   `DATABASE_URL`, or via a one-off script).
6. **Lock it down to just you** — see Security.

## Security

- The Anthropic key lives in a server env var and is only read in
  `src/lib/anthropic.ts`, which refuses to load on the client. It never appears
  in any browser bundle or network response.
- This scaffold has **no auth yet**. Before exposing it publicly, add a single
  gate so only you can reach it — Vercel password protection, or a one-user
  login / passkey. Until then, run it locally or keep the deployment private.

## Status — scaffold

This is a runnable skeleton, not a finished app. Wired and working: data model,
tutor chat loop with instant saving, curriculum generation, progress/resume API,
home + learn + build pages, anti-jam seed.

### Build TODOs (good first tasks for Claude Code)
- `GET /api/phase` to resolve `phaseId` from `(moduleId, phase)` — the learn
  page currently stubs this.
- Editable review UI for generated curricula + "Approve & activate".
- Curriculum overview screen (all modules + statuses) and review screens
  (notes, quiz history, stuck log).
- Old-conversation summarization when the replay window overflows (`context.ts`).
- Single-user auth.
- Migrate the real Day 1–28 objectives from the old `curriculum/overview.md`
  into `seed/seed.ts`.
