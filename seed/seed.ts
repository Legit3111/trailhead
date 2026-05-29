import { PrismaClient, CurriculumStatus, ModuleStatus, PhaseKind, PhaseStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Carries over the anti-jam verification protocol as this curriculum's tutor rules.
const ANTIJAM_TUTOR_RULES = `This is the 28-day anti-jam RF/SDR curriculum.
Enforce a strict verification protocol: do not accept the learner's claim of
understanding without checking it. Require evidence in practical phases (working
code, captured plots, correct reasoning). Quizzes are real retrieval practice.
Cover spread spectrum (FHSS/DSSS), jamming detection, SDR tooling (GNU Radio,
HackRF, RTL-SDR, PlutoSDR+), DSP fundamentals, diversity/excision/nulling.`;

// Minimal 28-day skeleton. Replace objectives with the real plan from
// curriculum/overview.md when migrating the full content.
const modules = Array.from({ length: 28 }, (_, i) => ({
  orderIndex: i,
  title: `Day ${i + 1}`,
  objectives: i === 0 ? "Setup complete; begin DSP fundamentals." : "TBD — fill from overview.md",
}));

const RESUME_ORDER_INDEX = 8; // Day 9, aligned with the current anti-jam sample transcript.

async function alignAntiJamResume(curriculumId: string) {
  const seededModules = await prisma.module.findMany({
    where: { curriculumId },
    orderBy: { orderIndex: "asc" },
    include: { phases: true },
  });

  const current = seededModules[RESUME_ORDER_INDEX] ?? seededModules[0];
  if (!current) return;

  await prisma.$transaction([
    ...seededModules.map((m) =>
      prisma.module.update({
        where: { id: m.id },
        data: {
          status:
            m.orderIndex < RESUME_ORDER_INDEX
              ? ModuleStatus.complete
              : m.orderIndex === RESUME_ORDER_INDEX
              ? ModuleStatus.in_progress
              : ModuleStatus.locked,
        },
      })
    ),
    ...current.phases.map((phase) =>
      prisma.phase.update({
        where: { id: phase.id },
        data: {
          status:
            phase.kind === PhaseKind.theory
              ? PhaseStatus.complete
              : phase.kind === PhaseKind.practical
              ? PhaseStatus.in_progress
              : PhaseStatus.not_started,
        },
      })
    ),
    prisma.curriculum.update({
      where: { id: curriculumId },
      data: {
        status: CurriculumStatus.active,
        currentModuleId: current.id,
        currentPhase: PhaseKind.practical,
      },
    }),
  ]);
}

async function main() {
  const existing = await prisma.curriculum.findFirst({
    where: { subject: "RF anti-jamming" },
  });
  if (existing) {
    await alignAntiJamResume(existing.id);
    console.log("Anti-jam curriculum already seeded:", existing.id);
    return;
  }

  const curriculum = await prisma.curriculum.create({
    data: {
      title: "Anti-Jam Curriculum",
      subject: "RF anti-jamming",
      description:
        "28-day self-directed curriculum: DSP fundamentals through multi-channel simulation and coherent hardware prototyping with PlutoSDR+.",
      goal: "Build foundational knowledge in RF anti-jamming techniques.",
      endTarget:
        "8-channel hybrid anti-jam simulator + 2-channel coherent hardware demo.",
      tutorSystem: ANTIJAM_TUTOR_RULES,
      status: CurriculumStatus.active,
      modules: {
        create: modules.map((m) => ({
          orderIndex: m.orderIndex,
          title: m.title,
          objectives: m.objectives,
          status:
            m.orderIndex === 0 ? ModuleStatus.available : ModuleStatus.locked,
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

  await alignAntiJamResume(curriculum.id);

  console.log("Seeded anti-jam curriculum:", curriculum.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
