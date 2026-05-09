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
  title: "Claude Wrapped — Your Claude Code Scorecard",
  description:
    "Generate a beautiful scorecard of your Claude Code usage. Upload your stats file and share on Threads, Twitter, or LinkedIn.",
  openGraph: {
    title: "Claude Wrapped",
    description: "Your Claude Code usage, beautifully visualized.",
    type: "website",
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
