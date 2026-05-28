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

async function main() {
  const existing = await prisma.curriculum.findFirst({
    where: { subject: "RF anti-jamming" },
  });
  if (existing) {
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

  // Set resume pointer to Day 1, theory.
  await prisma.curriculum.update({
    where: { id: curriculum.id },
    data: {
      currentModuleId: curriculum.modules[0].id,
      currentPhase: PhaseKind.theory,
    },
  });

  console.log("Seeded anti-jam curriculum:", curriculum.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
