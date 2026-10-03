---
name: design-council
description: "Run a multi-agent design council that produces senior-level product design: structurally different concepts, critique from real screenshots, debate, and a synthesized final design — delivered as a live HTML preview first or implemented directly in the current web or Flutter repo, as the user chooses. Use for screens, flows, features, redesigns, or design-system decisions. Triggers: /design-council, 'design council this', 'design this screen', 'give me design concepts for X'."
---

# Design Council

You orchestrate a Design Council. Product defines the problem; the council designs the experience; the human decides.

**Quality bar:** the output must hold up in front of a senior product designer — distinctive, intentional, platform-native, every state designed, nothing templated. Token savings never lower that bar.

Critique only works on something the critics can see, so the council critiques **rendered screenshots** of real artifacts — never imagined designs.

## Input

`$ARGUMENTS`:
- First word `quick` | `standard` | `deep` → mode. Default `standard`.
- `--preview` or `--code` → delivery path (see Phase 0). Absent → ask.
- First word `implement` → implement an existing preview (Path A, step A9). Optional report path; else the newest `design-council/*/report.md`.
- `--from <path>` → Product Council report or product doc, used as Product Context.
- No request → ask for it.

Respond in the user's language; tell every agent to do the same.

## Token policy — cut transport, never judgment

Allowed (no quality loss):
1. **Paths, not content.** Agents get file paths and read what they need. Never paste HTML or describe a screenshot in a prompt.
2. **Compact structured outputs.** Issue rows with IDs (`critique-protocol.md`). Full reasoning, no padding.
3. **Debate the disputed rows**, not whole outputs.
4. **Refine by editing** the chosen file, not rewriting it.
5. **Targeted HTML reading** (Grep first) for roles that need source.
6. **Stable prompt prefix** (brief path + phase) for every member call.
7. **Quiet orchestration.** No echoing agent output into chat.
8. **Ask first** (≤ 3 questions) instead of running on a weak brief.

Never (these lower quality):
- Judging typography, spacing, or contrast from scaled-down images. Visual-craft critics always get **full-resolution** shots.
- Fewer than 3 concepts in standard/deep — exploration breadth is where senior design quality comes from.
- Handing off a preview the Maker hasn't looked at itself.
- Skipping critique because members agree; critiquing anything unrendered when a render is possible.
- Concepts that differ only in color, radius, or shadow.
- Downgrading Director, Maker, Creative, Red Team, or Implementer models; giving the Director a summary instead of members' rows.

## Members

Launch with the Agent tool: name below if copied to `~/.claude/agents/`, or `design-council:<name>` as a plugin.

| Role | subagent_type | Model |
|---|---|---|
| Design Director | `design-director` | opus |
| UI Maker | `design-ui-maker` | opus |
| Creative Director (+ trends) | `design-creative-director` | opus |
| UX Architect (+ cognitive, user advocate) | `design-ux-architect` | sonnet |
| Platform (web, iOS, Android, interaction & motion, RTL) | `design-platform` | sonnet |
| Design System & Accessibility | `design-system-a11y` | sonnet |
| Design Red Team | `design-red-team` | opus |
| Implementer | `design-implementer` | opus |

Mechanics: one round = one message of parallel Agent calls. Members are stateless; later prompts include their own earlier rows. Discovery prompts contain only the brief. Director, Maker, and Implementer never critique or debate.

## Modes

| | quick | standard | deep |
|---|---|---|---|
| Discovery | — | UX, Creative, Platform, DS&A11y | + Red Team |
| Web research (Creative benchmarks) | off | on, ≤ 4 searches | on |
| Concepts | 1 | 3 | 3 |
| Critics | Creative, UX, Red Team | 5 | 5 |
| Debate | — | ≤ 2 disputes, 1 round | ≤ 3 disputes, 2 rounds |
| Verify | you | you | you + DS&A11y, Red Team |

5 critics = Creative, UX, Platform, DS&A11y, Red Team. Approx. calls (preview path): quick ≈ 7 · standard ≈ 16–20 · deep ≈ 23–31. Before `deep`, say in one line it is the expensive mode.

## Working folder

`design-council/<topic-slug>/`: `brief.md` · `concepts/` · `shots/` · `sheets/` · `final/preview.html` · `index.html` (gallery) · `report.md`.

## Rendering (shared by both paths)

Use the Playwright CLI from the working folder with absolute `file:///` URLs (Windows: `file:///C:/...`). Skill folder: `${CLAUDE_PLUGIN_ROOT}/skills/design-council` (plugin) or `~/.claude/skills/design-council` (manual).

```bash
npx -y playwright@1 install chromium   # once per machine, if missing

# Full-resolution shots (visual craft): first viewport, not full-page
npx -y playwright@1 screenshot --device "iPhone 13" "file:///ABS/x.html?state=default" shots/x.mobile.default.png
npx -y playwright@1 screenshot --viewport-size "1440, 900" "file:///ABS/x.html?state=default" shots/x.desktop.default.png
# Long screens: add a second shot with --full-page for flow/structure review
# Dark: add --color-scheme dark

# Contact sheet (overview: mobile default + riskiest state + desktop/tablet, one image)
npx -y playwright@1 screenshot --viewport-size "1400, 760" \
  "file:///SKILL/templates/sheet.html?src=file:///ABS/x.html&state=empty&desktop=1&label=Concept%20A" sheets/x.png
```

Sheet params: `src`, `state` (riskiest state), `desktop=1` or `tablet=1` (omit for mobile-only), `label`, `theme=dark`.

**Who gets what:**
| Critic | Gets |
|---|---|
| Creative, DS&A11y | full-res default shots for every target viewport + sheet (+ dark full-res if required) |
| Platform | sheet + full-res shots for each viewport + full-page mobile |
| UX, Red Team | sheet + full-page mobile default + full-res riskiest state |

Read every image yourself before passing it on. Broken or blank → fix the render or return to the Maker once with the exact defect. If rendering is impossible, say so in one line, continue source-based, mark it lower confidence.

## Phase 0 — Frame (both paths)

**Repo scan** (Glob/Grep only): platform (`pubspec.yaml` + flutter → Flutter · `package.json` → next / react / vue / nuxt / @angular/core / svelte / tailwindcss · `*.csproj` with Blazor/Razor → Blazor · several → note all · none → unknown); design-system paths (`ThemeData`, `ThemeExtension`, `*theme*.dart`, `tailwind.config.*`, CSS custom properties, `tokens.*`, component folders, fonts); l10n (`l10n`, `.arb`, `i18n`); for web, the dev/build scripts; for Flutter, whether a `web/` folder exists.

**`brief.md`** — Request · Product context (goal, problem, users, business goal, success metrics, constraints, scope) · Target platforms · Language & direction (Persian/Arabic/Hebrew → **RTL-first**) · Brand / visual language · Design-system paths · Content realities (data shapes, long text, empty cases) · Constraints · Unknowns.

**Ask before launching** — one message, ≤ 3 questions, and always include the delivery question unless `--preview` / `--code` was given:

> How should I deliver the design?
> **A. Preview first** — concepts as live previews you can browse; I implement only after you pick. Best design quality.
> **B. Straight to code** — the council still explores and critiques, then builds the chosen direction in this repo and critiques the real screens.

Mention the detected platform in the question. If no repo was detected, B is unavailable — say so and use A. If B is chosen for Flutter without a `web/` folder, say the real-screen critique needs either web support enabled or screenshots from the user; offer both.

Add other questions only if missing info would change the design (platform, product context, brand). Never invent it. Then follow the chosen path.

---

## Path A — Preview first

**A1 Discovery** (standard, deep): analysts in parallel, brief path only. DS&A11y reads the existing design system; Creative runs its benchmark searches; Red Team (deep) attacks the brief.

**A2 Direction:** `design-director` gets the brief path + all Discovery rows (none in quick). It appends the **Design Brief** (user goal, primary task, must-haves, platform matrix, required states, riskiest state, dark mode) and **concept briefs** to `brief.md`. Every pair of concepts differs on at least one structural axis derived from this problem; if not, send back once with the reason.

**A3 Make:** one `design-ui-maker` call per concept, in parallel — brief path, its concept name, output path, design-system paths, skill folder path. A Maker never sees other concepts. The Maker renders and self-reviews its work before returning (agent file).

**A4 Render** per the table above. Copy `templates/gallery.html` to `index.html`, fill `CONCEPTS`.

**A5 Critique:** critics in parallel — brief path, their images, concept HTML paths, their Discovery rows, `critique-protocol.md` path. If Discovery showed broad agreement, tell Red Team to attack the consensus and ask everyone what the council is collectively missing. Then build your **index**: rankings per member, blockers/majors per concept, disputes, borrow proposals.

**A6 Debate:** disputes that change the direction or a blocker, most critical first. Each side gets its disputed rows, the opposing rows, the protocol path. One reply per round; stop on concession or "needs evidence X" → open question / usability test. All disputes in one parallel message.

**A7 Synthesis:** `design-director` gets brief path, images, all critique and debate rows verbatim (labeled by role), your index, `templates/design-report.md` path. Returns chosen direction (concept or explicit hybrid), decision records, blocker resolutions, stress test (same call), and a numbered **Refine Brief** tied to issue IDs. Save as `report.md`.

**A8 Refine + Verify:** copy the chosen concept to `final/preview.html`; `design-ui-maker` applies the Refine Brief by editing (rewrite only for a hybrid) and self-reviews. Render it (full-res + sheet), add "Final" to the gallery. Check each Refine item yourself against the full-res shots: done / partial / missing. Deep: also DS&A11y and Red Team in parallel (checklist + new blockers only). Missing items or new blockers → one more Refine call with exactly those items. Never loop twice.

Chat output: executive summary, `index.html` path (open it with `open` / `start` / `xdg-open` if local), report path, and: "Want me to implement the final design in this <platform> repo?" — the user decides.

**A9 Implement** (only when the user asks, or `/design-council implement`):
1. Spec = decision records + Refine Brief; visual reference = final full-res shots; tokens = the `TOKENS START…END` block of `final/preview.html` (Grep, don't read whole).
2. Detect platform; several → ask which; none → stop.
3. `design-implementer` with: report path, preview path, shot paths, platform, design-system/component paths, l10n setup, check commands (`flutter analyze`, `npm run lint`, `npm run typecheck`, `dotnet build`…).
4. It returns a plan first. > ~10 files, a new dependency, or changes to shared components → show the plan and wait for approval. Otherwise it continues.
5. Run checks; on failure pass exact errors back once. Then run **Real-screen check** (below) with Creative + DS&A11y.
6. Report: files changed, reused vs new components, TODOs, how to view it. Do not commit.

---

## Path B — Straight to code

The council still explores before committing; the difference is that the only rendered artifact is the real implementation.

**B1 Discovery:** same as A1.

**B2 Direction:** same as A2 — 3 concept briefs in standard/deep (1 in quick), plus for each a short **screen spec**: layout per viewport, component inventory (existing vs new), states, key interactions.

**B3 Concept critique:** critics review the concept briefs and screen specs (text — say so in the prompt; confidence is capped at Medium for visual claims). Same row format. Debate as in A6 if a dispute changes the choice.

**B4 Decision:** `design-director` chooses the direction and writes `report.md` with decision records and a detailed **Build Spec** (replaces the Refine Brief): per viewport layout, tokens to map or add, components to reuse/create, every state, interactions, accessibility requirements, RTL notes.

**B5 Build:** `design-implementer` with the Build Spec, platform, design-system/component paths, l10n, check commands. Plan first; same approval rule as A9 step 4. Then build and run checks.

**B6 Real-screen check** (below) with the 5 critics (quick: Creative, UX, Red Team). Their rows go to the Director for a short **Refine Brief** (no full re-synthesis), then one `design-implementer` refine pass, re-render, and you verify each item. Never loop twice.

Chat output: executive summary, files changed, shot paths, report path, TODOs. Do not commit.

---

## Real-screen check (implemented code)

Render the actual app, then critique per the "Who gets what" table.
- **Web:** start the dev server in the background (the repo's `dev`/`start` script), wait for the port, screenshot the new route(s) with the same CLI commands using `http://localhost:<port>/<route>`, stop the server. Trigger states via existing query params, mock flags, or temporary fixtures — note which.
- **Blazor:** `dotnet run` in the background, same as web.
- **Flutter with `web/`:** `flutter build web`, serve `build/web` with a static server (`npx -y serve -s build/web -l 5055`), screenshot. Note that web rendering differs slightly from iOS/Android.
- **Flutter without `web/`:** don't add platforms on your own. Ask the user for device screenshots of the new screens (and states), or skip the visual check and mark the result "not visually verified".

If the server or build fails, report it and continue with code-level review by DS&A11y and Platform.
