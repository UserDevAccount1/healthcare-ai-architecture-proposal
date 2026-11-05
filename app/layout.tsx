import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Public_Sans, JetBrains_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--ff-display", weight: ["600", "700", "800"] });
const body = Public_Sans({ subsets: ["latin"], variable: "--ff-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--ff-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Care Ops AI Roadmap",
  description:
    "Solution architecture proposal: follow-up orchestration, a PHI-free pilot, and a governed path to member-level AI for a healthcare services organization.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
