export type DayStatus = "done" | "current" | "queued";
export type DayNode = { n: number; title: string; status: DayStatus };
export type WeekModule = { week: number; title: string; days: DayNode[] };

const W = 1200;
const H = 320;

function bandY(week: number, t: number): number {
  const base = [60, 130, 200, 270][week] ?? 200;
  return base + Math.sin(t * Math.PI) * 14 + (t - 0.5) * (week % 2 ? 8 : -8);
}

function dayX(i: number): number {
  return 40 + (i / 6) * (W - 80);
}

export function RoadmapTopo({
  modules,
  onDayClick,
}: {
  modules: WeekModule[];
  onDayClick?: (day: DayNode & { week: number }) => void;
}) {
  type Placed = DayNode & { x: number; y: number; week: number };
  const all: Placed[] = [];
  modules.forEach((m, wi) => {
    m.days.forEach((d, di) => {
      const t = di / 6;
      all.push({ ...d, x: dayX(di), y: bandY(wi, t), week: wi });
    });
  });

  const trailD = all.map((n, i) => `${i === 0 ? "M" : "L"} ${n.x} ${n.y}`).join(" ");
  const currentIdx = all.findIndex((n) => n.status === "current");
  let doneEnd = currentIdx;
  if (doneEnd === -1) {
    for (let i = all.length - 1; i >= 0; i--) {
      if (all[i].status === "done") {
        doneEnd = i;
        break;
      }
    }
  }
  const doneD =
    doneEnd >= 0
      ? all
          .slice(0, doneEnd + 1)
          .map((n, i) => `${i === 0 ? "M" : "L"} ${n.x} ${n.y}`)
          .join(" ")
      : "";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <g fill="none" stroke="var(--contour)" strokeWidth="0.8" opacity="0.55">
        {[20, 60, 100, 150, 200, 250, 300].map((y, i) => (
          <path
            key={i}
            d={`M 0 ${y} Q 300 ${y - 18}, 600 ${y} T 1200 ${y + (i % 2 ? -10 : 10)}`}
          />
        ))}
      </g>
      <path
        d={trailD}
        fill="none"
        stroke="var(--paper-edge)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {doneD && (
        <path d={doneD} fill="none" stroke="var(--sage)" strokeWidth="2.4" strokeLinecap="round" />
      )}
      {all.map((n) => {
        const isCurrent = n.status === "current";
        const isDone = n.status === "done";
        return (
          <g
            key={n.n}
            onClick={() => onDayClick?.(n)}
            style={{ cursor: onDayClick ? "pointer" : "default" }}
          >
            {isCurrent && <circle cx={n.x} cy={n.y} r="14" fill="var(--clay-soft)" />}
            <circle
              cx={n.x}
              cy={n.y}
              r={isCurrent ? 6.5 : 4.5}
              fill={isCurrent ? "var(--clay)" : isDone ? "var(--sage)" : "var(--card)"}
              stroke={
                isCurrent ? "var(--clay-deep)" : isDone ? "var(--sage-deep)" : "var(--paper-edge)"
              }
              strokeWidth="1.2"
            />
            <text
              x={n.x}
              y={n.y + (n.week % 2 ? 22 : -12)}
              fontFamily="var(--mono)"
              fontSize="9"
              fill="var(--ink-3)"
              textAnchor="middle"
              letterSpacing="0.04em"
            >
              D{n.n}
            </text>
            {isCurrent && (
              <g>
                <line
                  x1={n.x}
                  y1={n.y - 14}
                  x2={n.x}
                  y2={n.y - 38}
                  stroke="var(--clay-deep)"
                  strokeWidth="1"
                />
                <path
                  d={`M ${n.x} ${n.y - 38} L ${n.x + 22} ${n.y - 33} L ${n.x} ${n.y - 28} z`}
                  fill="var(--clay)"
                  stroke="var(--clay-deep)"
                  strokeWidth="0.8"
                  strokeLinejoin="round"
                />
              </g>
            )}
          </g>
        );
      })}
      {modules.map((m, wi) => (
        <text
          key={wi}
          x="10"
          y={bandY(wi, 0) - 24}
          fontFamily="var(--mono)"
          fontSize="9.5"
          fill="var(--ink-3)"
          letterSpacing="0.16em"
        >
          WK {m.week} · {m.title.toUpperCase()}
        </text>
      ))}
    </svg>
  );
}
