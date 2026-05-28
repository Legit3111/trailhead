import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CurriculumStatus } from "@prisma/client";

// GET /api/progress
// Returns the active curriculum with its resume point (current module + phase)
// and summary stats for the home screen's one-button "Continue".
export async function GET() {
  try {
    const curriculum = await prisma.curriculum.findFirst({
      where: { status: CurriculumStatus.active },
      orderBy: { updatedAt: "desc" },
      include: {
        modules: { orderBy: { orderIndex: "asc" }, include: { phases: true } },
        quizResults: true,
      },
    });

    if (!curriculum) {
      return NextResponse.json({ curriculum: null });
    }

    const total = curriculum.modules.length;
    const completed = curriculum.modules.filter(
      (m) => m.status === "complete"
    ).length;

    const quizAvg =
      curriculum.quizResults.length > 0
        ? curriculum.quizResults.reduce(
            (acc, q) => acc + q.score / q.total,
            0
          ) / curriculum.quizResults.length
        : null;

    const currentModule =
      curriculum.modules.find((m) => m.id === curriculum.currentModuleId) ??
      curriculum.modules.find((m) => m.status !== "complete") ??
      curriculum.modules[0];

    return NextResponse.json({
      curriculum: {
        id: curriculum.id,
        title: curriculum.title,
        subject: curriculum.subject,
        progress: { completed, total, pct: total ? completed / total : 0 },
        quizAvg,
        resume: {
          moduleId: currentModule?.id,
          moduleTitle: currentModule?.title,
          phase: curriculum.currentPhase ?? "theory",
        },
      },
    });
  } catch (err) {
    console.error("progress error:", err);
    return NextResponse.json({ error: "Failed to load progress." }, { status: 500 });
  }
}
