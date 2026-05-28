export function Topo({ opacity = 0.55 }: { opacity?: number }) {
  return (
    <svg
      className="app-topo"
      preserveAspectRatio="none"
      viewBox="0 0 1600 1000"
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <pattern id="grain" x="0" y="0" width="220" height="220" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="20" r="0.6" fill="var(--ink)" opacity="0.08" />
          <circle cx="60" cy="180" r="0.4" fill="var(--ink)" opacity="0.06" />
          <circle cx="140" cy="40" r="0.5" fill="var(--ink)" opacity="0.07" />
          <circle cx="200" cy="120" r="0.4" fill="var(--ink)" opacity="0.05" />
        </pattern>
      </defs>
      <rect width="1600" height="1000" fill="url(#grain)" />
      <g fill="none" stroke="var(--contour)" strokeWidth="0.7">
        <path d="M -100 820 Q 180 760, 380 800 T 760 740 T 1180 780 T 1700 720" />
        <path d="M -100 760 Q 180 690, 380 740 T 760 670 T 1180 720 T 1700 650" />
        <path d="M -100 700 Q 180 620, 380 680 T 760 600 T 1180 660 T 1700 580" />
        <path d="M -100 640 Q 180 550, 380 620 T 760 530 T 1180 600 T 1700 510" />
        <path d="M -100 580 Q 180 480, 380 560 T 760 460 T 1180 540 T 1700 440" />
        <path d="M -100 520 Q 180 410, 380 500 T 760 390 T 1180 480 T 1700 370" />
        <path d="M -100 460 Q 180 340, 380 440 T 760 320 T 1180 420 T 1700 300" />
        <path d="M -100 400 Q 180 270, 380 380 T 760 250 T 1180 360 T 1700 230" />
        <path d="M -100 340 Q 180 200, 380 320 T 760 180 T 1180 300 T 1700 160" />
        <path d="M -100 280 Q 180 130, 380 260 T 760 110 T 1180 240 T 1700 90" />
        <path d="M -100 220 Q 180 60, 380 200 T 760 40 T 1180 180 T 1700 20" />
        <path d="M -100 160 Q 180 -10, 380 140 T 760 -30 T 1180 120 T 1700 -50" />
      </g>
    </svg>
  );
}
