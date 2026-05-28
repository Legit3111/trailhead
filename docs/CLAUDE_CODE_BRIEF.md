# Brief for Claude Code

This repo is a **scaffold**, intentionally incomplete. Your job is to finish it
into a working app per `docs/PRD.md`. Don't rip out the architecture — extend it.

## Non-negotiables (from the PRD)
1. **API key stays server-side.** Never import `src/lib/anthropic.ts` into a
   client component. Never return the key or proxy raw key access to the browser.
2. **Saving is instant + automatic.** Keep the tool-call mechanic in
   `src/lib/tutor-tools.ts`. Every learning event persists the moment it fires.
   Do not reintroduce any manual "save"/"commit"/"end prompt" step.
3. **Resume must be exact.** Reopening lands the user in the same module + phase
   with conversation context intact.

## Start here (in order)
1. `npm install`, set `.env.local`, `npm run db:push`, `npm run db:seed`,
   `npm run dev`. Confirm the home screen loads the seeded anti-jam curriculum.
2. Add `GET /api/phase?module=<id>&phase=<kind>` returning the phase id; wire it
   into `src/app/learn/page.tsx` (currently stubbed as `phaseId = null`).
3. Verify the chat loop end-to-end: send a message, confirm a reply persists and
   that a `save_note`/`mark_phase_complete` tool call writes to the DB.
4. Build the curriculum review/approve UI (generate → edit modules → activate).
5. Add single-user auth before any public deploy.

## Watch out for
- The `as never` / `Anthropicish` casts in `api/chat/route.ts` are pragmatic
  shims around the SDK's tool_result typing — tighten them to the real SDK types.
- Verify the exact current Claude model string and the installed
  `@anthropic-ai/sdk` version's API shape before relying on tool-use details.
- `db:push` is fine for dev; switch to `prisma migrate` for real history.
