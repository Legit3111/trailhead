"use client";

import { useEffect, useState } from "react";

type Resume = { moduleId: string; moduleTitle: string; phase: string };
type Active = {
  id: string;
  title: string;
  subject: string;
  progress: { completed: number; total: number; pct: number };
  quizAvg: number | null;
  resume: Resume;
};

export default function Home() {
  const [active, setActive] = useState<Active | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then((d) => setActive(d.curriculum))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Trailhead</h1>
      <p style={{ color: "#9aa0aa", marginTop: 0 }}>
        Pick up exactly where you left off.
      </p>

      {active ? (
        <section
          style={{
            background: "#171a21",
            borderRadius: 12,
            padding: 24,
            marginTop: 24,
          }}
        >
          <h2 style={{ margin: "0 0 8px" }}>{active.title}</h2>
          <div
            style={{
              height: 8,
              background: "#262b35",
              borderRadius: 99,
              overflow: "hidden",
              margin: "12px 0",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.round(active.progress.pct * 100)}%`,
                background: "#4f8cff",
              }}
            />
          </div>
          <p style={{ color: "#9aa0aa", fontSize: 14 }}>
            {active.progress.completed} / {active.progress.total} modules
            {active.quizAvg != null &&
              ` · quiz avg ${Math.round(active.quizAvg * 100)}%`}
          </p>
          <a
            href={`/learn?curriculum=${active.id}&module=${active.resume.moduleId}&phase=${active.resume.phase}`}
            style={{
              display: "inline-block",
              marginTop: 12,
              background: "#4f8cff",
              color: "#fff",
              padding: "14px 24px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Continue — {active.resume.moduleTitle} ({active.resume.phase})
          </a>
        </section>
      ) : (
        <p style={{ marginTop: 24 }}>
          No active curriculum yet. Seed the anti-jam one or build a new one.
        </p>
      )}

      <p style={{ marginTop: 32 }}>
        <a href="/curriculum/build" style={{ color: "#4f8cff" }}>
          + Build a new curriculum
        </a>
      </p>
    </div>
  );
}
