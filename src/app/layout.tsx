export const metadata = {
  title: "Trailhead",
  description: "Learn anything through a roadmap that remembers where you are.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: 0,
          background: "#0f1115",
          color: "#e6e8ec",
        }}
      >
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
