import type { ReactNode } from "react";

export function StatNumber({
  value,
  label,
  accent,
}: {
  value: ReactNode;
  label: string;
  accent?: string;
}) {
  return (
    <div className="col" style={{ gap: 4 }}>
      <div
        className="serif"
        style={{ fontSize: 38, lineHeight: 1, color: accent ?? "var(--ink)" }}
      >
        {value}
      </div>
      <div className="kicker">{label}</div>
    </div>
  );
}
