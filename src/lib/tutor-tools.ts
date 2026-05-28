import type Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./prisma";
import { PhaseKind, PhaseStatus, ModuleStatus } from "@prisma/client";

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
      const phase = input.phase as PhaseKind;
      await prisma.phase.updateMany({
        where: { moduleId: ctx.moduleId, kind: phase },
        data: { status: PhaseStatus.complete },
      });
      return `Phase ${phase} marked complete.`;
    }
    case "record_quiz_result": {
      await prisma.quizResult.create({
        data: {
          curriculumId: ctx.curriculumId,
          moduleId: ctx.moduleId,
          score: Number(input.score),
          total: Number(input.total),
          details: (input.details as string) ?? null,
        },
      });
      return `Quiz result saved: ${input.score}/${input.total}.`;
    }
    case "save_note": {
      await prisma.note.create({
        data: {
          curriculumId: ctx.curriculumId,
          moduleId: ctx.moduleId,
          content: input.content as string,
        },
      });
      return "Note saved.";
    }
    case "mark_module_complete": {
      await prisma.module.update({
        where: { id: ctx.moduleId },
        data: { status: ModuleStatus.complete },
      });
      // Unlock the next module by order index.
      const current = await prisma.module.findUnique({
        where: { id: ctx.moduleId },
      });
      if (current) {
        const next = await prisma.module.findFirst({
          where: {
            curriculumId: ctx.curriculumId,
            orderIndex: current.orderIndex + 1,
          },
        });
        if (next) {
          await prisma.module.update({
            where: { id: next.id },
            data: { status: ModuleStatus.available },
          });
          await prisma.curriculum.update({
            where: { id: ctx.curriculumId },
            data: { currentModuleId: next.id, currentPhase: PhaseKind.theory },
          });
        }
      }
      return "Module marked complete; next module unlocked.";
    }
    case "log_stuck": {
      await prisma.stuckLog.create({
        data: {
          curriculumId: ctx.curriculumId,
          entry: input.entry as string,
        },
      });
      return "Stuck entry logged.";
    }
    default:
      return `Unknown tool: ${name}`;
  }
}
