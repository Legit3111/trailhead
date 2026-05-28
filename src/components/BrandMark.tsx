export function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="14" rx="10" ry="3.4" stroke="var(--ink)" strokeWidth="1" />
      <ellipse cx="12" cy="14" rx="7" ry="2.2" stroke="var(--ink)" strokeWidth="1" />
      <ellipse cx="12" cy="14" rx="4" ry="1.2" stroke="var(--ink)" strokeWidth="1" />
      <path
        d="M 13 14 L 13 4 L 19 6.5 L 13 9"
        fill="var(--clay)"
        stroke="var(--clay-deep)"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="14" r="1.4" fill="var(--clay)" />
    </svg>
  );
}
