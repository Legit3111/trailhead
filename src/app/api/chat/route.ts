import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL, MAX_TOKENS } from "@/lib/anthropic";
import { tutorTools, runTutorTool } from "@/lib/tutor-tools";
import { buildSystemPrompt, buildMessageHistory } from "@/lib/context";
import { prisma } from "@/lib/prisma";
import { PhaseKind, Role } from "@prisma/client";

// POST /api/chat
// Body: { curriculumId, moduleId, phaseId, phase, userMessage }
// Persists the user's message, runs the tutor (executing any tools it emits
// and saving instantly), persists the tutor reply, returns the reply.
export async function POST(req: NextRequest) {
  try {
    const { curriculumId, moduleId, phaseId, phase, userMessage } =
      await req.json();

    if (!curriculumId || !moduleId || !phaseId || !phase) {
      return NextResponse.json({ error: "Missing context." }, { status: 400 });
    }

    // 1. Persist the learner's message immediately.
    if (userMessage) {
      await prisma.message.create({
        data: {
          curriculumId,
          moduleId,
          phaseId,
          role: Role.user,
          content: userMessage,
        },
      });
    }

    const system = await buildSystemPrompt(
      curriculumId,
      moduleId,
      phase as PhaseKind
    );
    const messages = await buildMessageHistory(phaseId);

    // 2. Tutor loop: call the model, run any tools, repeat until it stops.
    const ctx = { curriculumId, moduleId, phaseId };
    let finalText = "";
    let guard = 0;

    while (guard++ < 6) {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        tools: tutorTools,
        messages,
      });

      const toolUses = response.content.filter((b) => b.type === "tool_use");
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { text: string }).text)
        .join("\n");
      if (text) finalText += (finalText ? "\n" : "") + text;

      messages.push({ role: "assistant", content: response.content });

      if (toolUses.length === 0 || response.stop_reason !== "tool_use") break;

      // Execute each tool and save instantly, then feed results back.
      const toolResults: Anthropicish[] = [];
      for (const tu of toolUses) {
        const t = tu as { id: string; name: string; input: Record<string, unknown> };
        const result = await runTutorTool(t.name, t.input, ctx);
        toolResults.push({
          type: "tool_result",
          tool_use_id: t.id,
          content: result,
        });
      }
      messages.push({ role: "user", content: toolResults as never });
    }

    // 3. Persist the tutor's reply.
    if (finalText) {
      await prisma.message.create({
        data: {
          curriculumId,
          moduleId,
          phaseId,
          role: Role.assistant,
          content: finalText,
        },
      });
    }

    return NextResponse.json({ reply: finalText });
  } catch (err) {
    console.error("chat error:", err);
    return NextResponse.json({ error: "Tutor request failed." }, { status: 500 });
  }
}

type Anthropicish = {
  type: "tool_result";
  tool_use_id: string;
  content: string;
};
