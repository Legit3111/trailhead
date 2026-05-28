import type { ReactNode } from "react";

type Tone = "neutral" | "sage" | "clay" | "ink";

const tones: Record<Tone, { bg: string; fg: string; bd: string }> = {
  neutral: { bg: "var(--paper-2)", fg: "var(--ink-3)", bd: "var(--paper-edge)" },
  sage: { bg: "var(--sage-soft)", fg: "var(--sage-deep)", bd: "transparent" },
  clay: { bg: "var(--clay-soft)", fg: "var(--clay-deep)", bd: "transparent" },
  ink: { bg: "var(--ink)", fg: "var(--paper)", bd: "transparent" },
};

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  const t = tones[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--mono)",
        fontSize: 10.5,
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "4px 9px",
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
      }}
    >
      {children}
    </span>
  );
}
