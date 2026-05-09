import type { Metadata } from "next";
import { DM_Sans, Lora } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-dm-sans",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://claudewrapped.vercel.app"),
  title: "Claude Wrapped — Your Claude Code Scorecard",
  description:
    "See your Claude Code persona, total tokens, prompt frequency, peak hours, and streaks — then share a beautiful card. One command. Runs 100% locally.",
  keywords: [
    "Claude Code", "Claude Code stats", "Anthropic Claude", "Claude Code usage",
    "Claude wrapped", "Claude Code analytics", "Claude Code scorecard", "developer stats",
  ],
  authors: [{ name: "Phani Sai Ram Munipalli" }],
  openGraph: {
    title: "Claude Wrapped — Your Claude Code Scorecard",
    description:
      "See your Claude Code persona, tokens, streak, and peak hours. Generate a shareable card in seconds.",
    url: "https://claudewrapped.vercel.app",
    siteName: "Claude Wrapped",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Wrapped — Your Claude Code Scorecard",
    description:
      "See your Claude Code persona, tokens, streak, and peak hours. Generate a shareable card in seconds.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${lora.variable}`}>
      <body className={dmSans.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
