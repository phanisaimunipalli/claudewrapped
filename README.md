<div align="center">

<br />

# ✦ Claude Wrapped

**Your Claude Code usage, beautifully visualized.**

Generate a shareable scorecard from your local Claude Code data — persona, token count, peak hours, top topics — then customize and share it in one click.

<br />

```bash
npx github:phanisaimunipalli/claudewrapped
```

*Runs locally. Nothing leaves your machine.*

<br />

---

</div>

## What it does

Claude Wrapped reads your `~/.claude/` directory — the same files Claude Code writes locally — and generates a `claude-stats.json` with:

- Your **persona** (The Deep Diver, The Midnight Coder, The AI Whisperer, and more)
- **Total tokens** with literary context (e.g. *"Harry Potter series, 4× over"*)
- **Prompt frequency** — how often you reach for Claude while awake
- **Peak hour and day** — when you build most
- **Streak** — current and longest active streaks
- **Topic breakdown** — code, AI, writing, research, planning
- **Top projects** by message volume
- **Cache efficiency**, night owl %, weekend warrior flag

Upload the JSON to **[claudewrapped.dev](https://claudewrapped.dev)** to get your card.

---

## Quickstart

**Step 1 — Generate your stats**

```bash
npx github:phanisaimunipalli/claudewrapped
```

Reads `~/.claude/projects/` and `~/.claude/history.jsonl`.
Outputs `claude-stats.json` in your current directory. Takes ~2 seconds.

```
✦ Scanning ~/.claude/ ...

  Persona:    The Deep Diver
  Prompts:    2,990 (166/day on active days)
  Days used:  18 distinct days
  Tokens:     275.3M
  Streak:     5 days best
  Peak:       21:00 on Sats

  Saved → /Users/you/claude-stats.json
  Upload at claudewrapped.dev to get your card
```

**Step 2 — Get your card**

Go to **[claudewrapped.dev](https://claudewrapped.dev)** and drop in the file.

**Step 3 — Customize and share**

Pick a card theme, choose a background, dial in the scale — then download your PNG or share directly to Threads.

---

## Customization

Full shots.so-style control over your card:

| Control | Options |
|---|---|
| **Card** | Dark, Light, Midnight, Sunset, Forest, Grape |
| **Background** | Aurora, Glow, Cosmic, Mystic, Neon, Crystal, Inferno, Ocean, Radiant, Velvet, Mesh, Noir, Pearl |
| **Scale** | 60% → 130% — zoom the card within the canvas |
| **Padding** | 16px → 96px — control how much background shows |
| **Accent** | 8 presets + full custom color picker |

The downloaded PNG captures the full canvas — background, card, everything — ready to post.

---

## Personas

| Persona | Awarded when |
|---|---|
| The Deep Diver | Cache efficiency > 50% |
| The Midnight Coder | Peak hour 10pm–4am + top topic: code |
| The Night Writer | Peak hour 10pm–4am + top topic: writing |
| The AI Night Owl | Peak hour 10pm–4am + top topic: AI |
| The Early Builder | Peak hour 5–8am + top topic: code |
| The Dawn Strategist | Peak hour 5–8am + top topic: planning |
| The AI Whisperer | Top topic: AI |
| The Researcher | Top topic: research |
| The Architect | Top topic: planning |
| The Wordsmith | Top topic: writing |
| The Heavy Hitter | 100+ prompts/day avg |
| The Power User | 50+ prompts/day avg |
| The Consistent | 30+ day streak |
| The Builder | Everything else |

---

## Privacy

- The CLI runs **entirely locally** — no network requests, no telemetry
- The web app processes your JSON **in the browser** — nothing is sent to a server
- `claude-stats.json` contains aggregate numbers only, never message content

---

## Repo structure

```
claudewrapped/
├── cli/
│   └── generate.js        # The npx script — reads ~/.claude/, writes claude-stats.json
├── web/
│   ├── app/
│   │   ├── page.tsx        # Upload · customize · share UI
│   │   └── layout.tsx      # Lora + DM Sans fonts, metadata
│   └── components/
│       └── StatsCard.tsx   # The shareable card component
└── package.json            # Root — enables npx github:phanisaimunipalli/claudewrapped
```

---

## Run the web app locally

```bash
cd web
npm install
npm run dev
# → http://localhost:3000
```

---

## Requirements

- **Node.js 16+** for the CLI
- **Claude Code** installed with at least one session (`~/.claude/` must exist)

---

<div align="center">

<br />

Built with Claude Code &nbsp;·&nbsp; [claudewrapped.dev](https://claudewrapped.dev)

<br />

</div>
