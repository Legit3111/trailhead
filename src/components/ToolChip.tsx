type ToolName = "save_note" | "mark_phase_complete" | "record_quiz_result" | "log_stuck";

const meta: Record<ToolName, { cls: string; icon: string; verb: string }> = {
  save_note: { cls: "chip-note", icon: "✎", verb: "Note saved" },
  mark_phase_complete: { cls: "chip-phase", icon: "✓", verb: "Phase complete" },
  record_quiz_result: { cls: "chip-quiz", icon: "%", verb: "Quiz recorded" },
  log_stuck: { cls: "chip-stuck", icon: "!", verb: "Stuck logged" },
};

export function ToolChip({ tool, label }: { tool: ToolName | string; label: string }) {
  const m = meta[tool as ToolName] ?? { cls: "chip-note", icon: "·", verb: tool };
  return (
    <span className={`chip ${m.cls}`}>
      <span className="chip-icon" style={{ fontSize: 9, fontWeight: 700 }}>
        {m.icon}
      </span>
      <span style={{ fontFamily: "var(--mono)" }}>{label}</span>
      <span style={{ color: "var(--ink-4)", fontSize: 10 }}>· auto-saved</span>
    </span>
  );
}
