export function KeyHint({ keys }: { keys: string[] }) {
  return (
    <span style={{ display: "inline-flex", gap: 4 }}>
      {keys.map((k, i) => (
        <kbd
          key={i}
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10.5,
            padding: "1px 6px",
            border: "1px solid var(--paper-edge)",
            borderBottomWidth: 2,
            borderRadius: 4,
            background: "var(--card)",
            color: "var(--ink-3)",
          }}
        >
          {k}
        </kbd>
      ))}
    </span>
  );
}
