"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Pill } from "@/components/Pill";
import { BUILDER_DRAFT, type BuilderDraft } from "@/lib/sample-curriculum";

type Stage = "prompt" | "drafting" | "review";

export default function BuildPage() {
  const [stage, setStage] = useState<Stage>("prompt");
  const [topic, setTopic] = useState(BUILDER_DRAFT.topic);
  const [goal, setGoal] = useState("Implement a working 6-DOF EKF in Python");
  const [draft, setDraft] = useState<BuilderDraft>(BUILDER_DRAFT);
  const router = useRouter();

  function startDraft() {
    setStage("drafting");
    window.setTimeout(() => setStage("review"), 2200);
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "56px 32px 80px" }}>
      {stage === "prompt" && (
        <PromptStage
          topic={topic}
          setTopic={setTopic}
          goal={goal}
          setGoal={setGoal}
          onStart={startDraft}
        />
      )}
      {stage === "drafting" && <DraftingStage topic={topic} />}
      {stage === "review" && (
        <ReviewStage
          draft={draft}
          setDraft={setDraft}
          onApprove={() => router.push("/")}
          onBack={() => setStage("prompt")}
        />
      )}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: 12,
  padding: "6px 10px",
  borderRadius: 6,
  background: "var(--card)",
  border: "1px solid var(--card-edge)",
  color: "var(--ink-2)",
};

function PromptStage({
  topic,
  setTopic,
  goal,
  setGoal,
  onStart,
}: {
  topic: string;
  setTopic: (v: string) => void;
  goal: string;
  setGoal: (v: string) => void;
  onStart: () => void;
}) {
  const examples = [
    "Kalman filters for drone navigation",
    "Modal harmony for jazz piano",
    "Rust ownership from first principles",
    "WebGPU compute shaders",
  ];

  return (
    <div>
      <Pill tone="neutral">New trail</Pill>
      <h1 className="display" style={{ marginTop: 14, marginBottom: 16 }}>
        What do you want to <em>learn?</em>
      </h1>
      <p
        style={{
          color: "var(--ink-2)",
          fontSize: 17,
          maxWidth: 620,
          marginBottom: 32,
        }}
      >
        Describe the subject and what &quot;done&quot; looks like. The tutor drafts a
        phase-based roadmap; you edit it before committing.
      </p>

      <div className="card" style={{ padding: 24, marginBottom: 18 }}>
        <label className="kicker" style={{ display: "block", marginBottom: 8 }}>
          Topic
        </label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Modal harmony for jazz piano"
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--ink)",
            fontFamily: "var(--serif)",
            fontSize: 32,
            lineHeight: 1.2,
            padding: "4px 0",
            marginBottom: 18,
            borderBottom: "1px solid var(--paper-edge)",
          }}
        />
        <label className="kicker" style={{ display: "block", marginBottom: 8 }}>
          What does &quot;done&quot; look like?
        </label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          placeholder="e.g. Solo confidently over a Lydian dominant chord"
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            resize: "vertical",
            background: "transparent",
            color: "var(--ink-2)",
            fontFamily: "var(--sans)",
            fontSize: 15,
            lineHeight: 1.55,
            padding: "4px 0",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 22,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="kicker">Schedule</span>
            <select style={selectStyle} defaultValue="28">
              <option value="14">14 days</option>
              <option value="21">21 days</option>
              <option value="28">28 days</option>
              <option value="56">8 weeks</option>
            </select>
            <select style={selectStyle} defaultValue="45">
              <option value="30">30 min / day</option>
              <option value="45">45 min / day</option>
              <option value="60">1 hr / day</option>
            </select>
            <select style={selectStyle} defaultValue="intermediate">
              <option>beginner</option>
              <option>intermediate</option>
              <option>advanced</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          className="btn btn-lg btn-clay"
          onClick={onStart}
          disabled={!topic.trim()}
          type="button"
        >
          <Icon name="sparkles" size={14} color="white" /> Draft the roadmap
        </button>
        <span style={{ color: "var(--ink-3)", fontSize: 13 }}>
          ~10 sec · always editable after
        </span>
      </div>

      <div style={{ marginTop: 48 }}>
        <div className="kicker" style={{ marginBottom: 12 }}>
          Or start from an example
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 10,
          }}
        >
          {examples.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setTopic(e)}
              style={{
                textAlign: "left",
                padding: "14px 16px",
                background: "var(--card)",
                border: "1px solid var(--card-edge)",
                borderRadius: 10,
                color: "var(--ink-2)",
                cursor: "pointer",
                fontFamily: "var(--sans)",
                fontSize: 14.5,
              }}
            >
              <span
                style={{
                  color: "var(--clay)",
                  marginRight: 8,
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                }}
              >
                ↳
              </span>
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DraftingStage({ topic }: { topic: string }) {
  const steps = [
    "Researching scope and prerequisites",
    "Decomposing into phases",
    "Sequencing into daily units",
    "Writing per-day objectives",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const ids = steps.map((_, i) =>
      window.setTimeout(() => setStep(i + 1), (i + 1) * 500)
    );
    return () => ids.forEach((id) => window.clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: "80px 0", textAlign: "center" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 24,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 99,
            background: "var(--clay)",
            animation: "pulse 1.4s ease infinite",
          }}
        />
        <span className="kicker" style={{ color: "var(--clay)" }}>
          Drafting
        </span>
      </div>
      <h2 className="serif" style={{ fontSize: 38, marginBottom: 8 }}>
        {topic}
      </h2>
      <p style={{ color: "var(--ink-3)", fontSize: 14 }}>
        The tutor is sketching a roadmap.
      </p>

      <div
        className="col"
        style={{
          gap: 10,
          maxWidth: 380,
          margin: "40px auto 0",
          textAlign: "left",
        }}
      >
        {steps.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: "8px 12px",
              background: "var(--card)",
              border: "1px solid var(--card-edge)",
              borderRadius: 8,
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 99,
                background: i < step ? "var(--sage)" : "var(--paper-2)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 9,
                flexShrink: 0,
              }}
            >
              {i < step && "✓"}
            </span>
            <span style={{ fontSize: 14, color: i < step ? "var(--ink)" : "var(--ink-3)" }}>
              {s}
            </span>
            {i === step && (
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--clay)",
                }}
              >
                …
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  padding: "4px 8px",
  cursor: "pointer",
  borderRadius: 4,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

function ReviewStage({
  draft,
  setDraft,
  onApprove,
  onBack,
}: {
  draft: BuilderDraft;
  setDraft: (d: BuilderDraft) => void;
  onApprove: () => void;
  onBack: () => void;
}) {
  const [editingDay, setEditingDay] = useState<string | null>(null);

  function updateDay(wi: number, di: number, value: string) {
    const next: BuilderDraft = {
      ...draft,
      modules: draft.modules.map((m) => ({ ...m, days: [...m.days] })),
    };
    next.modules[wi].days[di] = value;
    setDraft(next);
  }

  return (
    <div>
      <Pill tone="sage">Draft ready</Pill>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: 14,
          gap: 24,
        }}
      >
        <div>
          <h1 className="serif" style={{ fontSize: 44, lineHeight: 1.05, margin: 0 }}>
            {draft.topic}
          </h1>
          <p
            style={{
              color: "var(--ink-2)",
              fontSize: 16,
              marginTop: 10,
              maxWidth: 600,
            }}
          >
            <span className="text-clay">Goal:</span> {draft.goal}
          </p>
        </div>
        <div className="col" style={{ gap: 6, alignItems: "flex-end" }}>
          <Pill tone="ink">
            {draft.weeks} weeks · {draft.weeks * 5} days
          </Pill>
          <span
            style={{ fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--mono)" }}
          >
            ≈ 45 min / day
          </span>
        </div>
      </div>

      <div className="col" style={{ gap: 16, marginTop: 32 }}>
        {draft.modules.map((m, wi) => (
          <div key={wi} className="card" style={{ padding: "20px 24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 14,
              }}
            >
              <div>
                <div className="kicker">Week {m.week}</div>
                <div
                  className="serif"
                  style={{ fontSize: 22, lineHeight: 1.1, marginTop: 4 }}
                >
                  {m.title}
                </div>
              </div>
              <button className="btn btn-sm btn-ghost" type="button">
                <Icon name="edit" size={12} /> Rename
              </button>
            </div>
            <div className="col" style={{ gap: 4 }}>
              {m.days.map((d, di) => {
                const key = `${wi}-${di}`;
                const isEditing = editingDay === key;
                return (
                  <div
                    key={di}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: isEditing ? "var(--paper-2)" : "transparent",
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                        color: "var(--ink-3)",
                      }}
                    >
                      D{wi * 5 + di + 1}
                    </span>
                    {isEditing ? (
                      <input
                        autoFocus
                        value={d}
                        onChange={(e) => updateDay(wi, di, e.target.value)}
                        onBlur={() => setEditingDay(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setEditingDay(null);
                        }}
                        style={{
                          flex: 1,
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          fontFamily: "var(--sans)",
                          fontSize: 14.5,
                          color: "var(--ink)",
                          borderBottom: "1px solid var(--clay)",
                          padding: "2px 0",
                        }}
                      />
                    ) : (
                      <span
                        onClick={() => setEditingDay(key)}
                        style={{
                          flex: 1,
                          fontSize: 14.5,
                          color: "var(--ink)",
                          cursor: "text",
                        }}
                      >
                        {d}
                      </span>
                    )}
                    <button
                      onClick={() => setEditingDay(key)}
                      style={iconBtn}
                      type="button"
                    >
                      <Icon name="edit" size={12} color="var(--ink-3)" />
                    </button>
                  </div>
                );
              })}
              <button
                type="button"
                style={{
                  ...iconBtn,
                  alignSelf: "flex-start",
                  marginLeft: 40,
                  marginTop: 4,
                  color: "var(--ink-3)",
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                }}
              >
                <Icon name="plus" size={11} color="var(--ink-3)" /> Add day
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "sticky",
          bottom: 0,
          marginTop: 32,
          background: "color-mix(in oklab, var(--paper) 80%, transparent)",
          backdropFilter: "blur(8px)",
          padding: "16px 0",
          borderTop: "1px solid var(--paper-edge)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button className="btn btn-ghost btn-sm" onClick={onBack} type="button">
          ← Refine prompt
        </button>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "var(--ink-3)", fontSize: 13 }}>
            You can keep editing any day inside the tutor.
          </span>
          <button className="btn btn-ghost" type="button">
            Save as draft
          </button>
          <button className="btn btn-clay" onClick={onApprove} type="button">
            Approve &amp; start Day 1 <Icon name="arrow-right" size={13} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
