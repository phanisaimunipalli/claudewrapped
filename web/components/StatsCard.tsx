"use client";

import { useEffect, useRef, useState } from "react";

interface ClaudeStats {
  generated_at: string;
  total_sessions: number;
  total_prompts: number;
  total_tokens: number;
  pages_written: number;
  first_session: string;
  last_session: string;
  days_active: number;
  days_used: number;
  avg_prompts_per_day: number;
  cache_efficiency_pct: number;
  streak_current_days: number;
  streak_longest_days: number;
  peak_hour: number;
  peak_day: string;
  night_owl_pct: number;
  weekend_warrior: boolean;
  topics: Record<string, number>;
  top_projects: { name: string; messages: number }[];
  hour_distribution: number[];
  day_distribution: Record<string, number>;
  persona: string;
}

export interface CardTheme {
  id: string;
  name: string;
  cardBg: string;
  headerBg: string;
  barBg: string;
  border: string;
  div: string;
  persona: string;
  percentile: string;
  promptText: string;
  promptSub: string;
  topicName: string;
  footer: string;
  token: string;
  tokenCtx: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  accent: string;
  topicColors: Record<string, string>;
}

const TOPIC_EMOJI: Record<string, string> = {
  code: "⌨️", writing: "✍️", ai: "🤖", research: "🔍", planning: "🗺️",
};

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
}

function sinceMonth(iso: string) {
  return new Date(iso).toLocaleString("default", { month: "long", year: "numeric" });
}

function getBadge(s: ClaudeStats): string {
  if (s.night_owl_pct > 30) return "🦉 Night Owl";
  if (s.weekend_warrior) return "⚡ Weekend Warrior";
  if (s.avg_prompts_per_day > 50) return "🔥 Power User";
  if (s.streak_longest_days >= 14) return "🏆 Streak King";
  return "✦ Daily Builder";
}

function getPercentile(perDay: number): string {
  if (perDay > 100) return "Top 1%";
  if (perDay > 60) return "Top 3%";
  if (perDay > 30) return "Top 10%";
  if (perDay > 15) return "Top 25%";
  return "Top 50%";
}

function getTokenContext(tokens: number): string {
  const HP = 1_440_000;
  const WAR_PEACE = 771_000;
  const NOVEL = 120_000;
  if (tokens >= HP * 10) {
    const x = Math.round(tokens / HP);
    return `Harry Potter series, ${x}× over`;
  }
  if (tokens >= WAR_PEACE * 5) {
    const x = Math.round(tokens / WAR_PEACE);
    return `War & Peace, ${x}× over`;
  }
  if (tokens >= NOVEL * 5) {
    const x = Math.round(tokens / NOVEL);
    return `${x} novels worth of output`;
  }
  if (tokens >= NOVEL) {
    return "a full novel worth of ideas";
  }
  return "tokens processed";
}

function getPromptFreq(total: number, days: number): string {
  const perDay = total / Math.max(days, 1);
  const min = (16 * 60) / Math.max(perDay, 0.1);
  if (min < 2) return `${Math.round(60 / min)}× per hour while awake`;
  if (min < 120) return `one every ${Math.round(min)} min while awake`;
  return `${Math.round(perDay)}/day avg`;
}

export default function StatsCard({
  stats,
  cardRef,
  theme,
}: {
  stats: ClaudeStats;
  cardRef?: React.RefObject<HTMLDivElement>;
  theme: CardTheme;
}) {
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = cardRef ?? internalRef;
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const badge = getBadge(stats);
  const percentile = getPercentile(stats.avg_prompts_per_day);
  const tokenCtx = getTokenContext(stats.total_tokens);
  const promptFreq = getPromptFreq(stats.total_prompts, stats.days_active);
  const topTopics = Object.entries(stats.topics).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const SANS = "var(--font-dm-sans), 'DM Sans', -apple-system, sans-serif";

  return (
    <div
      ref={ref}
      style={{
        fontFamily: SANS,
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        overflow: "hidden",
        width: "100%",
        maxWidth: 460,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      {/* HEADER */}
      <div style={{
        padding: "14px 24px",
        background: theme.headerBg,
        borderBottom: `1px solid ${theme.div}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ color: theme.accent, fontSize: 12 }}>✦</span>
          <span style={{
            color: theme.accent, fontSize: 10, fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
          }}>
            Claude Wrapped
          </span>
        </div>
        <span style={{ color: theme.footer, fontSize: 10, fontFamily: "monospace" }}>
          claudewrapped.dev
        </span>
      </div>

      {/* HERO */}
      <div style={{ padding: "32px 28px 28px" }}>
        <div style={{ marginBottom: 20 }}>
          <span style={{
            display: "inline-block",
            background: theme.badgeBg,
            border: `1px solid ${theme.badgeBorder}`,
            borderRadius: 999, padding: "5px 14px",
            color: theme.badgeText, fontSize: 11, fontWeight: 700,
          }}>
            {badge}
          </span>
        </div>

        <h1 style={{
          color: theme.persona,
          fontSize: 44, fontWeight: 900,
          lineHeight: 1, letterSpacing: "-0.03em",
          marginBottom: 20,
        }}>
          {stats.persona}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>🏆</span>
          <div>
            <p style={{
              color: theme.percentile, fontSize: 19, fontWeight: 800,
              lineHeight: 1.1, letterSpacing: "-0.01em",
            }}>
              {percentile} of Claude Code users
            </p>
            <p style={{ color: theme.promptSub, fontSize: 11, marginTop: 3 }}>
              by prompts per day · {stats.avg_prompts_per_day}/day avg
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: theme.div }} />

      {/* THE NUMBER */}
      <div style={{ padding: "28px 28px 24px" }}>
        <p style={{
          color: theme.token, fontSize: 60, fontWeight: 900,
          lineHeight: 0.9, letterSpacing: "-0.04em", marginBottom: 6,
        }}>
          {fmt(stats.total_tokens)}
        </p>
        <p style={{
          color: theme.accent, fontSize: 10, fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 5,
        }}>
          Total Tokens
        </p>
        <p style={{
          color: theme.tokenCtx, fontSize: 12, fontStyle: "italic", marginBottom: 20,
        }}>
          = {tokenCtx}
        </p>

        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span style={{ color: theme.promptText, fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>
            {fmt(stats.total_prompts)} prompts
          </span>
          <span style={{ color: theme.promptSub, fontSize: 13 }}>
            {promptFreq}
          </span>
        </div>
      </div>

      <div style={{ height: 1, background: theme.div }} />

      {/* TOPICS */}
      <div style={{ padding: "24px 28px 28px" }}>
        <p style={{
          color: theme.footer, fontSize: 10, fontWeight: 700,
          letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 18,
        }}>
          What You Build
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {topTopics.map(([topic, pct]) => {
            const color = (theme.topicColors as Record<string, string>)[topic] ?? theme.accent;
            return (
              <div key={topic} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 16, width: 22, flexShrink: 0 }}>
                  {TOPIC_EMOJI[topic] ?? "•"}
                </span>
                <span style={{
                  color: theme.topicName, fontSize: 13, fontWeight: 600,
                  width: 62, textTransform: "capitalize", flexShrink: 0,
                }}>
                  {topic}
                </span>
                <div style={{
                  flex: 1, background: theme.barBg,
                  borderRadius: 999, height: 8, overflow: "hidden",
                }}>
                  <div style={{
                    width: visible ? `${pct}%` : "0%",
                    height: "100%", borderRadius: 999,
                    backgroundColor: color,
                    transition: "width 1.2s cubic-bezier(0.4,0,0.2,1) 0.4s",
                  }} />
                </div>
                <span style={{
                  color, fontSize: 14, fontWeight: 800,
                  width: 34, textAlign: "right", flexShrink: 0,
                }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        padding: "12px 24px",
        background: theme.headerBg,
        borderTop: `1px solid ${theme.div}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ color: theme.footer, fontSize: 11 }}>
          since {sinceMonth(stats.first_session)}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ color: theme.accent, fontSize: 11 }}>✦</span>
          <span style={{ color: theme.footer, fontSize: 10, fontFamily: "monospace" }}>
            claudewrapped.dev
          </span>
        </div>
      </div>
    </div>
  );
}
