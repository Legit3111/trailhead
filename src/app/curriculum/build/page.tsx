"use client";

import { useState } from "react";

export default function BuildCurriculum() {
  const [form, setForm] = useState({
    topic: "",
    goal: "",
    target: "",
    level: "",
    constraints: "",
  });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function generate() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setResult(await res.json());
    } finally {
      setBusy(false);
    }
  }

  const field = (k: keyof typeof form, label: string, placeholder: string) => (
    <label style={{ display: "block", margin: "12px 0" }}>
      <div style={{ fontSize: 14, color: "#9aa0aa", marginBottom: 4 }}>
        {label}
      </div>
      <input
        value={form[k]}
        onChange={(e) => update(k, e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #2a2f3a",
          background: "#0f1115",
          color: "#e6e8ec",
          boxSizing: "border-box",
        }}
      />
    </label>
  );

  return (
    <div>
      <a href="/" style={{ color: "#9aa0aa", fontSize: 14 }}>
        ← Home
      </a>
      <h2 style={{ marginTop: 12 }}>Build a new curriculum</h2>
      <p style={{ color: "#9aa0aa", marginTop: 0 }}>
        Describe it. The AI drafts a roadmap; you review and approve.
      </p>

      {field("topic", "Topic", "e.g. Kalman filters for navigation")}
      {field("goal", "Goal", "What do you want to be able to do?")}
      {field("target", "Target end-state", "e.g. working demo / passing an exam")}
      {field("level", "Your current level", "beginner / intermediate / …")}
      {field("constraints", "Constraints", "timeframe, tools, hardware…")}

      <button
        onClick={generate}
        disabled={busy || !form.topic}
        style={{
          background: "#4f8cff",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "12px 24px",
          fontWeight: 600,
          cursor: "pointer",
          marginTop: 8,
        }}
      >
        {busy ? "Generating…" : "Generate roadmap"}
      </button>

      {result != null && (
        <pre
          style={{
            background: "#171a21",
            padding: 16,
            borderRadius: 12,
            marginTop: 20,
            overflow: "auto",
            fontSize: 13,
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
      <p style={{ color: "#6b7280", fontSize: 13, marginTop: 12 }}>
        Next build step: render the generated modules in an editable list with an
        &quot;Approve &amp; activate&quot; button (sets status to active).
      </p>
    </div>
  );
}
