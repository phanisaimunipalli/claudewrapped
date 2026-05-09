"use client";

import { useState, useCallback, useRef, CSSProperties } from "react";
import dynamic from "next/dynamic";
import { toPng } from "html-to-image";
import { CardTheme } from "../components/StatsCard";

const StatsCard = dynamic(() => import("../components/StatsCard"), { ssr: false });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Stats = Record<string, any>;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  cream:       "#FAF8F4",
  creamDark:   "#F4EEE6",
  creamBorder: "#E8DDD0",
  creamMuted:  "#F0EAE0",
  white:       "#FFFFFF",
  textPrimary: "#1A1511",
  textSecond:  "#7A6E64",
  textMuted:   "#A89880",
  accent:      "#D97757",
  accentDark:  "#C4652A",
  codeBg:      "#F5F0E8",
  shadow:      "0 1px 3px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.05)",
  shadowLg:    "0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.08)",
};
const SERIF  = "var(--font-lora), 'Lora', Georgia, serif";
const SANS   = "var(--font-dm-sans), 'DM Sans', -apple-system, sans-serif";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TOPIC_EMOJI: Record<string, string> = {
  code: "⌨️", writing: "✍️", ai: "🤖", research: "🔍", planning: "🗺️",
};

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function buildCaption(stats: Stats): string {
  const topTopic = Object.entries(stats.topics as Record<string, number>).sort((a, b) => b[1] - a[1])[0];
  const hour = stats.peak_hour as number;
  const peakLabel = hour === 0 ? "12AM" : hour < 12 ? `${hour}AM` : hour === 12 ? "12PM" : `${hour - 12}PM`;
  const perDay = stats.avg_prompts_per_day as number;
  const percentile = perDay > 100 ? "Top 1%" : perDay > 60 ? "Top 3%" : perDay > 30 ? "Top 10%" : perDay > 15 ? "Top 25%" : "Top 50%";
  return [
    `My Claude Wrapped ✦`,
    ``,
    `${stats.persona} · ${percentile} of Claude Code users`,
    ``,
    `${(stats.total_prompts as number).toLocaleString()} prompts · ${fmt(stats.total_tokens as number)} tokens · ${stats.pages_written} pages`,
    ``,
    `Peak: ${peakLabel} on ${stats.peak_day}s · ${stats.streak_longest_days}-day streak`,
    `Mostly ${TOPIC_EMOJI[topTopic?.[0]] ?? ""} ${topTopic?.[0]} (${topTopic?.[1]}%)`,
    ``,
    `Get yours → claudewrapped.dev`,
  ].join("\n");
}

// ─── Copy command ─────────────────────────────────────────────────────────────

const CLI_CMD = "npx github:phanisaimunipalli/claudewrapped";

function CopyCommand() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(CLI_CMD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: C.codeBg, borderRadius: 10,
      border: `1px solid ${C.creamBorder}`,
      padding: "11px 14px", gap: 12,
    }}>
      <span style={{ fontFamily: "monospace", fontSize: 13, color: C.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        <span style={{ color: C.textMuted }}>$ </span>
        <span style={{ color: C.accent, fontWeight: 600 }}>{CLI_CMD}</span>
      </span>
      <button
        onClick={copy}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "5px 12px", borderRadius: 7, flexShrink: 0,
          background: copied ? hexToRgba(C.accent, 0.12) : C.white,
          border: `1px solid ${copied ? hexToRgba(C.accent, 0.3) : C.creamBorder}`,
          color: copied ? C.accent : C.textSecond,
          fontSize: 11, fontWeight: 700, cursor: "pointer",
          fontFamily: SANS, transition: "all 0.15s",
        }}
      >
        {copied ? (
          <>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy
          </>
        )}
      </button>
    </div>
  );
}

function CopyCommandDark() {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(CLI_CMD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "4px 10px", borderRadius: 6, flexShrink: 0,
        background: copied ? hexToRgba(C.accent, 0.15) : "rgba(255,255,255,0.08)",
        border: `1px solid ${copied ? hexToRgba(C.accent, 0.3) : "rgba(255,255,255,0.12)"}`,
        color: copied ? C.accent : "rgba(240,234,224,0.6)",
        fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: SANS,
        transition: "all 0.15s",
      }}
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

const GH_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

function Navbar({ hasStats, onReset, dark }: { hasStats: boolean; onReset: () => void; dark?: boolean }) {
  const navBg      = dark ? "rgba(7,6,10,0.80)"          : C.cream;
  const navBorder  = dark ? "rgba(255,255,255,0.07)"      : C.creamBorder;
  const logoColor  = dark ? "rgba(240,234,224,0.95)"      : C.textPrimary;
  const linkColor  = dark ? "rgba(240,234,224,0.45)"      : C.textMuted;
  const btnBg      = dark ? "rgba(255,255,255,0.06)"      : C.white;
  const btnBorder  = dark ? "rgba(255,255,255,0.12)"      : C.creamBorder;
  const btnColor   = dark ? "rgba(240,234,224,0.7)"       : C.textSecond;

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: navBg,
      backdropFilter: dark ? "blur(16px)" : undefined,
      WebkitBackdropFilter: dark ? "blur(16px)" : undefined,
      borderBottom: `1px solid ${navBorder}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px", height: 56,
      fontFamily: SANS,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: C.accent, fontSize: 14 }}>✦</span>
        <span style={{ color: logoColor, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>
          Claude Wrapped
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <a href="https://github.com/phanisaimunipalli/claudewrapped" target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 5, color: linkColor, fontSize: 12, fontWeight: 600, textDecoration: "none", padding: "6px 10px", borderRadius: 8 }}>
          {GH_ICON} GitHub
        </a>
        {hasStats && (
          <button onClick={onReset} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8,
            background: btnBg, border: `1px solid ${btnBorder}`,
            color: btnColor, fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: SANS, transition: "all 0.15s",
          }}>
            ↑ Upload another
          </button>
        )}
      </div>
    </nav>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ dark }: { dark?: boolean }) {
  const bg     = dark ? "rgba(255,255,255,0.03)"  : C.creamDark;
  const border = dark ? "rgba(255,255,255,0.07)"  : C.creamBorder;
  const text1  = dark ? "rgba(240,234,224,0.35)"  : C.textSecond;
  const text2  = dark ? "rgba(240,234,224,0.22)"  : C.textMuted;

  return (
    <footer style={{ background: bg, borderTop: `1px solid ${border}`, padding: "20px 28px", fontFamily: SANS }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: C.accent, fontSize: 11 }}>✦</span>
          <span style={{ color: text1, fontSize: 11, fontWeight: 600 }}>claudewrapped.dev</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <span style={{ color: text2, fontSize: 11 }}>No data leaves your browser</span>
          <span style={{ color: text2, fontSize: 11 }}>Built with Claude Code</span>
          <a href="https://github.com/phanisaimunipalli/claudewrapped" target="_blank" rel="noopener noreferrer"
            style={{ color: text2, fontSize: 11, textDecoration: "none", fontWeight: 600 }}>GitHub ↗</a>
        </div>
      </div>
    </footer>
  );
}

// ─── Card themes ──────────────────────────────────────────────────────────────

const BASE_THEMES: CardTheme[] = [
  {
    id: "claude-dark", name: "Dark",
    cardBg: "#0F0E0C", headerBg: "#0A0908", barBg: "#1E1916",
    border: "#2C2820", div: "#201D18",
    persona: "#F0EAE0", percentile: "#D4A574", promptText: "#C8B8A4",
    promptSub: "#5A5048", topicName: "#8A7868", footer: "#4A4038",
    token: "#D97757", tokenCtx: "#5A5048",
    badgeBg: "rgba(217,119,87,0.1)", badgeBorder: "rgba(217,119,87,0.22)", badgeText: "#D97757",
    accent: "#D97757",
    topicColors: { code: "#D97757", writing: "#C4956A", ai: "#A78BFA", research: "#60A5FA", planning: "#34D399" },
  },
  {
    id: "claude-light", name: "Light",
    cardBg: "#FDFBF8", headerBg: "#F8F4EE", barBg: "#EDE5D8",
    border: "#E8DDD0", div: "#EDE5D8",
    persona: "#1A1511", percentile: "#A8742A", promptText: "#3A3028",
    promptSub: "#9A8878", topicName: "#8A7868", footer: "#A89888",
    token: "#C8612E", tokenCtx: "#9A8878",
    badgeBg: "rgba(200,97,46,0.08)", badgeBorder: "rgba(200,97,46,0.2)", badgeText: "#C8612E",
    accent: "#C8612E",
    topicColors: { code: "#C8612E", writing: "#A07030", ai: "#7C5FD4", research: "#2E7AD4", planning: "#1A9E6A" },
  },
  {
    id: "midnight", name: "Midnight",
    cardBg: "#03070F", headerBg: "#020508", barBg: "#0A1020",
    border: "#0F1C30", div: "#0B1525",
    persona: "#E8F0FF", percentile: "#60A5FA", promptText: "#B8CCE8",
    promptSub: "#2E4A70", topicName: "#5A7898", footer: "#2A4060",
    token: "#3B82F6", tokenCtx: "#2E4A70",
    badgeBg: "rgba(59,130,246,0.1)", badgeBorder: "rgba(59,130,246,0.22)", badgeText: "#3B82F6",
    accent: "#3B82F6",
    topicColors: { code: "#3B82F6", writing: "#67E8F9", ai: "#818CF8", research: "#34D399", planning: "#A78BFA" },
  },
  {
    id: "sunset", name: "Sunset",
    cardBg: "#0C0604", headerBg: "#080402", barBg: "#1E100A",
    border: "#2E1808", div: "#221206",
    persona: "#FFF0E8", percentile: "#FB923C", promptText: "#E8C8A8",
    promptSub: "#603020", topicName: "#906040", footer: "#503020",
    token: "#F97316", tokenCtx: "#603020",
    badgeBg: "rgba(249,115,22,0.1)", badgeBorder: "rgba(249,115,22,0.22)", badgeText: "#F97316",
    accent: "#F97316",
    topicColors: { code: "#F97316", writing: "#FBBF24", ai: "#F43F5E", research: "#A3E635", planning: "#34D399" },
  },
  {
    id: "forest", name: "Forest",
    cardBg: "#030E06", headerBg: "#020904", barBg: "#081A0C",
    border: "#0F2814", div: "#0B1E0F",
    persona: "#E8F8EC", percentile: "#34D399", promptText: "#A8D8B8",
    promptSub: "#1E5030", topicName: "#4A8860", footer: "#1E4030",
    token: "#10B981", tokenCtx: "#1E5030",
    badgeBg: "rgba(16,185,129,0.1)", badgeBorder: "rgba(16,185,129,0.22)", badgeText: "#10B981",
    accent: "#10B981",
    topicColors: { code: "#10B981", writing: "#34D399", ai: "#60A5FA", research: "#A78BFA", planning: "#FBBF24" },
  },
  {
    id: "grape", name: "Grape",
    cardBg: "#080514", headerBg: "#05030E", barBg: "#110C28",
    border: "#1C1438", div: "#160F2E",
    persona: "#F0EAFF", percentile: "#A78BFA", promptText: "#C4B8E8",
    promptSub: "#3A2870", topicName: "#7060A8", footer: "#3A2870",
    token: "#8B5CF6", tokenCtx: "#3A2870",
    badgeBg: "rgba(139,92,246,0.1)", badgeBorder: "rgba(139,92,246,0.22)", badgeText: "#8B5CF6",
    accent: "#8B5CF6",
    topicColors: { code: "#8B5CF6", writing: "#EC4899", ai: "#F472B6", research: "#38BDF8", planning: "#34D399" },
  },
];

// ─── Frame backgrounds ────────────────────────────────────────────────────────

interface FrameDef { id: string; name: string; }

const FRAMES: FrameDef[] = [
  { id: "none",    name: "None"    },
  { id: "aurora",  name: "Aurora"  },
  { id: "glow",    name: "Glow"    },
  { id: "cosmic",  name: "Cosmic"  },
  { id: "mystic",  name: "Mystic"  },
  { id: "neon",    name: "Neon"    },
  { id: "crystal", name: "Crystal" },
  { id: "inferno", name: "Inferno" },
  { id: "ocean",   name: "Ocean"   },
  { id: "radiant", name: "Radiant" },
  { id: "velvet",  name: "Velvet"  },
  { id: "mesh",    name: "Mesh"    },
  { id: "noir",    name: "Noir"    },
  { id: "pearl",   name: "Pearl"   },
];

function frameCss(id: string, accent: string): string {
  const r = parseInt(accent.slice(1, 3), 16);
  const g = parseInt(accent.slice(3, 5), 16);
  const b = parseInt(accent.slice(5, 7), 16);
  switch (id) {
    case "aurora":
      return [
        `radial-gradient(ellipse 65% 50% at 20% 15%, rgba(${r},${g},${b},0.55) 0%, transparent 55%)`,
        `radial-gradient(ellipse 55% 45% at 80% 25%, rgba(139,92,246,0.45) 0%, transparent 55%)`,
        `radial-gradient(ellipse 50% 40% at 60% 85%, rgba(16,185,129,0.38) 0%, transparent 52%)`,
        `radial-gradient(ellipse 35% 30% at 10% 75%, rgba(59,130,246,0.3) 0%, transparent 48%)`,
        `#030508`,
      ].join(",");
    case "glow":
      return [
        `radial-gradient(ellipse 80% 55% at 50% -5%, rgba(${r},${g},${b},0.6) 0%, transparent 60%)`,
        `radial-gradient(ellipse 50% 35% at 50% 5%, rgba(${r},${g},${b},0.3) 0%, transparent 50%)`,
        `#000`,
      ].join(",");
    case "cosmic":
      return [
        `radial-gradient(ellipse 70% 55% at 75% 20%, rgba(120,60,220,0.55) 0%, transparent 55%)`,
        `radial-gradient(ellipse 60% 45% at 15% 65%, rgba(40,80,220,0.45) 0%, transparent 52%)`,
        `radial-gradient(ellipse 45% 35% at 85% 80%, rgba(80,20,180,0.38) 0%, transparent 48%)`,
        `radial-gradient(ellipse 30% 25% at 40% 40%, rgba(180,100,255,0.2) 0%, transparent 45%)`,
        `#020108`,
      ].join(",");
    case "mystic":
      return [
        `radial-gradient(ellipse 75% 55% at 30% 35%, rgba(20,190,170,0.5) 0%, transparent 55%)`,
        `radial-gradient(ellipse 65% 50% at 80% 65%, rgba(150,60,210,0.45) 0%, transparent 52%)`,
        `radial-gradient(ellipse 40% 35% at 65% 10%, rgba(30,210,190,0.32) 0%, transparent 48%)`,
        `radial-gradient(ellipse 35% 28% at 10% 90%, rgba(100,40,200,0.28) 0%, transparent 45%)`,
        `#020B0C`,
      ].join(",");
    case "neon":
      return [
        `radial-gradient(ellipse 60% 50% at 5% 50%, rgba(255,0,120,0.45) 0%, transparent 52%)`,
        `radial-gradient(ellipse 60% 50% at 95% 50%, rgba(0,220,255,0.4) 0%, transparent 52%)`,
        `radial-gradient(ellipse 80% 35% at 50% 100%, rgba(0,255,130,0.35) 0%, transparent 50%)`,
        `radial-gradient(ellipse 40% 30% at 50% 0%, rgba(180,0,255,0.25) 0%, transparent 45%)`,
        `#000`,
      ].join(",");
    case "crystal":
      return [
        `radial-gradient(ellipse 70% 50% at 50% -10%, rgba(140,220,255,0.55) 0%, transparent 55%)`,
        `radial-gradient(ellipse 55% 42% at 15% 70%, rgba(80,180,255,0.42) 0%, transparent 52%)`,
        `radial-gradient(ellipse 45% 38% at 85% 75%, rgba(200,240,255,0.35) 0%, transparent 48%)`,
        `radial-gradient(ellipse 35% 28% at 70% 30%, rgba(100,200,255,0.22) 0%, transparent 44%)`,
        `#010810`,
      ].join(",");
    case "inferno":
      return [
        `radial-gradient(ellipse 80% 60% at 50% 110%, rgba(255,80,20,0.7) 0%, transparent 55%)`,
        `radial-gradient(ellipse 60% 45% at 20% 90%, rgba(255,160,0,0.5) 0%, transparent 52%)`,
        `radial-gradient(ellipse 50% 38% at 80% 85%, rgba(220,40,0,0.45) 0%, transparent 48%)`,
        `radial-gradient(ellipse 35% 28% at 50% 50%, rgba(255,100,0,0.2) 0%, transparent 44%)`,
        `#090100`,
      ].join(",");
    case "ocean":
      return [
        `radial-gradient(ellipse 70% 55% at 50% 90%, rgba(0,210,190,0.5) 0%, transparent 55%)`,
        `radial-gradient(ellipse 60% 45% at 15% 30%, rgba(0,100,220,0.42) 0%, transparent 52%)`,
        `radial-gradient(ellipse 50% 40% at 85% 20%, rgba(0,230,160,0.35) 0%, transparent 48%)`,
        `radial-gradient(ellipse 35% 28% at 60% 55%, rgba(0,180,200,0.2) 0%, transparent 44%)`,
        `#010608`,
      ].join(",");
    case "radiant":
      return [
        `radial-gradient(ellipse 75% 60% at 50% -15%, rgba(255,195,40,0.65) 0%, transparent 58%)`,
        `radial-gradient(ellipse 55% 42% at 30% 20%, rgba(255,140,30,0.42) 0%, transparent 50%)`,
        `radial-gradient(ellipse 45% 35% at 75% 25%, rgba(255,220,80,0.32) 0%, transparent 46%)`,
        `radial-gradient(ellipse 30% 25% at 50% 15%, rgba(255,255,140,0.25) 0%, transparent 40%)`,
        `#080400`,
      ].join(",");
    case "velvet":
      return [
        `radial-gradient(ellipse 70% 55% at 25% 20%, rgba(200,20,60,0.5) 0%, transparent 55%)`,
        `radial-gradient(ellipse 60% 45% at 80% 70%, rgba(150,10,40,0.42) 0%, transparent 52%)`,
        `radial-gradient(ellipse 45% 35% at 70% 15%, rgba(220,40,80,0.3) 0%, transparent 48%)`,
        `radial-gradient(ellipse 35% 28% at 15% 80%, rgba(120,5,30,0.25) 0%, transparent 44%)`,
        `#060108`,
      ].join(",");
    case "mesh":
      return [
        `radial-gradient(at 0% 0%,    rgba(${r},${g},${b},0.6) 0px, transparent 50%)`,
        `radial-gradient(at 100% 0%,  rgba(139,92,246,0.5)     0px, transparent 50%)`,
        `radial-gradient(at 100% 100%,rgba(59,130,246,0.5)     0px, transparent 50%)`,
        `radial-gradient(at 0% 100%,  rgba(16,185,129,0.5)     0px, transparent 50%)`,
        `#050505`,
      ].join(",");
    case "noir":  return "#000000";
    case "pearl": return "linear-gradient(160deg, #F8F4EE 0%, #EDE5D8 60%, #F4EDE2 100%)";
    default:      return "transparent";
  }
}

// ─── Accent presets ───────────────────────────────────────────────────────────

const ACCENT_SWATCHES = [
  { color: "#D97757", label: "Coral"  },
  { color: "#F97316", label: "Orange" },
  { color: "#FBBF24", label: "Amber"  },
  { color: "#10B981", label: "Green"  },
  { color: "#3B82F6", label: "Blue"   },
  { color: "#8B5CF6", label: "Purple" },
  { color: "#EC4899", label: "Pink"   },
  { color: "#F43F5E", label: "Rose"   },
];

function applyAccent(theme: CardTheme, accent: string): CardTheme {
  return {
    ...theme, accent, token: accent, badgeText: accent,
    badgeBg: hexToRgba(accent, 0.1),
    badgeBorder: hexToRgba(accent, 0.22),
  };
}

// ─── Slider ───────────────────────────────────────────────────────────────────

function Slider({ label, value, min, max, step, onChange, format }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ color: C.textMuted, fontSize: 11, fontWeight: 600, minWidth: 52, letterSpacing: "0.04em", fontFamily: SANS }}>
        {label}
      </span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, cursor: "pointer" }}
      />
      <span style={{ color: C.textMuted, fontSize: 11, fontFamily: "monospace", minWidth: 36, textAlign: "right" }}>
        {format ? format(value) : value}
      </span>
    </div>
  );
}

// ─── Panel section label ──────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      color: C.textMuted, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.16em", textTransform: "uppercase",
      marginBottom: 12, fontFamily: SANS,
    }}>
      {children}
    </p>
  );
}

function Divider() {
  return <div style={{ height: 1, background: C.creamBorder, margin: "18px 0" }} />;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [threadsTip, setThreadsTip] = useState(false);

  const [activeThemeId, setActiveThemeId] = useState("claude-dark");
  const [activeFrameId, setActiveFrameId] = useState("aurora");
  const [customAccent, setCustomAccent] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [padding, setPadding] = useState(52);

  const cardRef  = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const baseTheme = BASE_THEMES.find((t) => t.id === activeThemeId) ?? BASE_THEMES[0];
  const theme     = customAccent ? applyAccent(baseTheme, customAccent) : baseTheme;
  const hasFrame  = activeFrameId !== "none";
  const bgCss     = hasFrame ? frameCss(activeFrameId, theme.accent) : "transparent";

  function parseFile(file: File) {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json.total_prompts && !json.total_sessions) {
          setError("Doesn't look like a claude-stats.json. Run: npx claudewrapped");
          return;
        }
        setStats(json);
      } catch {
        setError("Couldn't parse that file. Make sure it's the JSON from npx claudewrapped.");
      }
    };
    reader.readAsText(file);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, []);

  async function getPng(): Promise<string | null> {
    const target = hasFrame ? frameRef.current : cardRef.current;
    if (!target) return null;
    return toPng(target, { pixelRatio: 2, backgroundColor: hasFrame ? undefined : theme.cardBg });
  }

  async function downloadCard() {
    setDownloading(true);
    try {
      const url = await getPng(); if (!url) return;
      const a = document.createElement("a"); a.download = "claude-wrapped.png"; a.href = url; a.click();
    } finally { setDownloading(false); }
  }

  async function shareOnThreads() {
    if (!stats) return; setSharing(true);
    try {
      const url = await getPng();
      if (url) { const a = document.createElement("a"); a.download = "claude-wrapped.png"; a.href = url; a.click(); }
      await new Promise((r) => setTimeout(r, 400));
      window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildCaption(stats))}`, "_blank");
      setThreadsTip(true); setTimeout(() => setThreadsTip(false), 5000);
    } finally { setSharing(false); }
  }

  async function copyCaption() {
    if (!stats) return;
    await navigator.clipboard.writeText(buildCaption(stats));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  // ── Card view ───────────────────────────────────────────────────────────────

  if (stats) {
    const frameStyle: CSSProperties = hasFrame
      ? {
          background: bgCss,
          padding: `${padding}px ${Math.round(padding * 0.65)}px`,
          borderRadius: 24, overflow: "hidden",
          display: "flex", justifyContent: "center", alignItems: "center",
          width: "100%", maxWidth: 560,
        }
      : { display: "flex", justifyContent: "center", width: "100%", maxWidth: 480 };

    return (
      <div style={{ minHeight: "100vh", background: C.cream, display: "flex", flexDirection: "column" }}>
        <Navbar hasStats onReset={() => setStats(null)} />

        <main style={{
          flex: 1,
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "40px 16px 48px",
        }}>
          {/* Page heading */}
          <div style={{ width: "100%", maxWidth: 560, marginBottom: 28, textAlign: "center" }}>
            <p style={{ color: C.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8, fontFamily: SANS }}>
              ✦ Claude Wrapped
            </p>
            <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 600, color: C.textPrimary, letterSpacing: "-0.01em", lineHeight: 1.2, marginBottom: 6 }}>
              Your Scorecard
            </h1>
            <p style={{ color: C.textSecond, fontSize: 13, fontFamily: SANS }}>
              Customize your card, then download or share.
            </p>
          </div>

          {/* Canvas */}
          <div ref={frameRef} style={frameStyle}>
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "center center", width: "100%", maxWidth: 460, flexShrink: 0 }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <StatsCard stats={stats as any} cardRef={cardRef} theme={theme} />
            </div>
          </div>

          {/* Customize panel */}
          <div style={{
            width: "100%", maxWidth: 560, marginTop: 20,
            background: C.white, border: `1px solid ${C.creamBorder}`,
            borderRadius: 16, padding: "22px 22px",
            boxShadow: C.shadow,
          }}>
            {/* Card theme */}
            <SectionLabel>Card</SectionLabel>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 0 }}>
              {BASE_THEMES.map((t) => {
                const isActive = t.id === activeThemeId;
                return (
                  <button key={t.id} onClick={() => { setActiveThemeId(t.id); setCustomAccent(null); }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <div style={{
                      width: 52, height: 36, borderRadius: 8, background: t.cardBg,
                      border: `2px solid ${isActive ? t.accent : C.creamBorder}`,
                      boxShadow: isActive ? `0 0 0 2px ${hexToRgba(t.accent, 0.2)}` : "none",
                      position: "relative", overflow: "hidden", transition: "all 0.15s",
                    }}>
                      <div style={{ position: "absolute", top: 7, left: 7, right: 7 }}>
                        <div style={{ height: 3, borderRadius: 2, background: t.persona, opacity: 0.7, marginBottom: 3, width: "60%" }} />
                        <div style={{ height: 2, borderRadius: 2, background: t.footer, opacity: 0.5, width: "40%" }} />
                      </div>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: t.accent }} />
                    </div>
                    <span style={{ color: isActive ? t.accent : C.textMuted, fontSize: 10, fontWeight: isActive ? 700 : 500, fontFamily: SANS, transition: "color 0.15s" }}>
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <Divider />

            {/* Background */}
            <SectionLabel>Background</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: "10px 10px" }}>
              {FRAMES.map((fp) => {
                const isActive = fp.id === activeFrameId;
                const swBg = fp.id === "none"
                  ? `repeating-conic-gradient(${C.creamBorder} 0% 25%, ${C.cream} 0% 50%) 0 0 / 10px 10px`
                  : frameCss(fp.id, theme.accent);
                return (
                  <button key={fp.id} onClick={() => setActiveFrameId(fp.id)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <div style={{
                      width: "100%", aspectRatio: "3/2", borderRadius: 8, background: swBg,
                      border: `2px solid ${isActive ? theme.accent : C.creamBorder}`,
                      boxShadow: isActive ? `0 0 0 2px ${hexToRgba(theme.accent, 0.2)}` : "none",
                      transition: "all 0.15s",
                    }} />
                    <span style={{ color: isActive ? theme.accent : C.textMuted, fontSize: 10, fontWeight: isActive ? 700 : 500, fontFamily: SANS, transition: "color 0.15s" }}>
                      {fp.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <Divider />

            {/* Size */}
            <SectionLabel>Size</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Slider label="Scale" value={zoom} min={0.6} max={1.3} step={0.02}
                onChange={setZoom} format={(v) => `${Math.round(v * 100)}%`} />
              {hasFrame && (
                <Slider label="Padding" value={padding} min={16} max={96} step={4}
                  onChange={setPadding} format={(v) => `${v}px`} />
              )}
            </div>

            <Divider />

            {/* Accent */}
            <SectionLabel>Accent</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {ACCENT_SWATCHES.map((sw) => {
                const isActive = (customAccent ?? baseTheme.accent) === sw.color;
                return (
                  <button key={sw.color} onClick={() => setCustomAccent(sw.color)} title={sw.label}
                    style={{
                      width: 26, height: 26, borderRadius: "50%", background: sw.color,
                      border: "none", cursor: "pointer", flexShrink: 0,
                      outline: isActive ? `3px solid ${sw.color}` : "3px solid transparent",
                      outlineOffset: 2, transition: "outline 0.15s",
                    }} />
                );
              })}
              {/* Custom rainbow picker */}
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
                cursor: "pointer", flexShrink: 0, position: "relative", overflow: "hidden",
                border: `2px solid ${C.creamBorder}`,
              }}>
                <input type="color" defaultValue={customAccent ?? baseTheme.accent}
                  onChange={(e) => setCustomAccent(e.target.value)}
                  style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
              </div>
              {customAccent && (
                <button onClick={() => setCustomAccent(null)} style={{
                  padding: "3px 10px", borderRadius: 999, background: "transparent",
                  border: `1px solid ${C.creamBorder}`, color: C.textMuted, fontSize: 10,
                  fontWeight: 600, cursor: "pointer", fontFamily: SANS, whiteSpace: "nowrap",
                }}>
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Threads tip */}
          {threadsTip && (
            <div style={{
              marginTop: 14, padding: "10px 18px",
              background: hexToRgba(C.accent, 0.08),
              border: `1px solid ${hexToRgba(C.accent, 0.2)}`,
              borderRadius: 10, color: C.accentDark, fontSize: 12, textAlign: "center",
              maxWidth: 560, width: "100%", fontFamily: SANS,
            }}>
              Card downloaded! Attach <strong>claude-wrapped.png</strong> to your Threads post.
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 560, marginTop: 14 }}>
            <div style={{ display: "flex", gap: 10 }}>
              {/* Download */}
              <button onClick={downloadCard} disabled={downloading} style={{
                flex: 1, padding: "13px 0", borderRadius: 12, border: "none", cursor: "pointer",
                background: C.accent, color: "#fff", fontSize: 14, fontWeight: 700,
                opacity: downloading ? 0.6 : 1, fontFamily: SANS,
                boxShadow: `0 2px 8px ${hexToRgba(C.accent, 0.3)}`,
                transition: "opacity 0.15s",
              }}>
                {downloading ? "Generating..." : "⬇  Download Card"}
              </button>
              {/* Share */}
              <button onClick={shareOnThreads} disabled={sharing} style={{
                flex: 1, padding: "13px 0", borderRadius: 12, cursor: "pointer",
                background: C.white, border: `1px solid ${C.creamBorder}`,
                color: C.textPrimary, fontSize: 14, fontWeight: 700,
                opacity: sharing ? 0.6 : 1, boxShadow: C.shadow,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: SANS,
              }}>
                <svg width="14" height="14" viewBox="0 0 192 192" fill="currentColor">
                  <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.0364 44.7443 69.4573 51.1456 61.5625 62.0039L74.6925 71.6337C80.3397 63.8931 89.2657 61.3036 97.2301 61.3036C97.3173 61.3036 97.4047 61.3038 97.4919 61.3043C109.468 61.379 118.575 65.0824 124.569 72.2717C128.752 77.2812 131.565 84.1061 132.93 92.5987C125.424 91.3337 117.284 90.9986 108.639 91.5974C84.5979 93.2183 69.3927 107.01 70.3921 124.634C70.8965 133.573 75.6106 141.428 83.6965 146.499C90.5836 150.83 99.5167 152.961 108.802 152.479C121.173 151.834 130.97 147.14 137.843 138.537C143.054 131.984 146.338 123.461 147.796 112.811C153.035 116.008 156.871 120.44 159.008 125.89C162.787 135.647 162.999 151.013 150.56 163.307C139.758 173.969 126.718 178.687 107.408 178.832C85.8968 178.663 69.1215 171.909 57.5619 158.771C46.8499 146.574 41.3061 129.006 41.0703 107.013C41.3061 85.0198 46.8499 67.4521 57.5619 55.2549C69.1215 42.1177 85.8968 35.3637 107.408 35.195C129.092 35.3648 146.033 42.1474 157.582 55.3877C163.27 61.9141 167.534 70.1978 170.253 80.0007L185.338 75.9956C181.966 63.8275 176.414 53.4532 168.775 45.0777C154.238 28.6512 133.469 20.1809 107.485 20L107.408 20C81.4781 20.1809 60.8437 28.67 46.3399 45.0777C33.2926 59.7376 26.5298 80.0286 26.2939 107.013L26.2939 107.013C26.5298 134.001 33.2926 154.279 46.3399 168.939C60.8437 185.362 81.4781 193.849 107.408 194L107.485 194C130.807 193.851 148.851 187.368 162.186 174.161C180.892 155.645 180.38 132.385 174.186 117.914C169.872 107.649 161.659 99.3629 149.813 94.0571C148.498 92.2847 146.098 89.7652 141.537 88.9883ZM108.052 135.937C98.0112 136.454 87.5836 132.029 87.0781 123.535C86.6941 116.917 92.1072 109.558 109.304 108.417C111.661 108.261 113.991 108.185 116.293 108.185C123.23 108.185 129.718 108.895 135.595 110.262C133.22 130.261 120.862 135.303 108.052 135.937Z" />
                </svg>
                {sharing ? "Preparing..." : "Share on Threads"}
              </button>
            </div>
            {/* Copy caption */}
            <button onClick={copyCaption} style={{
              width: "100%", padding: "12px 0", borderRadius: 12, cursor: "pointer",
              background: "transparent", border: `1px solid ${C.creamBorder}`,
              color: copied ? C.accent : C.textMuted,
              fontSize: 13, fontWeight: 600, transition: "color 0.2s",
              fontFamily: SANS,
            }}>
              {copied ? "✓ Caption Copied!" : "Copy Caption for Threads / Twitter / LinkedIn"}
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ── Upload screen ───────────────────────────────────────────────────────────

  const DEMO_STATS = {
    generated_at: new Date().toISOString(),
    total_sessions: 120, total_prompts: 2990,
    total_tokens: 275_300_000, total_output_tokens: 180_000_000,
    pages_written: 847,
    first_session: "2025-01-15T09:00:00Z",
    last_session: new Date().toISOString(),
    days_active: 114, days_used: 18, avg_prompts_per_day: 166,
    cache_efficiency_pct: 95, streak_current_days: 3, streak_longest_days: 5,
    peak_hour: 21, peak_day: "Sat", night_owl_pct: 35, weekend_warrior: true,
    topics: { code: 45, ai: 30, research: 15, planning: 7, writing: 3 },
    top_projects: [], hour_distribution: [], day_distribution: {},
    persona: "The Deep Diver",
  };
  const DEMO_THEME = BASE_THEMES[0];
  const DEMO_FRAME = frameCss("aurora", DEMO_THEME.accent);

  // Subtle warm page gradient — Anthropic cream with very faint accent bloom top-right
  const pageBg = [
    `radial-gradient(ellipse 55% 45% at 100% 0%, ${hexToRgba(C.accent, 0.07)} 0%, transparent 60%)`,
    `radial-gradient(ellipse 40% 35% at 0% 80%, rgba(139,92,246,0.04) 0%, transparent 55%)`,
    C.cream,
  ].join(",");

  // Apple-style card shadow — layered for depth
  const appleShadow = "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.07)";

  return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", flexDirection: "column" }}>
      <Navbar hasStats={false} onReset={() => {}} />

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: pageBg }}>
        <div className="landing-wrap">

          {/* ── LEFT: content ── */}
          <div className="landing-left">

            {/* Eyebrow badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: hexToRgba(C.accent, 0.09), border: `1px solid ${hexToRgba(C.accent, 0.2)}`,
              borderRadius: 999, padding: "5px 14px", marginBottom: 22,
            }}>
              <span style={{ color: C.accent, fontSize: 11 }}>✦</span>
              <span style={{ color: C.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: SANS }}>
                Claude Wrapped
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: SERIF, fontSize: 48, fontWeight: 700,
              color: C.textPrimary, letterSpacing: "-0.03em", lineHeight: 1.1,
              marginBottom: 16,
            }}>
              Your Claude Code,{" "}
              <span style={{ fontStyle: "italic", color: C.accent }}>beautifully</span>
              <br />wrapped.
            </h1>

            <p style={{ color: C.textSecond, fontSize: 15, lineHeight: 1.65, marginBottom: 32, fontFamily: SANS, maxWidth: 380 }}>
              One command generates your stats. Upload the file. Get a shareable card.
            </p>

            {/* Step 1 — terminal */}
            <div style={{
              background: C.white,
              border: `1px solid ${C.creamBorder}`,
              borderRadius: 16, padding: "16px 18px", marginBottom: 10,
              boxShadow: appleShadow,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: hexToRgba(C.accent, 0.1), border: `1px solid ${hexToRgba(C.accent, 0.22)}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.accent, fontSize: 11, fontWeight: 800, flexShrink: 0,
                }}>1</div>
                <span style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: SANS }}>
                  Run in terminal
                </span>
              </div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                background: C.codeBg, border: `1px solid ${C.creamBorder}`,
                borderRadius: 10, padding: "10px 14px",
              }}>
                <span style={{ fontFamily: "monospace", fontSize: 13, color: C.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span style={{ color: C.textMuted }}>$ </span>
                  <span style={{ color: C.accent, fontWeight: 600 }}>{CLI_CMD}</span>
                </span>
                <CopyCommand />
              </div>
            </div>

            {/* Step 2 — drop zone */}
            <div style={{
              background: C.white,
              border: `1px solid ${C.creamBorder}`,
              borderRadius: 16, padding: "16px 18px",
              boxShadow: appleShadow,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: hexToRgba(C.accent, 0.1), border: `1px solid ${hexToRgba(C.accent, 0.22)}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.accent, fontSize: 11, fontWeight: 800, flexShrink: 0,
                }}>2</div>
                <span style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: SANS }}>
                  Upload your file
                </span>
              </div>
              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onClick={() => document.getElementById("fileInput")?.click()}
                style={{
                  border: `2px dashed ${dragging ? C.accent : C.creamBorder}`,
                  borderRadius: 12, padding: "24px 16px", textAlign: "center",
                  background: dragging ? hexToRgba(C.accent, 0.05) : C.creamMuted,
                  cursor: "pointer", transition: "all 0.18s",
                }}
              >
                <input id="fileInput" type="file" accept=".json" style={{ display: "none" }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); }} />
                <div style={{ fontSize: 22, marginBottom: 7, opacity: 0.45 }}>{dragging ? "✦" : "↑"}</div>
                <p style={{ color: C.textPrimary, fontWeight: 700, fontSize: 13, marginBottom: 3, fontFamily: SANS }}>
                  {dragging ? "Drop it!" : "Drop claude-stats.json here"}
                </p>
                <p style={{ color: C.textMuted, fontSize: 11, fontFamily: SANS }}>or click to browse</p>
              </div>
              {error && <p style={{ color: "#C0392B", fontSize: 12, marginTop: 8, fontFamily: SANS }}>{error}</p>}
            </div>

            <p style={{ color: C.textMuted, fontSize: 11, marginTop: 14, fontFamily: SANS }}>
              No server · No account · Nothing uploaded · 100% local
            </p>
          </div>

          {/* ── RIGHT: floating demo card ── */}
          <div className="landing-right">
            <div className="card-float" style={{ width: "100%", maxWidth: 400, position: "relative" }}>
              {/* Warm glow beneath */}
              <div style={{
                position: "absolute", bottom: -24, left: "12%", right: "12%", height: 48,
                background: `radial-gradient(ellipse at 50% 100%, ${hexToRgba(C.accent, 0.28)} 0%, transparent 70%)`,
                filter: "blur(18px)",
                pointerEvents: "none",
              }} />

              {/* Aurora frame — slightly lifted with a clean cream-friendly shadow */}
              <div style={{
                background: DEMO_FRAME,
                borderRadius: 24,
                padding: "28px 18px",
                display: "flex", justifyContent: "center", alignItems: "center",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 32px 72px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
                position: "relative",
              }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <StatsCard stats={DEMO_STATS as any} theme={DEMO_THEME} />
              </div>

              <p style={{ color: C.textMuted, fontSize: 11, textAlign: "center", marginTop: 14, fontFamily: SANS }}>
                14 backgrounds · 6 themes · custom accent color
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
