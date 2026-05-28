# PRD — "Roadmap" Personal Learning App

**Author:** (you)
**Status:** Draft v1 — for Claude Design, then Claude Code
**One-line:** A private, cloud-hosted app where I learn any subject through an AI-generated roadmap, with a tutor that runs entirely in-app and saves my progress continuously and automatically — no manual session bookkeeping.

---

## 1. Background & Problem

I currently learn structured subjects (e.g. a 28-day RF/SDR anti-jam curriculum) by running tutoring sessions in the Claude chat interface, using a GitHub repo as persistent memory. Each session I manually paste a "start" prompt, do theory → practical → quiz back-and-forths, paste an "end" prompt, then run Claude Code to commit updated progress/notes/quiz files to git.

**Pain points:**
1. **Starting is ceremony.** I paste opener prompts and reload context by hand every session.
2. **Saving is manual and slow.** The tutor's accumulated knowledge about my progress only persists if I run an end-prompt + Claude Code commit. It should be instant and automatic.
3. **GitHub was only a memory crutch**, not a real requirement. I don't care about git; I just need a reliable place to keep all my data.

**Goal:** Replace the whole flow with one app. Open it → it shows where I am → I click "Continue" (or "Start Day 3") → I learn → everything saves itself as I go → I can stop anytime and resume at the exact spot.

---

## 2. Goals & Non-Goals

### Goals
- One-click start/resume into the current point of a curriculum.
- A tutor that runs **inside the app** by calling the Claude API directly (via a server-side backend — see §7).
- **Continuous, automatic state saving** — every meaningful event persists instantly. No "end prompt," no manual commit.
- **Resume anywhere** — quit mid-quiz, reopen, continue from that exact step.
- **Build new curricula in-app**: I describe a topic + goal, the AI generates a full roadmap, I review/edit/approve it, then learn through the same engine.
- Cloud-hosted, private to me only.
- Ships **seeded with my existing anti-jam curriculum** so it's usable on day one.

### Non-Goals (v1)
- Multi-user / sharing / accounts for other people. Single user (me).
- Mobile-native apps. Responsive web is enough.
- Keeping the GitHub repo in sync. Dropped entirely.
- Marketplace / public curriculum sharing.
- Spaced-repetition scheduling engine (may come later; see §10).

---

## 3. Core Concepts / Data Model

The app is a **curriculum engine**. One curriculum = one roadmap. The anti-jam curriculum is just the first instance.

**Entities:**

- **Curriculum**: title, description, subject, goal, end target, created date, status (active/archived). Has many Modules.
- **Module** (a "day" / unit / milestone): order index, title, objectives, status (`locked` / `available` / `in_progress` / `complete`). Has many Phases.
- **Phase**: the stages within a module. Default set: `theory`, `practical`, `quiz`. Each has a status and can hold its own conversation + artifacts. (Phase set should be configurable per curriculum, but default to these three.)
- **Session / Message log**: the running tutor conversation, tied to a curriculum + module + phase. This is what gets replayed as context so the tutor "remembers."
- **Note**: free-form learning notes captured during a module (the equivalent of the old `notes/` folder).
- **QuizResult**: module, score (e.g. 7/10), per-question detail, timestamp. Feeds a running quiz average.
- **Progress** (derived or stored): current curriculum, current module, current phase, % complete, last-updated, current focus string.
- **StuckLog** (optional, nice-to-have): debugging/blocked journal entries, like the old `STUCK.md`.

**Key principle:** the database *is* the memory. The old repo files map cleanly:
`progress.json` → Progress, `notes/` → Notes, `quiz_log.md` → QuizResults, `theory/` → Phase artifacts, `STUCK.md` → StuckLog.

---

## 4. Primary User Flows

### 4.1 Open & Resume (the "one button")
1. I open the app. Home screen shows the active curriculum with a progress bar and a single primary action: **"Continue — Day 3: <module title>, Quiz phase"** (whatever my exact resume point is).
2. I click it. The app loads that module/phase, replays the relevant conversation context to the tutor, and drops me straight into the dialogue where I left off.
3. There is no opener prompt to paste. The app constructs the tutor's context automatically from stored state.

### 4.2 Learning a module (theory → practical → quiz)
1. **Theory phase:** tutor explains, I ask questions, back-and-forth. When the tutor (and I) agree theory is done, the phase is marked complete — see §5 for *how* this is detected/saved.
2. **Practical phase:** tutor gives me hands-on work; I report results / paste output / take notes.
3. **Quiz phase:** tutor asks questions, scores me, a QuizResult is saved, quiz average updates.
4. Module marked complete → next module unlocks → progress bar advances.
5. **At every step above, state saves instantly and automatically.**

### 4.3 Build a new curriculum
1. I click "New Curriculum."
2. I enter: topic, my goal, target end-state, optional constraints (timeframe, my current level, hardware/tools I have).
3. The AI generates a **full proposed roadmap** (modules with objectives, suggested phases).
4. I review it in an editable view — reorder, rename, delete, edit objectives, add modules.
5. I approve → it becomes an active curriculum I can start learning immediately.

### 4.4 Browse / review past work
- See completed modules, my notes, quiz history, and past conversations for any module. Read-only review is fine.

---

## 5. The Critical Mechanic: Automatic State Capture

This is the heart of the app and the thing the old workflow did manually. The tutor's understanding of my progress must persist **instantly**, without me writing or pasting an end prompt.

**Chosen approach: structured tool/marker emission.**

- The tutor is instructed (via system prompt) to call **structured actions** when learning events happen, e.g.:
  - `mark_phase_complete(phase)`
  - `record_quiz_result(score, total, details)`
  - `save_note(content)`
  - `mark_module_complete()`
  - `log_stuck(entry)`
- The backend interprets these (via the API's tool-use feature, or a strict JSON block the backend parses) and writes to the database **the moment they're emitted**, mid-conversation.
- The user sees a natural tutoring conversation; the saving is invisible and immediate.
- Every chat message (mine and the tutor's) is also persisted as it happens, so the conversation itself is never lost and is replayable as resume context.

**Why this approach:** it makes "saving" deterministic and instant, which is the explicit #1 requirement, while keeping the conversation feeling natural. It directly replaces the "end prompt + Claude Code commit" with automatic writes.

**Resume context strategy:** when resuming a phase, the backend sends the tutor: (a) the curriculum + module objectives, (b) current progress summary, (c) the recent conversation history for that phase (with older history summarized if it gets long, to manage token cost).

---

## 6. Screens (for Claude Design)

1. **Home / Dashboard** — active curriculum card, progress bar (X/N modules, %), quiz average, current focus, big **Continue** button. List of other curricula. "New Curriculum" button.
2. **Module / Learning view** — the main tutoring screen. Shows current module + phase, phase progress (theory/practical/quiz indicator), the chat conversation, message input. Subtle, non-intrusive "saved" indicator so I trust it's persisting.
3. **Curriculum builder** — input form (topic, goal, target, level, constraints) → generated roadmap review/edit screen → approve.
4. **Curriculum overview** — the locked plan: all modules, their status, objectives. Click a module to review its notes/quizzes/conversation.
5. **Review screens** — notes list, quiz history, (optional) stuck log.

**Design tone:** focused, calm, single-primary-action per screen. The whole point is *less ceremony* — the UI should make "open → click → learn" feel effortless. Minimal chrome, clear "where am I / what's next."

---

## 7. Technical Architecture (for Claude Code)

**Hard constraint — API key security:** The Claude API key must live **server-side only** and never reach the browser. The app must therefore have a backend; a pure static frontend calling the API directly is explicitly disallowed because it would expose the key.

**Recommended stack (easiest cloud, key stays safe):**
- **Frontend + backend:** Next.js (React) — frontend pages + API routes in one deployable app.
- **Hosting:** Vercel (free tier sufficient for single user; API routes run server-side so the key is safe in an environment variable).
- **Database:** a hosted Postgres with a free tier (e.g. Vercel Postgres / Neon / Supabase Postgres). Use an ORM (e.g. Prisma) for the schema in §3.
- **AI:** Anthropic Claude API, called only from backend API routes. Use the latest available Claude model; make the model name a single config value that's easy to update.
- **Auth:** single-user. Simplest acceptable: one private deployment behind a single login (a password / passkey), so "no one but me" holds. No public signup.

**Backend responsibilities:**
- Hold the API key; proxy all tutor calls.
- Build tutor context (system prompt + curriculum/module/phase + conversation history) per request.
- Parse the tutor's structured actions (§5) and write to DB immediately.
- Curriculum generation endpoint (topic/goal in → structured roadmap out → saved as draft for review).
- CRUD for curricula, modules, notes, quiz results, progress.

**Seed data:** migrate my existing anti-jam curriculum into the DB at setup: the 28-day plan as Modules with objectives, current progress (Day 0 complete, ready for Day 1), and the tutor rules from `TUTOR_RULES.md` / `verification_protocol.md` as the tutor's system prompt for that curriculum.

**Cost control:** persist conversations but summarize old turns when building context to keep token usage (and bill) reasonable.

---

## 8. Tutor Behavior (system-prompt requirements)

- Acts as a rigorous tutor for the curriculum's subject, following any per-curriculum rules (the anti-jam one has a verification protocol — carry that over).
- Moves through phases theory → practical → quiz, but adapts to my questions.
- **Emits structured actions** (§5) at the right moments rather than asking me to record things.
- Doesn't advance a phase/module until its completion criteria are genuinely met (e.g. quiz actually taken and scored).
- Verification mindset: don't rubber-stamp my understanding; check it.

---

## 9. Success Criteria

- I can go from "open app" to "actively learning at my exact resume point" in **one click, zero pasting**.
- If I close the tab mid-quiz and reopen, I land back in that quiz with full context.
- After a session, my progress, notes, and quiz scores are already saved — I never run a save/commit step.
- I can generate, edit, and start a brand-new curriculum on a different topic without touching code.
- The API key is never present in any client-side code or network response.

---

## 10. Future / Out of Scope for v1 (parking lot)

- Spaced-repetition review scheduling across completed modules.
- Importing reference papers/PDFs as tutor context.
- Exporting a curriculum + my work to a portfolio (the old "portfolio-ready repo" goal).
- Multi-device sync niceties, offline mode.
- Voice / hands-free tutoring.
- Analytics on my learning pace.

---

## 11. Open Questions (decide before/with Claude Code)

1. **Tool-use vs JSON block** for structured actions — both work; tool-use is cleaner if the chosen model/SDK supports it well. Claude Code to pick during build.
2. **Phase configurability** — v1 can hardcode theory/practical/quiz; confirm whether new curricula ever need different phases.
3. **Auth method** — simple password vs passkey vs platform-level access protection. Pick the least-friction option that still means "only me."
4. **How much old conversation to replay** vs summarize on resume — tune for cost vs. continuity after first real use.
