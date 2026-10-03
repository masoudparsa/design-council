# Critique Protocol

Read only in Critique, Debate, and Verify. You have no memory beyond your prompt.

## Inputs
Open your images first (full-res shots and/or sheet). Open HTML or code only if your role says so, and Grep for the part you check before reading.

Concept fidelity: concepts show only `default` + the riskiest state, mobile + the primary other viewport, light theme. Don't log missing states, dark mode, or secondary viewports as issues — they are added to the chosen direction later. Judge structure, flow, hierarchy, visual craft, and the riskiest state at full rigor.

Text-only critique (concept briefs, no render): say so, cap confidence for visual claims at Medium, and focus on structure, flow, states, platform fit, and feasibility.

## Issue row (the only format for problems)

```text
ID | Concept | Where | Problem | Why | Impact | Sev | Fix
```

- **ID**: your role prefix + number — CR (Creative), UX, PL (Platform), DS (Design System & A11y), RT (Red Team).
- **Where**: viewport · area, e.g. `mobile · top bar`, `desktop · table header`, `empty state`.
- **Why**: label it — `[evidence: source]`, `[guideline: HIG / Material / WCAG x.y]`, `[heuristic: name]`, or `[assumption]`. Never invent research, users, or metrics.
- **Impact**: who is hurt and how (user task, platform, accessibility, consistency).
- **Sev**: `B` blocker (task fails, inaccessible, broken on a target platform) · `M` major (noticeably worse experience) · `m` minor (polish).
- **Fix**: concrete and buildable, not "improve hierarchy".

"I don't like it" is not an issue. Taste claims must name the effect on the user.

## Critique output

1. **Steelman** — per concept, its strongest argument in 1–2 lines, before any criticism.
2. **Issues** — rows, blockers first. Minors only if cheap to fix.
3. **Ranking** — concepts in order, one line why.
4. **Borrow** — `take <element> from <concept> into <concept> — reason` (only if it helps).
5. **Changed since Discovery?** — yes/no + why.
6. **Confidence** — High / Medium / Low (Low if critiquing from source without render; ≤ Medium for visual claims in text-only critique).

## Debate reply

For each disputed ID: `concede` / `partial` / `rebut`. If rebut, name the evidence or the usability test that would settle it. No repetition of earlier rows.

## Verify reply

Each Refine Brief item: `n | done / partial / missing | note`. Then new blockers as issue rows, if any.

## Rules
- Critique the design, not the designer. Concede valid points explicitly.
- Don't change position to reach consensus; don't treat both sides as equally supported when they aren't.
- No appeal to authority or majority. Trends are not evidence of usability.
- Compact form, full reasoning. Respond in the language of the original request.
