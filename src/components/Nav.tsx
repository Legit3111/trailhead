"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./BrandMark";

const tabs: { href: string; label: string; match: (p: string) => boolean }[] = [
  { href: "/", label: "Home", match: (p) => p === "/" },
  { href: "/learn", label: "Continue", match: (p) => p.startsWith("/learn") },
  {
    href: "/curriculum/build",
    label: "New trail",
    match: (p) => p.startsWith("/curriculum"),
  },
];

export function Nav({ streakDays = 6, modelLabel = "claude-sonnet-4-5" }: { streakDays?: number; modelLabel?: string }) {
  const pathname = usePathname();
  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        <BrandMark size={22} />
        Trailhead
      </Link>
      <div className="nav-tabs">
        {tabs.map((t) => (
          <Link
            key={t.href}
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
