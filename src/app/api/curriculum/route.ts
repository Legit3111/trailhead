import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { CurriculumStatus, ModuleStatus, PhaseKind, PhaseStatus } from "@prisma/client";

type ParsedCurriculum = {
  title: string;
  subject: string;
  description: string;
  modules: { title: string; objectives: string }[];
};

function fallbackCurriculum(topic: string, goal?: string | null): ParsedCurriculum {
  const cleanTopic = topic.trim();
  return {
    title: cleanTopic,
    subject: goal?.trim() || `A practical roadmap for ${cleanTopic}`,
    description:
      "Generated locally because the model provider is not configured. Edit the draft before approving it.",
    modules: [
      { title: "Orientation and baseline", objectives: `Map the core concepts, prerequisites, and current skill gaps for ${cleanTopic}.` },
      { title: "Core techniques", objectives: "Practice the highest-leverage fundamentals with short feedback loops." },
      { title: "Guided project", objectives: "Apply the concepts to a small but realistic project and capture notes as you go." },
      { title: "Independent challenge", objectives: "Complete a capstone-style task and review weak spots." },
    ],
  };
}

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

    let parsed: ParsedCurriculum;

    if (!process.env.ANTHROPIC_API_KEY) {
      parsed = fallbackCurriculum(topic, goal);
    } else {
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

      try {
        parsed = JSON.parse(raw);
      } catch {
        return NextResponse.json(
          { error: "Model returned invalid JSON.", raw },
          { status: 502 }
        );
      }
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

    return NextResponse.json({ curriculum, generatedBy: process.env.ANTHROPIC_API_KEY ? "model" : "local" });
  } catch (err) {
    console.error("curriculum gen error:", err);
    return NextResponse.json(
      { error: "Curriculum generation failed." },
      { status: 500 }
    );
  }
}

// PATCH /api/curriculum
// Body: { id, action: "activate" }
// Promotes a reviewed draft to active and returns the resume URL context.
export async function PATCH(req: NextRequest) {
  try {
    const { id, action, modules } = await req.json();
    if (!id || action !== "activate") {
      return NextResponse.json({ error: "Expected id and action=activate." }, { status: 400 });
    }

    const existing = await prisma.curriculum.findUnique({
      where: { id },
      include: { modules: { orderBy: { orderIndex: "asc" } } },
    });

    if (!existing) return NextResponse.json({ error: "Curriculum not found." }, { status: 404 });

    const firstModule = existing.modules[0];
    if (!firstModule) {
      return NextResponse.json({ error: "Curriculum has no modules to start." }, { status: 422 });
    }

    const moduleUpdates = existing.modules.map((m, index) => {
      const edited = Array.isArray(modules) ? modules[index] : null;
      return {
        where: { id: m.id },
        data: {
          status: index === 0 ? ModuleStatus.in_progress : ModuleStatus.locked,
          ...(edited?.title ? { title: String(edited.title).slice(0, 200) } : {}),
          ...(edited?.objectives ? { objectives: String(edited.objectives) } : {}),
        },
      };
    });

    const curriculum = await prisma.curriculum.update({
      where: { id },
      data: {
        status: CurriculumStatus.active,
        currentModuleId: firstModule.id,
        currentPhase: PhaseKind.theory,
        modules: { update: moduleUpdates },
      },
      include: { modules: { orderBy: { orderIndex: "asc" } } },
    });

    return NextResponse.json({
      curriculum,
      resume: { curriculumId: curriculum.id, moduleId: firstModule.id, phase: PhaseKind.theory },
    });
  } catch (err) {
    console.error("curriculum activate error:", err);
    return NextResponse.json({ error: "Failed to activate curriculum." }, { status: 500 });
  }
}
