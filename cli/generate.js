#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");

const CLAUDE_DIR = path.join(os.homedir(), ".claude");
const PROJECTS_DIR = path.join(CLAUDE_DIR, "projects");
const HISTORY_FILE = path.join(CLAUDE_DIR, "history.jsonl");

function readJsonl(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8")
      .split("\n").filter(Boolean)
      .map((line) => { try { return JSON.parse(line); } catch { return null; } })
      .filter(Boolean);
  } catch { return []; }
}

function detectTopics(messages) {
  const keywords = {
    code: ["build","fix","debug","error","function","component","api","deploy","test",
           "swift","python","javascript","typescript","kotlin","xcode","git","npm",
           "scaffold","refactor","class","import","export","async","await","render","hook","endpoint"],
    writing: ["write","draft","email","post","content","thread","newsletter","blog",
              "message","reply","summarize","copy","caption","essay"],
    research: ["research","find","analyze","search","compare","what is","how does",
               "explain","why","best","difference between","overview"],
    planning: ["plan","strategy","roadmap","design","architect","structure","approach",
               "how to","should i","next steps","prioritize"],
    ai: ["llm","model","prompt","agent","gemini","anthropic","ollama","embedding",
         "inference","token","gpt","claude","fine-tune","rag","vector","langchain"],
  };
  const counts = Object.fromEntries(Object.keys(keywords).map((k) => [k, 0]));
  const text = messages.join(" ").toLowerCase();
  for (const [topic, words] of Object.entries(keywords)) {
    for (const word of words) {
      counts[topic] += (text.match(new RegExp(word, "gi")) || []).length;
    }
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, Math.round((v / total) * 100)]));
}

function getPersona(stats) {
  const hour = stats.peak_hour;
  const topTopic = Object.entries(stats.topics).sort((a, b) => b[1] - a[1])[0][0];
  const cacheRate = stats.cache_efficiency_pct;
  if (hour >= 22 || hour <= 4) {
    if (topTopic === "code") return "The Midnight Coder";
    if (topTopic === "writing") return "The Night Writer";
    if (topTopic === "ai") return "The AI Night Owl";
    return "The Midnight Thinker";
  }
  if (hour >= 5 && hour <= 8) {
    if (topTopic === "code") return "The Early Builder";
    if (topTopic === "planning") return "The Dawn Strategist";
    return "The Early Riser";
  }
  if (cacheRate > 50) return "The Deep Diver";
  if (topTopic === "ai") return "The AI Whisperer";
  if (topTopic === "research") return "The Researcher";
  if (topTopic === "planning") return "The Architect";
  if (topTopic === "writing") return "The Wordsmith";
  if (stats.avg_prompts_per_day > 100) return "The Heavy Hitter";
  if (stats.avg_prompts_per_day > 50) return "The Power User";
  if (stats.streak_longest_days >= 30) return "The Consistent";
  return "The Builder";
}

function calcStreaks(timestamps) {
  if (!timestamps.length) return { current: 0, longest: 0, days_used: 0 };
  const days = [...new Set(timestamps.map((ts) => new Date(ts).toISOString().split("T")[0]))].sort();
  const days_used = days.length;
  let longest = 1, streak = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (new Date(days[i]) - new Date(days[i - 1])) / (1000 * 60 * 60 * 24);
    if (diff === 1) { streak++; longest = Math.max(longest, streak); } else { streak = 1; }
  }
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const lastDay = days[days.length - 1];
  let current = 0;
  if (lastDay === today || lastDay === yesterday) {
    current = 1;
    let i = days.length - 1;
    while (i > 0 && (new Date(days[i]) - new Date(days[i - 1])) / (1000 * 60 * 60 * 24) === 1) { current++; i--; }
  }
  return { current, longest, days_used };
}

function generate() {
  console.log("✦ Scanning ~/.claude/ ...\n");

  if (!fs.existsSync(PROJECTS_DIR)) {
    console.error("No ~/.claude/projects found. Is Claude Code installed?");
    process.exit(1);
  }

  const projectDirs = fs.readdirSync(PROJECTS_DIR)
    .filter((d) => fs.statSync(path.join(PROJECTS_DIR, d)).isDirectory());

  let totalSessions = 0;
  let totalOutputTokens = 0;
  let totalTokens = 0;
  let totalCacheRead = 0;
  let hourBuckets = new Array(24).fill(0);
  let dayBuckets = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let allTimestamps = [];
  let userMessages = [];
  let projectMessageCounts = {};
  let firstSeen = null;
  let lastSeen = null;

  for (const dir of projectDirs) {
    const dirPath = path.join(PROJECTS_DIR, dir);
    const jsonlFiles = fs.readdirSync(dirPath).filter((f) => f.endsWith(".jsonl"));
    totalSessions += jsonlFiles.length;
    for (const file of jsonlFiles) {
      const entries = readJsonl(path.join(dirPath, file));
      for (const entry of entries) {
        if (!entry) continue;
        if (entry.type === "user" && entry.message?.role === "user") {
          const ts = entry.timestamp;
          if (ts) {
            const d = new Date(ts);
            hourBuckets[d.getHours()]++;
            dayBuckets[dayNames[d.getDay()]]++;
            allTimestamps.push(ts);
            if (!firstSeen || ts < firstSeen) firstSeen = ts;
            if (!lastSeen || ts > lastSeen) lastSeen = ts;
          }
          const content = entry.message?.content;
          if (typeof content === "string") userMessages.push(content);
          else if (Array.isArray(content)) {
            content.forEach((c) => { if (c.type === "text") userMessages.push(c.text); });
          }
          projectMessageCounts[dir] = (projectMessageCounts[dir] || 0) + 1;
        }
        if (entry.type === "assistant") {
          const usage = entry.message?.usage;
          if (usage) {
            const out = usage.output_tokens || 0;
            const inp = usage.input_tokens || 0;
            const cacheRead = usage.cache_read_input_tokens || 0;
            const cacheCreate = usage.cache_creation_input_tokens || 0;
            totalOutputTokens += out;
            totalCacheRead += cacheRead;
            totalTokens += inp + out + cacheRead + cacheCreate;
          }
        }
      }
    }
  }

  const historyEntries = readJsonl(HISTORY_FILE);
  const totalPrompts = historyEntries.filter((e) => e.display).length;

  const topProjects = Object.entries(projectMessageCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([dir, count]) => ({ name: dir.split("-").filter(Boolean).slice(-2).join("-"), messages: count }));

  const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));
  const peakDay = Object.entries(dayBuckets).sort((a, b) => b[1] - a[1])[0][0];
  const nightHours = hourBuckets.slice(22).concat(hourBuckets.slice(0, 5)).reduce((a, b) => a + b, 0);
  const totalHourCount = hourBuckets.reduce((a, b) => a + b, 0) || 1;
  const nightOwlPct = Math.round((nightHours / totalHourCount) * 100);
  const topics = detectTopics(userMessages);
  const streaks = calcStreaks(allTimestamps);
  const days_used = streaks.days_used;
  const days_active = firstSeen && lastSeen
    ? Math.max(1, Math.round((new Date(lastSeen) - new Date(firstSeen)) / (1000 * 60 * 60 * 24)))
    : 1;
  const pagesWritten = Math.round(totalOutputTokens / 325);
  const weekendMessages = (dayBuckets.Sat || 0) + (dayBuckets.Sun || 0);
  const totalDayMessages = Object.values(dayBuckets).reduce((a, b) => a + b, 0) || 1;
  const weekendWarrior = weekendMessages / totalDayMessages > 0.4;
  const maxHour = Math.max(...hourBuckets) || 1;
  const hourDistribution = hourBuckets.map((v) => Math.round((v / maxHour) * 100));
  const totalInputSide = totalTokens - totalOutputTokens;
  const cacheEfficiencyPct = totalInputSide > 0 ? Math.round((totalCacheRead / totalInputSide) * 100) : 0;

  const stats = {
    generated_at: new Date().toISOString(),
    total_sessions: totalSessions,
    total_prompts: totalPrompts,
    total_tokens: totalTokens,
    total_output_tokens: totalOutputTokens,
    pages_written: pagesWritten,
    first_session: firstSeen,
    last_session: lastSeen,
    days_active,
    days_used,
    avg_prompts_per_day: Math.round(totalPrompts / Math.max(days_used, 1)),
    streak_current_days: streaks.current,
    streak_longest_days: streaks.longest,
    peak_hour: peakHour,
    peak_day: peakDay,
    night_owl_pct: nightOwlPct,
    weekend_warrior: weekendWarrior,
    cache_efficiency_pct: cacheEfficiencyPct,
    topics,
    top_projects: topProjects,
    hour_distribution: hourDistribution,
    day_distribution: dayBuckets,
  };
  stats.persona = getPersona(stats);

  const outPath = path.join(process.cwd(), "claude-stats.json");
  fs.writeFileSync(outPath, JSON.stringify(stats, null, 2));

  console.log("  Persona:    " + stats.persona);
  console.log("  Prompts:    " + totalPrompts.toLocaleString() + " (" + stats.avg_prompts_per_day + "/day on active days)");
  console.log("  Days used:  " + days_used + " distinct days");
  console.log("  Tokens:     " + (totalTokens / 1e6).toFixed(1) + "M");
  console.log("  Streak:     " + streaks.longest + " days best");
  console.log("  Peak:       " + peakHour + ":00 on " + peakDay + "s");
  console.log("\n  Saved → " + outPath);
  console.log("  Upload at claudewrapped.dev to get your card\n");
}

generate();
