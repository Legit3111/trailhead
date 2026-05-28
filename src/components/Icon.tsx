type IconName =
  | "arrow-right"
  | "check"
  | "play"
  | "plus"
  | "edit"
  | "note"
  | "sparkles"
  | "spectrum"
  | "send"
  | "chevron-r"
  | "compass"
  | "flame"
  | "menu";

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 16, color = "currentColor", strokeWidth = 1.6 }: Props) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "arrow-right":
      return <svg {...p}><path d="M5 12h14M13 5l7 7-7 7" /></svg>;
    case "check":
      return <svg {...p}><path d="M5 12l5 5 9-12" /></svg>;
    case "play":
      return <svg {...p}><path d="M6 4l14 8-14 8z" fill={color} stroke="none" /></svg>;
    case "plus":
      return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case "edit":
      return <svg {...p}><path d="M4 20h4l11-11-4-4L4 16v4z" /></svg>;
    case "note":
      return <svg {...p}><path d="M5 4h11l4 4v12H5z" /><path d="M9 12h7M9 16h5" /></svg>;
    case "sparkles":
      return <svg {...p}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l4 4M14 14l4 4M18 6l-4 4M10 14l-4 4" /></svg>;
    case "spectrum":
      return <svg {...p}><path d="M3 18h2v-4h2v6h2V8h2v12h2v-9h2v9h2V13h2v5h2" /></svg>;
    case "send":
      return <svg {...p}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>;
    case "chevron-r":
      return <svg {...p}><path d="M9 6l6 6-6 6" /></svg>;
    case "compass":
      return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5.5-5.5 2 2-5.5z" /></svg>;
    case "flame":
      return <svg {...p}><path d="M12 3s4 5 4 9a4 4 0 1 1-8 0c0-2 1-3 2-4-1 4 2 5 2 5s-2-5 0-10z" /></svg>;
    case "menu":
      return <svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    default:
      return null;
  }
}
