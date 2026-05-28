import "./globals.css";
import { Nav } from "@/components/Nav";
import { Topo } from "@/components/Topo";

export const metadata = {
  title: "Trailhead — Learn anything through a roadmap that remembers",
  description: "Learn anything through a roadmap that remembers where you are.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <div className="app">
          <Topo opacity={0.55} />
          <Nav />
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
