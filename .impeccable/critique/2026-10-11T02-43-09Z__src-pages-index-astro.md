---
target: "Existing portfolio: home, About, indexes and both NBA explorers"
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/Users/narayanlekhi/.codex/worktrees/portfolio-ui-refinement/portfolio/src/pages/index.astro"
target_fingerprint: "sha256:cb52f47b0675dea053441bc0121bb058b3d5c24f6b2689649540e6008c51e6c2"
target_path: /Users/narayanlekhi/.codex/worktrees/portfolio-ui-refinement/portfolio/src/pages/index.astro
timestamp: 2026-10-11T02-43-09Z
slug: src-pages-index-astro
---
Method: dual-agent (A: /root/design_review · B: /root/technical_review)

# Portfolio UI critique and bounded audit

Reviewed 10 October 2026, America/New_York. Target: the existing portfolio at
`b2a9325` on `codex/portfolio-ui-refinement`, rooted at the home page source and
covering home, About, projects, blog, the NBA explorer and comparison.

The independent critique and baseline audit are complete. Refinements and their
confirmation pass remain blocked by unconfirmed first-use Impeccable hook
approval. No UI, factual copy, analytics, data, dependency or security policy
changed. No push or deployment ran.

## Design specificity and overall impression

The site has an authored sports-publication identity. Cream, masonry green,
rust, cyan, Fraunces, Source Serif 4 and IBM Plex Mono give the analysis a clear
voice. Shifting prose bands and the fixed chart gutter support the work. Preserve
this visual system.

Both reviewers found the missing home project-row styling. Assessment A found
comparison grouping and court-alignment defects; Assessment B found label,
keyboard-dismissal, unavailable-state and enlarged-text defects. The main
opportunity is to make the existing project and comparison easier to reach and
scan, while repairing those specific accessibility and state problems.

The detector returned zero primary findings and one advisory at
`src/pages/styleguide.astro:0`: `em-dash-overuse`, reporting fourteen dashes. Source
inspection found one literal em dash in the title; CSS token names containing
double hyphens account for the advisory. This is a false positive. No ignore rule
or copy change was added. A clean detector does not establish accessible behavior.
No reliable user-visible overlay exists: the overlay injection was skipped to
preserve the production CSP. CLI detection, DOM/accessibility snapshots,
screenshots, console/network records and Lighthouse supplied the evidence.

## Design health

Assessment A scored the mixed Experience, Read and Operate surfaces. All ten
heuristics apply because the explorer and comparison include interactive tasks.
These are reviewer judgments, not user-study measurements.

| # | Nielsen heuristic | Score / 4 | Evidence or remaining weakness |
| --- | --- | --- | --- |
| 1 | Visibility of system status | 3 | Loaded states work; unavailable court retains Loading text |
| 2 | Match with the real world | 3 | Basketball court and contextual definitions support interpretation |
| 3 | User control and freedom | 3 | Keyboard selection, reset and popup Escape work; suggestions persist after blur |
| 4 | Consistency and standards | 3 | Home row and paired court alignment diverge |
| 5 | Error prevention | 3 | Constrained choices and duplicate-player rejection work |
| 6 | Recognition rather than recall | 2 | Mobile comparison separates required selectors by a full player report |
| 7 | Flexibility and efficiency | 2 | Keyboard controls work; reaching Player B requires long scrolling |
| 8 | Aesthetic and minimalist design | 3 | Strong identity; missing row treatment and stack alignment reduce craft |
| 9 | Error recovery | 3 | Reset and unavailable recovery work; network-failure recovery not induced |
| 10 | Help and documentation | 3 | Contextual definitions work; range trigger has a label/name mismatch |
| Total | | **28 / 40** | **Good; refinements remain needed** |

Assessment B's separate technical score is 16/20: accessibility 3/4,
performance 3/4, responsive design 3/4, theming 4/4 and implementation integrity
3/4. Neither score certifies WCAG compliance.

## What works

1. The three fonts have distinct display, reading and data roles. Cream dominates;
   green structures the argument; sand belongs to chart and table surfaces.
2. Charts supply the graphic identity. Shape cues accompany chart color, and
   evidence states preserve unavailable estimates without turning them into zero.
3. Search, native range controls, court inspection, contextual help and reset
   provide immediate feedback and visible keyboard focus. The complete rendering
   matrix passed without additional slider/view data requests.

## Five priority issues

### [P1] The range trigger's accessible name omits its visible percentage

The single explorer displays `Estimated Range (90%)`, while its accessible name
is `Explain Estimated Range for Extra Points in 2025–26`. The missing `(90%)`
creates a Label in Name mismatch for speech input. Source and Lighthouse's
experimental `label-content-name-mismatch` check identify `#term-range` in
`SpatialShotSelection.astro`. The Lighthouse category score of 100 does not
cancel this concrete finding.

Repair: retain the exact visible phrase in the accessible name, then append its
existing metric and season context. Preserve uncertainty values and explanation.
Suggested workflow: `$impeccable harden`. **Unresolved.**

### [P1] Mobile comparison separates the two required player selectors

At 375px, Player A search is at document y=1545 and Player B at y=3719, a 2174px
gap or about 2.7 viewport heights. The visitor passes the first court and seven
metrics before choosing the second player. This hurts discoverability and forces
the reader to carry A's values while locating B.

Repair: keep both existing selectors together above stacked results, preserving
labels, keyboard order and behavior. This needs a comparison-specific layout
decision; obtain the project's structural approval if it requires reorganizing
markup or files. Do not squeeze paired courts into the phone width.
Suggested workflow: `$impeccable adapt`. **Unresolved.**

### [P2] Home project title and season run together in a default list

Both reviewers saw the browser-default bullet and adjacent title/season text.
The index pages' scoped row CSS does not apply to the home. This underplays the
portfolio's one published project and makes its season hard to scan.

Repair: add home-scoped plain CSS using the incumbent index-row treatment,
spacing tokens, title typography and separate metadata line. Preserve the title,
season, route and all user copy. No component extraction is needed.
Suggested workflow: `$impeccable polish`. **Unresolved.**

### [P2] Different evidence states shift paired desktop courts

LeBron and Curry courts have equal 432px widths but their tops differ by 52px.
Curry's one-area evidence note adds a row before his court, disrupting horizontal
comparison at zero and positive movement.

Repair: align pre-court rows or reserve evidence-note space in desktop comparison.
Keep the note readable. Check empty B, supported, one-area and unavailable states;
do not choose a fixed height that fits only these two players.
Suggested workflow: `$impeccable layout`. **Unresolved.**

### [P2] Enlarged text overflows the narrow header

At actual 375×812 and root text enlarged from 16px to 32px, navigation extends to
442px. All six routes show the same width at 320px. Normal-size 320px and 375px
layouts fit. This test enlarged root text; it was not native browser zoom.

Repair: allow the incumbent title and navigation group to wrap when their minimum
widths do not fit. Preserve destinations, order, colors, fonts and normal-size
layout. Suggested workflow: `$impeccable adapt`. **Unresolved.**

## Additional unresolved findings

| Priority | Finding | Narrow repair |
| --- | --- | --- |
| P2 | Search suggestions stay expanded after keyboard Tab leaves the field; Escape at the new focus does not close them | Close on focus leaving the combobox, while preserving pointer option selection and arrow/Enter behavior |
| P2 | Chris Paul's unavailable 2025–26 state clears marks and finishes loading, but court title, description and detail still say Loading | Complete the court's text with the existing verified unavailable state; preserve identity, reason and null metrics |
| P3 | Short-page footer leaves cream below the closing green band | Defer low-impact page-shell polish if it broadens this pass |
| P3 | Shared comparison season select and range lack ID/name | Give them stable unique identifiers while preserving labels and handlers |

The Chrome form-field advisory names the shared **season select**. DOM inspection
also confirms missing identifiers on the shared range. Both have accessible
labels and function. This is browser/tooling completeness, not an established
unlabeled-control or security failure. Radios and prepared player-search IDs
are not the advisory source.

Nine distinct numbered findings remain: P0 0, P1 2, P2 5, P3 2. A smaller caption
spacing observation also remains: adjacent caption spans display
`2025-26.Before`. Preserve copy if adding whitespace later.

## Cognitive load, emotional journey and personas

Static pages have low cognitive load. The explorer's three steps group season,
player, view and share decisions. Five seasons live in a native select; the five
legend bins are an encoding key. Neither warrants arbitrary option removal.
Comparison has moderate load, with grouping, working-memory and chunking failures
on mobile. Existing limitations are factual copy; this audit does not recommend
removing them.

The home starts with confident type, loses authority at the unstyled project
link, and rewards exploration with real courts and explicit uncertainty. Mobile
comparison adds a valley before B can be chosen. Short pages lose visual closure
below the footer.

- **Jordan, first-timer:** “Choose Player B” precedes a complete A report, so B's
  selector can be missed. Preserve contextual explanations for score and range.
- **Sam, keyboard/accessibility user:** Focus and tested actions work, but search
  suggestions persist after blur and the range help name omits visible text.
  Enlarged header text adds horizontal navigation scrolling.
- **Casey, mobile user:** Two selectors are 2.7 screens apart. Courts fit, but
  changing B and comparing metrics require repeated scrolling.

The real audiences remain admissions readers and sports-analytics hiring readers,
as supplied in AGENTS.md. No new audience or biographical claim was invented.

## Guidance disposition

| Relevant criterion | Status | Evidence or limit |
| --- | --- | --- |
| Impeccable independent critique and deterministic scan | Passed | Isolated A/B reviews; A completed before B findings entered synthesis; usable CLI detector |
| Impeccable incumbent identity and content preservation | Passed | Application, public data, dependencies and security configuration unchanged |
| Impeccable native MCP discovery and hook approval | Needs work | Both skills discovered; both MCPs absent from native catalog; first-use hook approval unverified |
| Impeccable focused refinements and matched confirmation | Needs work | Baselines exist; no UI edits or after views |
| Durable product/design initialization | Needs work | PRODUCT.md and DESIGN.md remain absent; incumbent instructions supplied audit context |
| Apple purpose, familiarity and restraint | Passed for baseline | Charts lead; native controls and established typography remain |
| Apple agency and immediate feedback | Passed with exceptions | Full rendered matrix, reset and help pass; stale unavailable text and blur dismissal remain |
| Apple grouping and spatial consistency | Needs work | Mobile selector separation and desktop court drift |
| Apple typography and flexible reflow | Needs work | Normal-size reflow passes; 200% root-text header overflow |
| Apple reduced motion | Passed for tested Chrome baseline | Browser preference true; zero active animations; all routes and three explorer views checked |
| Apple translucent materials, replacement fonts, spring physics and haptics | Not applicable | Portfolio constraints and absence of gesture-driven sheets/drag motion |
| shadcn reference use | Passed | Actual tooltip reference call; no React/Radix code or website dependency installed |
| UI-UX-Pro-Max reference search | Passed as research | Design-system, editorial-style and warm-palette searches read; generic replacement colors/fonts/effects rejected under the binding brief |
| Physical touch, speech control, screen reader and full accessibility compliance | Unverified | No device or assistive-technology session |

## Verification evidence

- Six routes captured at confirmed 1440×1000 and 375×812. Normal-size 320×812
  reflow has no page overflow. At 200% root text, the header overflow remains.
- Both explorers × five seasons × six shares × three views × two viewports:
  **360 rendered states passed**. Values/events were driven through MCP browser
  evaluation; separate native keyboard checks covered search, ranges, court
  inspection, popup dismissal and reset. These are not 360 physical gestures.
- Capped Wembanyama, unavailable Chris Paul, duplicate-player rejection, season
  identity persistence and reset were checked. Unavailable court wording is the
  stated exception.
- Reduced-motion preference was true in a separate browser profile across all
  six routes at both sizes. No active animation or nonzero transition was found.
- Ordinary routes/matrix had no application console errors, failed requests or
  CSP violations. Fonts load from the same origin. View/share changes add no
  data requests; season/player changes fetch required selected payloads.
- Local built preview served matching Vercel/Netlify response headers alongside
  generated page CSP. Seven HTML policies, inline hashes, canonical URLs,
  sitemap/RSS base and absent tooling/environment paths passed static checks.
- A normal HTML negative fixture retained the actual generated policy. Chrome
  blocked its unhashed inline script and, after a real MCP click, its inline
  event handler. Both probe labels remained BLOCKED and console messages identify
  the exact denied directives. Expected fixture errors are separate from app errors.
- Current production build passed with seven pages and existing empty-blog,
  CSP-scope and syntax-highlighting warnings. Current dependency audit: zero
  reported vulnerabilities.
- All 2,503 built files match the security-release output byte for byte.
  All 85 recorded original untracked-file hashes remain unchanged.

Screenshots and raw protocol evidence are retained outside Git. Assessment A:
`/private/tmp/portfolio-ui-assessment-A.md`, with its evidence JSON. Assessment B:
`/private/tmp/portfolio-ui-assessment-B.md`; detector, 360-state matrix,
reduced-motion, keyboard, unavailable-state, Lighthouse and console/network
evidence are indexed there. Parent's current build, audit, static-security,
negative-CSP and preservation records use the `/private/tmp/portfolio-ui-` prefix.
Screenshots use A-/B- prefixes in the authorized visualization directory.

Limits: Chrome viewport emulation with a mouse; no physical touch, native zoom,
screen-reader speech, speech-control device, cross-browser test, slow-network
race, low-end performance trace, analytics revalidation, account-control
inspection, live hosting verification or deployment. No after-change
confirmation can be claimed because no repair occurred.

## Repair order and scope

Once hook approval is confirmed, repair the range accessible name, home row,
suggestion dismissal, unavailable court text, enlarged-header reflow and shared
control identifiers in focused steps. Show and verify each completed change
before its commit. Treat mobile comparison selector grouping and desktop court
alignment as evidence-backed layout work; ask before any required restructuring.
Defer the footer if it expands the pass. Preserve all established analytics,
data, factual copy, dependencies, identity and security rules. Complete one
matched confirmation pass, update the records and do not push or deploy.

Questions to resolve: first-use hook approval and correct worktree/native-tool
task context remain required. The user already authorized the bounded audit,
focused refinements and two independent reviewers; those permissions remain valid.
