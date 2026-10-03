# Design Council

A multi-agent design council for [Claude Code](https://claude.com/claude-code) that aims for senior product-designer quality.

It explores **structurally different** concepts, critiques them from **real full-resolution screenshots**, debates the trade-offs that matter, and synthesizes a final design — delivered as a live HTML preview or implemented directly in your repo.

> Companion to [Product Council](https://github.com/masoudparsa/product-council): Product decides *what and why*, Design decides *how*. Feed one into the other with `--from`.

## Why

Asking a single model for "a design" gets you the first idea, rendered once, never looked at. Design Council works the way a design team does:

- **Breadth before depth** — three concepts that differ in IA, flow, navigation, layout, or density, never just colors.
- **Critique what is real** — critics review rendered screenshots, not imagined designs. Visual-craft critics always get full-resolution shots.
- **Disagreement is resolved, not averaged** — only disputes that change the direction or a blocker are debated.
- **A director decides** — the Design Director synthesizes a chosen direction (or an explicit hybrid) with decision records and a Refine Brief.

## Delivery paths

At the start the council asks how to deliver (skip with `--preview` or `--code`):

| | A. Preview first | B. Straight to code |
|---|---|---|
| Concepts | built as live HTML previews | written as concept briefs + screen specs |
| Critique | on rendered screenshots | on specs, then on the real implemented screens |
| Output | browsable gallery; implement after you pick | code in your repo + real-screen critique and one refine pass |
| Best for | design quality | speed |

Supported platforms for implementation: **Flutter**, **React / Next / Vue / Nuxt / Angular / Svelte** (incl. Tailwind), and **Blazor**. The repo scan also detects your existing design system, l10n setup, and **RTL** (Persian / Arabic / Hebrew are designed RTL-first).

## How it works

1. **Frame** — decision brief, repo scan (platform, design system, l10n, RTL), delivery question (≤ 3 questions total)
2. **Discovery** — independent analysis by each member
3. **Direction** — the Director writes a design brief and structurally different concept briefs
4. **Make + render** — the UI Maker builds each concept at *concept fidelity* as a self-contained HTML file and reviews its own render; one Playwright launch captures full-res shots and a contact sheet per concept
5. **Critique** — members review the screenshots in a strict issue format: problem · why · impact · severity · fix
6. **Debate** — only disputes that change the direction or a blocker
7. **Synthesis + stress test** — chosen direction or hybrid, decision records, Refine Brief
8. **Refine + verify** — the Maker edits the chosen concept into the final preview and raises it to *full fidelity* (every state, dark mode, every viewport); each Refine item is checked against the shots
9. **Implement** — after you approve (Path A) or directly (Path B), followed by a real-screen critique of the implemented UI

## Members

| Role | Covers | Model |
|---|---|---|
| Design Director | direction, synthesis, stress test | opus |
| UI Maker | builds and refines the previews | opus |
| Creative Director | visual language, hierarchy, typography, color, trends | opus |
| UX Architect | IA, flows, states, cognitive load, user advocate | sonnet |
| Platform | responsive web, iOS, Android, interaction & motion, RTL | sonnet |
| Design System & A11y | existing tokens/components (reads the repo), WCAG 2.2 AA | sonnet |
| Design Red Team | pre-mortem, edge cases, attacks consensus | opus |
| Implementer | production code in the current repo | opus |

Director, Maker, and Implementer never critique or debate.

## Modes

| | quick | standard (default) | deep |
|---|---|---|---|
| Discovery | — | 4 members + light benchmarks | 5 members + benchmarks |
| Concepts | 1 | 3 | 3 |
| Critics | Creative, UX, Red Team | 5 | 5 |
| Debate | — | ≤ 2 disputes, 1 round | ≤ 3 disputes, 2 rounds |
| Verify | orchestrator | orchestrator | + DS&A11y, Red Team |
| Approx. agent calls (preview) | ~7 | ~16–20 | ~23–31 |

## Quality vs tokens

**Cut transport, never judgment.**

- **Fidelity tiers** — two of three concepts are discarded, so concepts are built at *concept fidelity*: real content and full visual craft, but only `default` + the riskiest state, mobile + the primary other viewport, light theme. Only the chosen direction is raised to full fidelity.
- **Maker budget** — starts from a shared scaffold (`base.html`: tokens, state/theme router, a11y base), writes the file once, edits by Grep + Edit instead of re-reading, one self-review pass.
- **Batch rendering** — `render.cjs` takes every screenshot in one browser launch (plain `node`, no `npx` per call) and flags failed, blank, and JS-erroring pages, so the orchestrator opens an image only when something is wrong.

## Speed

- Makers are the critical path (three in parallel; the slowest decides). Concept fidelity and the Maker budget shorten it most.
- The Maker's self-review renders the exact shots the critics get, so there is no separate render step.
- Debate is skipped when no dispute changes the direction or a blocker.
- Renderer setup runs in the background while you answer the opening questions.
- One progress line per phase, so you can see where the run is.
- Fastest options: `quick` for one-screen work, `--lean` for exploration, `--preview` / `--code` to skip the delivery question.
- **Narrow reads, own writes** — each Maker reads only its own concept brief; the Director writes `brief.md` and `report.md` itself instead of returning long text to be re-saved.
- **Transport** — file paths instead of pasted content, compact issue rows, debates carry only disputed rows.
- **Refine stays focused** — the Refine Brief keeps every issue, but only `B`/`M` rows are numbered and verified one by one; minor rows go to a Polish list. The Refine Maker reads only the sections it needs and maps the HTML before reading regions.
- **States sheets** — the final's many states are reviewed on one or two overview images (`states.html`); full-res shots stay for default, riskiest, dark, text scale ×2, and anything a Refine item touches.
- **`--lean`** (optional) — concept Makers on sonnet; Refine and Implementer stay on opus.

Never cut: three concepts in standard/deep, full-resolution shots for visual-craft critics, the Maker's self-review, the critique round, a full-fidelity final, and opus for Director, Maker, Creative, Red Team, and Implementer.

## Output

```text
design-council/<topic>/
├── brief.md            # request, product context, design brief
├── concepts/           # <id>.brief.md + <id>.html per concept
├── jobs/               # render job files
├── shots/              # full-resolution screenshots (mobile, desktop, states, dark)
├── sheets/             # contact sheets for overview
├── final/preview.html  # refined final design
├── index.html          # gallery: switch concepts, devices, states, dark mode
└── report.md           # decision records, stress test, Refine / Build Spec
```

## Requirements

- Claude Code
- Node.js. The council sets up its renderer on first run (Playwright in `~/.claude/design-council-runtime`). It uses an installed **Edge or Chrome** when available and downloads Chromium only if neither exists; to do it yourself: `node skills/design-council/templates/render.cjs --setup`. `DC_CHROMIUM` can point at a specific browser executable.

## Installation

### Plugin (recommended)

```text
/plugin marketplace add masoudparsa/design-council
/plugin install design-council@design-council
```

Command: `/design-council:design-council`

### Manual

Copy into `~/.claude/` (`%USERPROFILE%\.claude\` on Windows):

```text
agents/*                -> ~/.claude/agents/
skills/design-council/  -> ~/.claude/skills/design-council/
```

Command: `/design-council`

## Usage

```text
/design-council onboarding flow for a habit-tracking app, Persian, iOS + Android
/design-council quick empty state for the bookings list
/design-council deep redesign the comparison page --from product-council-comparison.md
/design-council --code settings screen for the driver app
/design-council implement
/design-council tweak show the cycle gauge in the fertile-window state too
```

| Argument | Effect |
|---|---|
| `quick` / `standard` / `deep` | mode (first word) |
| `--preview` / `--code` | delivery path, skips the question |
| `--from <path>` | use a Product Council report or product doc as context |
| `--lean` | cheaper exploration: concept Makers on sonnet |
| `implement [report]` | implement an existing preview (newest report by default) |
| `tweak <change>` | focused change to the final design: one edit, affected shots only, one relevant critic (~2–3 agent calls). Structural changes are flagged and sent back to you instead |

The council never commits; it informs the human decision-maker and does not replace design ownership.

## Repository layout

```text
.claude-plugin/          plugin + marketplace manifests
agents/                  the eight council members
skills/design-council/
├── SKILL.md             orchestration
├── critique-protocol.md issue-row format and severity scale
└── templates/           base.html scaffold, render.cjs, states sheet, contact sheet, gallery, report
```

## License

[MIT](LICENSE) © Masoud Parsanejad
