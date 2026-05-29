import type Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./prisma";
import { PhaseKind, PhaseStatus, ModuleStatus } from "@prisma/client";

const PHASE_ORDER = [PhaseKind.theory, PhaseKind.practical, PhaseKind.quiz] as const;

function nextPhase(kind: PhaseKind): PhaseKind | null {
  const i = PHASE_ORDER.indexOf(kind);
  return i >= 0 ? PHASE_ORDER[i + 1] ?? null : null;
}

function parsePhase(value: unknown): PhaseKind | null {
  return typeof value === "string" && (PHASE_ORDER as readonly string[]).includes(value)
    ? (value as PhaseKind)
    : null;
}

/**
 * THE CRITICAL MECHANIC (PRD §5).
 * The tutor emits these tools mid-conversation. The backend executes them
 * the moment they fire, writing to the DB instantly. This replaces the old
 * "end prompt + Claude Code commit" with automatic, continuous saving.
 */

export const tutorTools: Anthropic.Tool[] = [
  {
    name: "mark_phase_complete",
    description:
      "Call when the current phase (theory/practical/quiz) is genuinely complete and the learner has met its objectives. Do not call to skip ahead.",
    input_schema: {
      type: "object",
      properties: {
        phase: { type: "string", enum: ["theory", "practical", "quiz"] },
      },
      required: ["phase"],
    },
  },
  {
    name: "record_quiz_result",
    description:
      "Call after a quiz is actually taken and scored. Records the score so the running average updates.",
    input_schema: {
      type: "object",
      properties: {
        score: { type: "number" },
        total: { type: "number" },
        details: {
          type: "string",
          description: "Optional per-question breakdown as JSON or text.",
        },
      },
      required: ["score", "total"],
    },
  },
  {
    name: "save_note",
    description:
      "Capture a concise learning note in the learner's interest (key insight, definition, gotcha).",
    input_schema: {
      type: "object",
      properties: { content: { type: "string" } },
      required: ["content"],
    },
  },
  {
    name: "mark_module_complete",
    description:
      "Call when all phases of the current module are complete. Unlocks the next module.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "log_stuck",
    description:
      "Record a blocker or debugging note the learner hit, for later review.",
    input_schema: {
      type: "object",
      properties: { entry: { type: "string" } },
      required: ["entry"],
    },
  },
];

type ToolContext = {
  curriculumId: string;
  moduleId: string;
  phaseId?: string | null;
};

// Executes a single tool call and persists immediately. Returns a short
// result string fed back to the model so it knows the save succeeded.
export async function runTutorTool(
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext
): Promise<string> {
  switch (name) {
    case "mark_phase_complete": {
      const phase = parsePhase(input.phase);
      if (!phase) return "Invalid phase; nothing saved.";

      const upcomingPhase = nextPhase(phase);
      await prisma.$transaction([
        prisma.phase.updateMany({
          where: { moduleId: ctx.moduleId, kind: phase },
          data: { status: PhaseStatus.complete },
        }),
        ...(upcomingPhase
          ? [
              prisma.phase.updateMany({
                where: { moduleId: ctx.moduleId, kind: upcomingPhase },
                data: { status: PhaseStatus.in_progress },
              }),
            ]
          : []),
        prisma.module.update({
          where: { id: ctx.moduleId },
          data: { status: ModuleStatus.in_progress },
        }),
        prisma.curriculum.update({
          where: { id: ctx.curriculumId },
          data: {
            currentModuleId: ctx.moduleId,
            currentPhase: upcomingPhase ?? phase,
          },
        }),
      ]);
      return upcomingPhase
        ? `Phase ${phase} marked complete; resume moved to ${upcomingPhase}.`
        : `Phase ${phase} marked complete.`;
    }
    case "record_quiz_result": {
      const score = Number(input.score);
      const total = Number(input.total);
      if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0 || score < 0 || score > total) {
        return "Invalid quiz result; nothing saved.";
      }

      await prisma.quizResult.create({
        data: {
          curriculumId: ctx.curriculumId,
          moduleId: ctx.moduleId,
          score: Math.round(score),
          total: Math.round(total),
          details: typeof input.details === "string" ? input.details : null,
        },
      });
      return `Quiz result saved: ${Math.round(score)}/${Math.round(total)}.`;
    }
    case "save_note": {
      const content = typeof input.content === "string" ? input.content.trim() : "";
      if (!content) return "Empty note ignored.";

      await prisma.note.create({
        data: {
          curriculumId: ctx.curriculumId,
          moduleId: ctx.moduleId,
          content,
        },
      });
      return "Note saved.";
    }
    case "mark_module_complete": {
      const current = await prisma.module.findFirst({
        where: { id: ctx.moduleId, curriculumId: ctx.curriculumId },
      });
      if (!current) return "Module not found; nothing saved.";

      const next = await prisma.module.findFirst({
        where: {
          curriculumId: ctx.curriculumId,
          orderIndex: current.orderIndex + 1,
        },
      });

      await prisma.$transaction([
        prisma.module.update({
          where: { id: ctx.moduleId },
          data: { status: ModuleStatus.complete },
        }),
        ...(next
          ? [
              prisma.module.update({
                where: { id: next.id },
                data: { status: ModuleStatus.available },
              }),
              prisma.curriculum.update({
                where: { id: ctx.curriculumId },
                data: { currentModuleId: next.id, currentPhase: PhaseKind.theory },
              }),
            ]
          : [
              prisma.curriculum.update({
                where: { id: ctx.curriculumId },
                data: { currentModuleId: ctx.moduleId, currentPhase: PhaseKind.quiz },
              }),
            ]),
      ]);

      return next
        ? "Module marked complete; next module unlocked."
        : "Final module marked complete.";
    }
    case "log_stuck": {
      const entry = typeof input.entry === "string" ? input.entry.trim() : "";
      if (!entry) return "Empty stuck entry ignored.";

      await prisma.stuckLog.create({
        data: {
          curriculumId: ctx.curriculumId,
          entry,
        },
      });
      return "Stuck entry logged.";
    }
    default:
      return `Unknown tool: ${name}`;
  }
}
