"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { KeyHint } from "@/components/KeyHint";
import { Pill } from "@/components/Pill";
import { RoadmapTopo } from "@/components/RoadmapTopo";
import { StatNumber } from "@/components/StatNumber";
import { ToolChip } from "@/components/ToolChip";
import { OTHER_TRAILS, SAMPLE_CURRICULUM } from "@/lib/sample-curriculum";

type Resume = { moduleId: string; moduleTitle: string; phase: string };
type ApiCurriculum = {
  id: string;
  title: string;
  subject: string;
  progress: { completed: number; total: number; pct: number };
  quizAvg: number | null;
  resume: Resume;
};

export default function Home() {
  // Pull the live curriculum summary; fall back to the design's sample while the
  // database is empty so the topographic prototype renders out-of-the-box.
  const [apiActive, setApiActive] = useState<ApiCurriculum | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then((d) => setApiActive(d.curriculum ?? null))
      .catch(() => setApiActive(null))
      .finally(() => setLoaded(true));
  }, []);

  const c = SAMPLE_CURRICULUM;
  const progressPct = Math.round(((c.currentDay - 1) / c.days) * 100);
  const liveTitle = apiActive?.title ?? c.title;
  const liveSubtitle = apiActive?.subject ?? c.subtitle;

  const continueHref = apiActive
    ? `/learn?curriculum=${apiActive.id}&module=${apiActive.resume.moduleId}&phase=${apiActive.resume.phase}`
    : "/learn";

  const recent: { tool: string; label: string; when: string }[] = [
    { tool: "save_note", label: '"IQ vs real: real sees the wheel, IQ sees the stripe"', when: "2m ago" },
    { tool: "save_note", label: '"IQ file = interleaved I,Q,I,Q… cs8 means signed int8"', when: "8m ago" },
    { tool: "mark_phase_complete", label: "Day 9 · Theory complete", when: "11m ago" },
    { tool: "record_quiz_result", label: "Day 8 quiz · 92%", when: "yesterday" },
    { tool: "log_stuck", label: '"Gain staging math, revisit"', when: "yesterday" },
  ];

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "56px 32px 80px" }}>
      {/* Hero */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 56,
          alignItems: "end",
          marginBottom: 44,
        }}
      >
        <div>
          <Pill tone="neutral">Active trail · {c.startedAt} → today</Pill>
          <h1 className="display" style={{ marginTop: 14 }}>
            You&apos;re <em>{c.currentDay} days in.</em>
            <br />
            Pick up where you
            <br />
            left off.
          </h1>
          <p
            style={{
              marginTop: 18,
              fontSize: 17,
              color: "var(--ink-2)",
              maxWidth: 540,
              lineHeight: 1.55,
            }}
          >
            Day {c.currentDay} —{" "}
            <span style={{ color: "var(--ink)", fontWeight: 500 }}>
              Capturing a live signal
            </span>
            . You stopped mid-Practical after saving a note about IQ sampling. Two
            exercises left before the quiz.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 28, alignItems: "center" }}>
            <Link href={continueHref} className="btn btn-lg btn-clay">
              <Icon name="play" size={14} color="white" />
              Continue Day {c.currentDay} · Practical
            </Link>
            <button className="btn btn-lg btn-ghost" type="button">
              Open notebook
            </button>
            <span style={{ marginLeft: 8, color: "var(--ink-3)", fontSize: 13 }}>
              <KeyHint keys={["↵"]} /> to resume
            </span>
          </div>
          {loaded && !apiActive && (
            <p
              style={{
                marginTop: 18,
                fontSize: 12,
                color: "var(--ink-4)",
                fontFamily: "var(--mono)",
              }}
            >
              No active curriculum in the database — showing the seeded sample.
              Run <code>npm run db:seed</code> to switch to live data.
            </p>
          )}
        </div>

        {/* Stats column */}
        <div className="col" style={{ gap: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <StatNumber value={c.streak} label="Day streak" accent="var(--clay)" />
            <StatNumber
              value={`${apiActive?.quizAvg != null ? Math.round(apiActive.quizAvg * 100) : c.quizAvg}%`}
              label="Quiz avg"
            />
            <StatNumber value={c.notesCount} label="Notes saved" />
            <StatNumber value={`${c.hoursLogged}h`} label="Time logged" />
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              color: "var(--ink-3)",
              fontSize: 12,
              fontFamily: "var(--mono)",
            }}
          >
            <span
              style={{
                flex: 1,
                height: 4,
                background: "var(--paper-edge)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  display: "block",
                  width: `${progressPct}%`,
                  height: "100%",
                  background: "var(--sage)",
                }}
              />
            </span>
            <span>
              {progressPct}% · {c.currentDay - 1}/{c.days} days
            </span>
          </div>
        </div>
      </div>

      {/* Roadmap card */}
      <div className="card" style={{ padding: "28px 32px 24px", marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div>
            <div className="kicker" style={{ marginBottom: 6 }}>
              The Trail · {liveTitle}
            </div>
            <div className="serif" style={{ fontSize: 26, lineHeight: 1.1 }}>
              {liveSubtitle}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Pill tone="sage">
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 99,
                  background: "var(--sage-deep)",
                }}
              />{" "}
              {c.currentDay - 1} done
            </Pill>
            <Pill tone="clay">
              <span style={{ width: 6, height: 6, borderRadius: 99, background: "white" }} /> Day {c.currentDay} · here
            </Pill>
            <Pill tone="neutral">{c.days - c.currentDay} ahead</Pill>
          </div>
        </div>
        <RoadmapTopo modules={c.modules} onDayClick={() => { window.location.href = continueHref; }} />
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 8,
            color: "var(--ink-3)",
            fontSize: 12,
            justifyContent: "space-between",
          }}
        >
          <span className="mono">↳ Click any node to open it in the tutor.</span>
          <span className="mono">{c.days} days · ~45 min/day</span>
        </div>
      </div>

      {/* Other trails + recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 28 }}>
        <div className="card" style={{ padding: "22px 24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 14,
            }}
          >
            <div className="kicker">Other trails</div>
            <Link href="/curriculum/build" className="btn btn-sm btn-ghost">
              <Icon name="plus" size={12} /> New trail
            </Link>
          </div>
          <div className="col" style={{ gap: 2 }}>
            {OTHER_TRAILS.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: 16,
                  alignItems: "center",
                  padding: "12px 4px",
                  borderTop: "1px solid var(--paper-edge)",
                }}
              >
                <div className="col" style={{ gap: 2 }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{t.title}</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--ink-3)",
                      fontFamily: "var(--mono)",
                    }}
                  >
                    Day {t.day} of {t.total}
                  </div>
                </div>
                <div
                  style={{
                    width: 80,
                    height: 4,
                    background: "var(--paper-edge)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(t.day / t.total) * 100}%`,
                      height: "100%",
                      background: t.accent,
                    }}
                  />
                </div>
                <Icon name="chevron-r" size={14} color="var(--ink-3)" />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: "22px 24px" }}>
          <div className="kicker" style={{ marginBottom: 14 }}>
            Recent activity · auto-saved
          </div>
          <div className="col" style={{ gap: 14 }}>
            {recent.map((e, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <ToolChip tool={e.tool} label={e.label} />
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--ink-4)",
                    fontFamily: "var(--mono)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {e.when}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
