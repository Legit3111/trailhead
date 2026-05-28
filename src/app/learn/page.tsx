"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Msg = { role: "user" | "assistant"; content: string };

function LearnInner() {
  const params = useSearchParams();
  const curriculumId = params.get("curriculum")!;
  const moduleId = params.get("module")!;
  const phase = params.get("phase") ?? "theory";
  // NOTE: a real build resolves phaseId from (moduleId, phase) via an API call.
  // Stubbed here; Claude Code should add GET /api/phase to fetch it.
  const [phaseId, setPhaseId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || busy) return;
    const text = input;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curriculumId,
          moduleId,
          phaseId,
          phase,
          userMessage: text,
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? "(no reply)" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <a href="/" style={{ color: "#9aa0aa", fontSize: 14 }}>
        ← Home
      </a>
      <h2 style={{ marginTop: 12 }}>Learning · {phase}</h2>

      <div
        style={{
          background: "#171a21",
          borderRadius: 12,
          padding: 16,
          minHeight: 320,
          marginTop: 12,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              margin: "10px 0",
              textAlign: m.role === "user" ? "right" : "left",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: m.role === "user" ? "#4f8cff" : "#262b35",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: 12,
                maxWidth: "85%",
                whiteSpace: "pre-wrap",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Reply to your tutor…"
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #2a2f3a",
            background: "#0f1115",
            color: "#e6e8ec",
          }}
        />
        <button
          onClick={send}
          disabled={busy}
          style={{
            background: "#4f8cff",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "0 20px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {busy ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}

export default function Learn() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <LearnInner />
    </Suspense>
  );
}
