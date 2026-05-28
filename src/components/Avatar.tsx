export function Avatar({ kind }: { kind: "tutor" | "user" }) {
  if (kind === "tutor") {
    return (
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "var(--ink)",
          color: "var(--paper)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--serif)",
          fontSize: 16,
          lineHeight: 1,
          fontStyle: "italic",
          flexShrink: 0,
        }}
      >
        T
      </div>
    );
  }
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: "var(--clay-soft)",
        color: "var(--clay-deep)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--mono)",
        fontSize: 11,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      You
    </div>
  );
}
