"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "./BrandMark";

type Tab = { href: string; label: string; match: (p: string) => boolean };
type ProgressResponse = {
  curriculum?: {
    id: string;
    resume: { moduleId: string; phase: string };
  } | null;
};

function continueUrl(progress: ProgressResponse | null) {
  const active = progress?.curriculum;
  if (!active?.id || !active.resume?.moduleId || !active.resume?.phase) return "/learn";
  return `/learn?curriculum=${active.id}&module=${active.resume.moduleId}&phase=${active.resume.phase}`;
}

export function Nav({ streakDays = 6, modelLabel = "claude-sonnet-4-5" }: { streakDays?: number; modelLabel?: string }) {
  const pathname = usePathname();
  const [progress, setProgress] = useState<ProgressResponse | null>(null);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => (r.ok ? r.json() : null))
      .then(setProgress)
      .catch(() => setProgress(null));
  }, []);

  const tabs: Tab[] = [
    { href: "/", label: "Home", match: (p) => p === "/" },
    { href: continueUrl(progress), label: "Continue", match: (p) => p.startsWith("/learn") },
    {
      href: "/curriculum/build",
      label: "New trail",
      match: (p) => p.startsWith("/curriculum"),
    },
  ];

  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        <BrandMark size={22} />
        Trailhead
      </Link>
      <div className="nav-tabs">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className={`nav-tab ${t.match(pathname) ? "active" : ""}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="nav-right">
        <span className="nav-streak">
          <span className="nav-streak-dot" />
          {streakDays}-day streak
        </span>
        <span style={{ width: 1, height: 16, background: "var(--paper-edge)" }} />
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>
          {modelLabel}
        </span>
      </div>
    </nav>
  );
}
