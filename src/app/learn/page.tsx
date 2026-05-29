"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { KeyHint } from "@/components/KeyHint";
import { Markdown } from "@/components/Markdown";
import { PhaseProgress, type Phase } from "@/components/PhaseProgress";
import { ToolChip } from "@/components/ToolChip";
import {
  SAMPLE_CURRICULUM,
  TRANSCRIPT,
  type SampleCurriculum,
  type TranscriptMessage,
} from "@/lib/sample-curriculum";

function LearnInner() {
  const searchParams = useSearchParams();
  const c = SAMPLE_CURRICULUM;
  const [messages, setMessages] = useState<TranscriptMessage[]>(TRANSCRIPT);
  const [input, setInput] = useState("");
  const [liveContext, setLiveContext] = useState<LiveContext | null>(null);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const curriculumId = searchParams.get("curriculum");
  const moduleId = searchParams.get("module");
  const requestedPhase = searchParams.get("phase");

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!curriculumId || !moduleId || !isPhase(requestedPhase)) {
      setLiveContext(null);
      return;
    }

    let cancelled = false;
    const phase = requestedPhase;
    fetch(`/api/phase?module=${encodeURIComponent(moduleId)}&phase=${encodeURIComponent(phase)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("phase lookup failed"))))
      .then((d) => {
        if (!cancelled) {
          setLiveContext({ curriculumId, moduleId, phaseId: d.phase.id, phase });
        }
      })
      .catch(() => {
        if (!cancelled) setLiveContext(null);
      });

    return () => {
      cancelled = true;
    };
  }, [curriculumId, moduleId, requestedPhase]);

  async function send() {
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", body: text }]);

    if (liveContext) {
      setIsSending(true);
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...liveContext, userMessage: text }),
        });
        if (!response.ok) throw new Error("chat failed");
        const data = await response.json();
        setMessages((m) => [
          ...m,
          {
            role: "tutor",
            body:
              data.reply ||
              "I saved that turn, but did not get tutor text back. Try again in a moment.",
          },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          {
            role: "tutor",
            body: "I could not reach the live tutor backend, so this turn was not saved. The prototype transcript is still available while the database/API config is fixed.",
          },
        ]);
      } finally {
        setIsSending(false);
      }
      return;
    }

    // Optimistic auto-save chip — mirrors the design's "auto-save just fires" feel.
    const snippet = text.slice(0, 48) + (text.length > 48 ? "…" : "");
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "tool", tool: "save_note", label: `Note saved · "${snippet}"` },
      ]);
    }, 500);
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "tutor",
          body: `Good — noted. Let me reframe with a concrete example before we move on.\n\nWhen you ran the capture, the waterfall should show a bright vertical strip at center frequency. The width of that strip is your station's modulation: roughly ±75 kHz for wideband FM. If you see fainter strips at ±19 kHz from center, that's the stereo pilot tone — proof you're seeing real broadcast structure, not just noise.`,
        },
      ]);
    }, 1400);
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr 340px",
        height: "calc(100vh - 56px)",
      }}
    >
      <LeftRail curriculum={c} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid var(--paper-edge)",
          borderRight: "1px solid var(--paper-edge)",
          background: "color-mix(in oklab, var(--paper) 50%, transparent)",
        }}
      >
        <div
          style={{
            padding: "18px 32px 16px",
            borderBottom: "1px solid var(--paper-edge)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            background: "var(--paper)",
          }}
        >
          <div className="col" style={{ gap: 8 }}>
            <div
              className="kicker"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <span>{c.title}</span>
              <Icon name="chevron-r" size={11} color="var(--ink-4)" />
              <span>Week 2 · SDR Hands-on</span>
              <Icon name="chevron-r" size={11} color="var(--ink-4)" />
              <span style={{ color: "var(--clay)" }}>Day {c.currentDay}</span>
            </div>
            <div className="serif" style={{ fontSize: 24, lineHeight: 1.1 }}>
              Capturing a live signal
            </div>
          </div>
          <PhaseProgress current={c.currentPhase as Phase} />
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px 32px 12px" }}>
          <div
            style={{
              maxWidth: 720,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {messages.map((m, i) => (
              <MessageRow key={i} msg={m} />
            ))}
          </div>
        </div>

        <Composer value={input} onChange={setInput} onSend={send} disabled={isSending} />
      </div>

      <ContextCard />
    </div>
  );
}

type LiveContext = {
  curriculumId: string;
  moduleId: string;
  phaseId: string;
  phase: Phase;
};

function isPhase(value: string | null): value is Phase {
  return value === "theory" || value === "practical" || value === "quiz";
}

function LeftRail({ curriculum }: { curriculum: SampleCurriculum }) {
  return (
    <div style={{ padding: "20px 14px", overflowY: "auto" }}>
      <Link
        href="/"
        className="btn btn-sm btn-ghost"
        style={{ width: "100%", justifyContent: "flex-start", marginBottom: 16 }}
      >
        <Icon name="compass" size={14} /> Home
      </Link>
      <div className="kicker" style={{ padding: "4px 10px", marginBottom: 8 }}>
        The trail
      </div>
      <div className="col" style={{ gap: 2 }}>
        {curriculum.modules.map((m, wi) => (
          <div key={wi} style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 10px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--ink-3)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Week {m.week} · {m.title}
              </span>
              <span
                style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--mono)" }}
              >
                {m.days.filter((d) => d.status === "done").length}/{m.days.length}
              </span>
            </div>
            {m.days.map((d) => {
              const isCurrent = d.status === "current";
              const isDone = d.status === "done";
              return (
                <div
                  key={d.n}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "7px 10px",
                    borderRadius: 6,
                    background: isCurrent ? "var(--card)" : "transparent",
                    border: `1px solid ${isCurrent ? "var(--card-edge)" : "transparent"}`,
                    color: isCurrent
                      ? "var(--ink)"
                      : isDone
                      ? "var(--ink-2)"
                      : "var(--ink-3)",
                    cursor: "pointer",
                    fontWeight: isCurrent ? 500 : 400,
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 99,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isCurrent
                        ? "var(--clay)"
                        : isDone
                        ? "var(--sage)"
                        : "transparent",
                      border: isDone || isCurrent ? "none" : "1px solid var(--paper-edge)",
                      color: "white",
                      fontSize: 9,
                    }}
                  >
                    {isDone && "✓"}
                    {isCurrent && (
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          background: "white",
                          borderRadius: 99,
                        }}
                      />
                    )}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      color: "var(--ink-4)",
                      minWidth: 22,
                    }}
                  >
                    D{d.n}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.title}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageRow({ msg }: { msg: TranscriptMessage }) {
  if (msg.role === "system") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
        <span style={{ flex: 1, height: 1, background: "var(--paper-edge)" }} />
        <span
          className={`phase-pill ${
            msg.status === "done" ? "done" : msg.status === "current" ? "current" : ""
          }`}
        >
          {msg.status === "done" && (
            <Icon name="check" size={10} color="currentColor" strokeWidth={2.5} />
          )}
          {msg.status === "current" && <span className="phase-pill-dot" />}
          {msg.label} {msg.status === "done" && "· complete"}
        </span>
        <span style={{ flex: 1, height: 1, background: "var(--paper-edge)" }} />
      </div>
    );
  }
  if (msg.role === "tool") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: 40 }}>
        <ToolChip tool={msg.tool} label={msg.label} />
      </div>
    );
  }
  if (msg.role === "tutor") {
    return (
      <div style={{ display: "flex", gap: 12 }}>
        <Avatar kind="tutor" />
        <div style={{ flex: 1, paddingTop: 2 }}>
          <div
            className="md"
            style={{ color: "var(--ink)", fontSize: 15, lineHeight: 1.6 }}
          >
            <Markdown text={msg.body} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
      <div
        style={{
          background: "var(--clay-soft)",
          color: "var(--ink)",
          padding: "10px 14px",
          borderRadius: 14,
          borderTopRightRadius: 4,
          maxWidth: "70%",
          fontSize: 14.5,
          lineHeight: 1.55,
        }}
      >
        {msg.body}
      </div>
      <Avatar kind="user" />
    </div>
  );
}

function Composer({
  value,
  onChange,
  onSend,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        padding: "16px 32px 22px",
        borderTop: "1px solid var(--paper-edge)",
        background: "var(--paper)",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          className="card"
          style={{
            padding: "10px 12px 10px 16px",
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Ask, answer, or take a note…"
            rows={1}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              resize: "none",
              fontFamily: "var(--sans)",
              fontSize: 15,
              lineHeight: 1.5,
              background: "transparent",
              color: "var(--ink)",
              padding: "6px 0",
              maxHeight: 120,
            }}
          />
          <button
            className="btn btn-sm"
            onClick={onSend}
            disabled={!value.trim() || disabled}
            style={{ opacity: value.trim() && !disabled ? 1 : 0.4 }}
            type="button"
          >
            <Icon name="send" size={13} color="var(--paper)" />
          </button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            fontSize: 11,
            color: "var(--ink-4)",
            fontFamily: "var(--mono)",
          }}
        >
          <span>
            Tutor auto-saves notes, phase progress, and quiz scores as the conversation
            moves.
          </span>
          <span>
            <KeyHint keys={["↵"]} /> send · <KeyHint keys={["⇧", "↵"]} /> newline
          </span>
        </div>
      </div>
    </div>
  );
}

function ContextCard() {
  const c = SAMPLE_CURRICULUM;
  const steps: { phase: string; label: string; status: "done" | "current" | "queued"; sub: string }[] = [
    { phase: "theory", label: "Theory — IQ sampling intuition", status: "done", sub: "~8 min · 2 notes saved" },
    { phase: "practical", label: "Practical — Capture FM band", status: "current", sub: "~25 min · in progress" },
    { phase: "quiz", label: "Quiz — 6 questions", status: "queued", sub: "~5 min · queued" },
  ];

  return (
    <div style={{ padding: "20px 22px", overflowY: "auto", background: "var(--paper)" }}>
      <div className="kicker">Day {c.currentDay} · plan</div>
      <div
        className="serif"
        style={{ fontSize: 22, lineHeight: 1.15, margin: "6px 0 14px" }}
      >
        Capturing a live signal
      </div>

      <div className="col" style={{ gap: 8, marginBottom: 18 }}>
        {steps.map((s) => (
          <div
            key={s.phase}
            style={{
              display: "flex",
              gap: 10,
              padding: "10px 12px",
              background: s.status === "current" ? "var(--clay-soft)" : "var(--card)",
              border: "1px solid",
              borderColor: s.status === "current" ? "transparent" : "var(--card-edge)",
              borderRadius: 10,
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 99,
                marginTop: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  s.status === "done"
                    ? "var(--sage)"
                    : s.status === "current"
                    ? "var(--clay)"
                    : "transparent",
                border: s.status === "queued" ? "1px dashed var(--paper-edge)" : "none",
                color: "white",
                fontSize: 10,
                flexShrink: 0,
              }}
            >
              {s.status === "done" ? "✓" : s.status === "current" ? "●" : ""}
            </span>
            <div className="col" style={{ gap: 2 }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)" }}>
                {s.label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  fontFamily: "var(--mono)",
                }}
              >
                {s.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="kicker" style={{ marginTop: 18 }}>
        Today&apos;s notes · 2
      </div>
      <div className="col" style={{ gap: 8, marginTop: 8, marginBottom: 18 }}>
        {[
          "IQ file = interleaved I,Q,I,Q… cs8 means signed int8",
          "IQ vs real: real sees the wheel, IQ sees the stripe",
        ].map((n, i) => (
          <div
            key={i}
            style={{
              padding: "10px 12px",
              background: "var(--card)",
              border: "1px solid var(--card-edge)",
              borderLeft: "3px solid var(--ochre)",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--ink-2)",
              lineHeight: 1.45,
            }}
          >
            <span style={{ fontStyle: "italic", fontFamily: "var(--serif)", fontSize: 15 }}>
              &quot;{n}&quot;
            </span>
          </div>
        ))}
      </div>

      <div className="kicker">Snapshot</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 8,
        }}
      >
        <StatBlock label="Streak" value="6d" tone="clay" />
        <StatBlock label="Day 8 quiz" value="92%" tone="sage" />
        <StatBlock label="Notes total" value="23" />
        <StatBlock label="Time today" value="0:42" />
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "clay" | "sage";
}) {
  const color =
    tone === "clay" ? "var(--clay)" : tone === "sage" ? "var(--sage-deep)" : "var(--ink)";
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "var(--card)",
        border: "1px solid var(--card-edge)",
        borderRadius: 8,
      }}
    >
      <div className="serif" style={{ fontSize: 22, lineHeight: 1, color }}>
        {value}
      </div>
      <div
        style={{
          fontSize: 10.5,
          color: "var(--ink-3)",
          fontFamily: "var(--mono)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<p style={{ padding: 32 }}>Loading…</p>}>
      <LearnInner />
    </Suspense>
  );
}
