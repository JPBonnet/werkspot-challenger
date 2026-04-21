import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Werkspot Challenger",
  description: "Vakmensen voor jouw klus — eerlijk en snel betaald.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
