import type Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./prisma";
import { PhaseKind } from "@prisma/client";

const BASE_TUTOR_RULES = `You are a rigorous personal tutor inside the Trailhead learning app.
You guide the learner through one module at a time, in phases: theory, then practical, then quiz.

Rules:
- Teach the current phase's material; adapt to the learner's questions.
- Do NOT rubber-stamp understanding. Check it before advancing.
- Advance a phase ONLY when its objectives are genuinely met. Use the
  mark_phase_complete tool to record this.
- In the quiz phase, actually quiz the learner, then call record_quiz_result
  with the real score.
- Capture key insights with save_note. Log blockers with log_stuck.
- When every phase of a module is complete, call mark_module_complete.
- Call tools the moment an event happens — saving is automatic and immediate.
- Keep the conversation natural; do not announce tool calls to the learner.`;

const RECENT_MESSAGE_LIMIT = 30; // replay window; older turns summarized later

// Builds the system prompt: base rules + curriculum-specific rules + current focus.
export async function buildSystemPrompt(
  curriculumId: string,
  moduleId: string,
  phase: PhaseKind
): Promise<string> {
  const curriculum = await prisma.curriculum.findUnique({
    where: { id: curriculumId },
  });
  const module = await prisma.module.findUnique({ where: { id: moduleId } });

  const parts = [BASE_TUTOR_RULES];

  if (curriculum?.tutorSystem) {
    parts.push(`\nCurriculum-specific rules:\n${curriculum.tutorSystem}`);
  }
  parts.push(
    `\nCurrent context:\nSubject: ${curriculum?.subject ?? "?"}\nGoal: ${
      curriculum?.goal ?? "?"
    }\nModule: ${module?.title ?? "?"}\nObjectives: ${
      module?.objectives ?? "(none specified)"
    }\nCurrent phase: ${phase}`
  );
  return parts.join("\n");
}

// Replays recent conversation for this phase as Anthropic message turns.
export async function buildMessageHistory(
  phaseId: string
): Promise<Anthropic.MessageParam[]> {
  const messages = await prisma.message.findMany({
    where: { phaseId },
    orderBy: { createdAt: "asc" },
    take: RECENT_MESSAGE_LIMIT,
  });

  return messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
}
