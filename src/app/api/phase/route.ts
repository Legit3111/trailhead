import { NextRequest, NextResponse } from "next/server";
import { PhaseKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const VALID_PHASES = new Set(Object.values(PhaseKind));

// GET /api/phase?module=<moduleId>&phase=<theory|practical|quiz>
// Resolves the stable Phase row for a module + phase kind so the learning
// client can pass a concrete phaseId into /api/chat.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("module");
  const phase = searchParams.get("phase");

  if (!moduleId || !phase) {
    return NextResponse.json(
      { error: "Missing required query params: module and phase." },
      { status: 400 }
    );
  }

  if (!VALID_PHASES.has(phase as PhaseKind)) {
    return NextResponse.json(
      { error: `Invalid phase: ${phase}. Expected one of: ${[...VALID_PHASES].join(", ")}.` },
      { status: 400 }
    );
  }

  try {
    const phaseRow = await prisma.phase.findUnique({
      where: {
        moduleId_kind: {
          moduleId,
          kind: phase as PhaseKind,
        },
      },
      select: {
        id: true,
        moduleId: true,
        kind: true,
        status: true,
      },
    });

    if (!phaseRow) {
      return NextResponse.json({ error: "Phase not found." }, { status: 404 });
    }

    return NextResponse.json({ phase: phaseRow });
  } catch (err) {
    console.error("phase lookup error:", err);
    return NextResponse.json({ error: "Failed to resolve phase." }, { status: 500 });
  }
}
