import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { CurriculumStatus, ModuleStatus, PhaseKind, PhaseStatus } from "@prisma/client";

// POST /api/curriculum
// Body: { topic, goal, target, level, constraints }
// Generates a draft roadmap with the model and saves it as status=draft
// for the user to review/edit/approve before learning.
export async function POST(req: NextRequest) {
  try {
    const { topic, goal, target, level, constraints } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: "Topic required." }, { status: 400 });
    }

    const prompt = `Design a learning roadmap.

Topic: ${topic}
Goal: ${goal ?? "(unspecified)"}
Target end-state: ${target ?? "(unspecified)"}
Learner level: ${level ?? "(unspecified)"}
Constraints: ${constraints ?? "(none)"}

Return ONLY valid JSON, no prose, no markdown fences, in this exact shape:
{
  "title": string,
  "subject": string,
  "description": string,
  "modules": [
    { "title": string, "objectives": string }
  ]
}
Aim for a sensible number of modules for the scope. Each module is one focused unit.`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system:
        "You are a curriculum designer. Output strictly valid JSON and nothing else.",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    let parsed: {
      title: string;
      subject: string;
      description: string;
      modules: { title: string; objectives: string }[];
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Model returned invalid JSON.", raw },
        { status: 502 }
      );
    }

    // Save as a draft curriculum with phases per module.
    const curriculum = await prisma.curriculum.create({
      data: {
        title: parsed.title,
        subject: parsed.subject,
        description: parsed.description,
        goal: goal ?? null,
        endTarget: target ?? null,
        status: CurriculumStatus.draft,
        modules: {
          create: parsed.modules.map((m, i) => ({
            orderIndex: i,
            title: m.title,
            objectives: m.objectives,
            status: i === 0 ? ModuleStatus.available : ModuleStatus.locked,
            phases: {
              create: [PhaseKind.theory, PhaseKind.practical, PhaseKind.quiz].map(
                (kind) => ({ kind, status: PhaseStatus.not_started })
              ),
            },
          })),
        },
      },
      include: { modules: true },
    });

    return NextResponse.json({ curriculum });
  } catch (err) {
    console.error("curriculum gen error:", err);
    return NextResponse.json(
      { error: "Curriculum generation failed." },
      { status: 500 }
    );
  }
}
