import { Fragment } from "react";
import { Icon } from "./Icon";

export type Phase = "theory" | "practical" | "quiz";

const phases: Phase[] = ["theory", "practical", "quiz"];
const labels: Record<Phase, string> = {
  theory: "Theory",
  practical: "Practical",
  quiz: "Quiz",
};

export function PhaseProgress({ current }: { current: Phase }) {
  const currentIdx = phases.indexOf(current);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {phases.map((p, i) => {
        const isDone = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <Fragment key={p}>
            <span className={`phase-pill ${isDone ? "done" : isCurrent ? "current" : ""}`}>
              {isDone && <Icon name="check" size={10} color="currentColor" strokeWidth={2.5} />}
              {!isDone && <span className="phase-pill-dot" />}
              {labels[p]}
            </span>
            {i < phases.length - 1 && (
              <span style={{ width: 24, height: 1, background: "var(--paper-edge)" }} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
