# Project page blueprint

**Specification 1.0 · 5 November 2026 · approved release format**

This is the implementation contract for every NSL Analytics project page. Start
here when adding a project. The visual reference is the approved **NBA
Statistical Twins** interface: cream ground, clean masthead, green display type,
rust italic title emphasis, visible analysis, and expandable documentation.

This document supersedes the format recommendations in
`project-format-proposal.md`. That file and `project-format-differences.md` are
historical design records, not competing specifications. Approval of a page's
appearance does not approve new research claims or publication.

## 1. Authority and scope

- **MUST** means required. **MUST NOT** means prohibited. **MAY** means an option
  allowed only under the condition stated beside it.
- A later explicit owner instruction takes precedence. Record the changed rule
  here and verify the affected sibling projects in the same change.
- The common structure, component behavior, typography, colors and interaction
  states are fixed. The research question, available controls, chart geometry,
  result count, data scope and scientific explanations belong to each project.
- Do not change an analysis to make it resemble another project's analysis.
  Uniform presentation must preserve units, uncertainty, eligibility, nulls,
  statistical direction, source attribution and existing engine behavior.
- Home, Projects, About and Blog retain their established layouts. Adding a
  project adds a sourced listing; it does not redesign these pages.
- This document describes the reviewed format and release implementation.
  Deployment verification is recorded separately.
- The owner approved NBA Draft Success for this release. Its production entry
  uses `draft: false`. Keep future unapproved projects at `draft: true`.
- No dependency, palette change, font change, file move, rename, removal of work
  or directory reorganization is authorized by this blueprint.

## 2. Project registry and hierarchy

Use one project registry to build every project menu. Preserve this order in the
review draft; filter unpublished entries before generating production routes,
menus, listings and sitemap entries.

| Order | Display title | Route | Italic rust text | Relationship |
|---|---|---|---|---|
| 1 | NBA Statistical Twins | `/projects/nba-statistical-twins/` | Twins | Main project |
| 2 | Moneyball: Basketball Edition | `/projects/nba-economics/` | Edition | Main project |
| 3 | NBA Shot Selection Analytics | `/projects/nba-shot-selection-analytics/` | Analytics | Main project |
| 3a | Compare two shot mixes | `/projects/nba-player-comparison/` | shot mixes | Child of Shot Selection |
| 4 | NFL QBs Visualized | `/projects/nfl-qbs-re-evaluated/` | Visualized | Main project |
| 5 | Tennis point stages | `/projects/tennis-point-phases/` | stages | Main project |
| 6 | NBA Draft Success | `/projects/nba-draft-success/` | Success | Main project |

The comparison tool MUST NOT appear as an independent main project. Within the
Projects menu, its link is indented beneath Shot Selection. Hovering the parent
reveals the child for a mouse. An adjacent labeled disclosure button provides
the same action for touch and keyboard. The parent text remains a direct link to
Shot Selection. Do not make a hover-only destination.

Titles in headings, menus, listings and document metadata have **no terminal
period**. Retain meaningful internal punctuation, such as Moneyball's colon.
Sentence punctuation in descriptions and research questions is independent of
this rule. A question can retain its question mark.

### Externally hosted project

**NBA Game Predictor** is a button in the Home Projects section and Projects
directory. Its destination is `https://nbapredictions.happybuddha1008.workers.dev/`.
It opens a new tab with `target="_blank"` and `rel="noopener noreferrer"`, an
external-link SVG and an accessible new-tab label. Reuse `GamePredictorLink.astro`
and `public/external-project-link.css` for both placements. Keep hover, focus,
press and reduced-motion behavior. It has no local analysis route, fabricated
research description or placeholder method page, and is outside the main/child
registry above. The supplied site returned HTTP 200 on 5 November 2026.
Release preparation must carry the component, public stylesheet, BaseHead
stylesheet reference and both native page placements into the isolated checkout.
Prepared project-body exports do not include Home or the Projects directory.

## 3. Exact reading order

Every main project and child tool follows this order in both DOM and reading
sequence. Do not create a second competing menu or move documentation into a
project-specific position.

| Step | Required region | Contract |
|---|---|---|
| 1 | Skip link | First keyboard destination, targeting the main content |
| 2 | Site masthead | Logo/name; Home, Projects, Blog, About, GitHub |
| 3 | Project introduction | Scope eyebrow; one h1; existing question/description; Page sections menu |
| 4 | Selection region | Committed subject and context; shared selection action; A/B where applicable |
| 5 | View and context controls | Only controls supported by the analysis |
| 6 | Reading the chart | Closed disclosure, before the first analysis visual |
| 7 | Analysis workspace | Main visual, selected result, comparison/detail, inspectable records |
| 8 | How the model works | Closed top-level documentation disclosure, green surface |
| 9 | Limitations | Closed top-level documentation disclosure, cream surface |
| 10 | Definitions | Closed top-level documentation disclosure, cream surface |
| 11 | Sources and code | Closed top-level documentation disclosure, cream surface |
| 12 | Project footer | Project identity and More portfolio projects link |

Use these stable public anchors:

```text
main content         #main-content (or the existing skip target, preserved)
analysis workspace   #std-explorer
model documentation  #std-method
limitations          #std-limits
definitions          #std-definitions
sources/code         #std-sources
```

Existing deep links inside the source engine MUST keep working. Rehousing an
element must preserve its ID or provide a valid compatible target. Every ID must
be unique. An anchor-only empty disclosure is a defect, not documentation.

The selection region may be absent only for an analysis with no selectable
subject. In that case the fixed scope appears in its place, using sourced text.
Do not add a fake player selector. Draft Success uses a selected **draft pick**
and Find a player because a pick and a person are different analysis inputs.

## 4. Masthead, menus and footer

### Global masthead

- Cream background, thin rule below, normal document flow, no full-width green
  title banner. Do not replace global navigation with Explorer/Method links.
- Logo and Narayan Lekhi form the Home link. No tagline or oversized personal-name
  hero. GitHub points to `https://github.com/nanu731`. No LinkedIn link.
- Nav labels and order: **Home · Projects · Blog · About · GitHub**.
- Projects is a native disclosure with a visible chevron. Its first destination
  is the project directory, followed by the registry above.
- Main navigation text: Source Serif 4, 1.125rem on desktop, 1.05rem at widths
  up to 760px. Minimum interactive target: 44 × 44 CSS pixels.
- At widths up to 360px the navigation becomes a three-column grid. It must not
  shrink text until links are hard to identify or clip a destination.
- On phones the Projects panel stays within 18px of either viewport edge and is
  positioned below the trigger when space permits. Its own long content scrolls.
- The current destination has `aria-current="page"`, green background and cream
  text. Do not communicate the current page through color alone.
- Escape closes a menu and focuses its summary. Outside pointer input and page
  scrolling dismiss it. Internal panel scrolling must still work.
- Ordinary navigation remains a normal href. Modified click, browser history,
  copy link and opening a new tab must continue to work.

### Page sections

The introduction includes an outlined **Page sections** disclosure, separate
from the Projects menu. Its destinations are exactly:

1. Explorer
2. How the model works
3. Limitations
4. Definitions
5. Sources and code

Selecting a documentation link opens every closed ancestor of the target before
scrolling to it and moving focus. Direct hash navigation must do the same.
Preserve the destination hash. A link must never land inside hidden content.

### Footer

The project footer uses cream with green text and the common gutter. It shows
the project identity and **More portfolio projects**, linking to `/projects/`.
Keep any existing ownership notice in its appropriate shared shell. Do not
invent a new attribution, social link set or project-specific footer layout.
Phone footer items stack and remain left aligned.

## 5. Visual tokens and layout

The executable definitions are `docs/project-standard.css` followed by
`docs/project-standard-experience.css`. Load both in that order. The second file
contains intentional refinements, such as larger menus, balanced titles and
documentation disclosures. Do not copy the base values and omit its overrides.

| Token/role | Exact value or rule |
|---|---|
| Cream/page ground | `#F2E9CE` |
| Green/text and reverse blocks | `#14532D` |
| Rust/links and title emphasis | `#9C3D1E` |
| Sand/chart, code and table surfaces | `#D0BE9E` |
| Structural hairline | `#B8B79A`; never use this as body text |
| Secondary text on green | Existing `#C9BCA0`, only where contrast passes |
| Main width | `min(1160px, calc(100% - 2 * gutter))` |
| Gutter above 760px | 40px minimum; 1160px maximum-width container |
| Gutter at/below 760px | 18px |
| Spacing tokens | 8px, 16px, 26px, 44px, 55px |
| Base project prose | Source Serif 4, 1.1rem, line-height 1.5 |
| Display | Self-hosted Fraunces; h1 weight 550, italic emphasis weight 450 |
| Display axes | h1/h2 `WONK 1`, `SOFT 90`; retain source optical sizing |
| h1 desktop | `clamp(3rem, 6.7vw, 5.7rem) / 1.06` |
| h1 at/below 760px | `clamp(2.65rem, 10vw, 4rem) / 1.06` |
| Intro title tracking | Existing `-.045em`; retain approved title lettering |
| Intro deck | `clamp(1.08rem, 1.65vw, 1.35rem) / 1.5`; maximum 75ch |
| Eyebrow | IBM Plex Mono, .72rem/1.4, .09em tracking, uppercase |
| Eyebrow at/below 470px | .66rem; retain the small rust rule |
| Documentation h2 | Fraunces 550, `clamp(1.5rem, 2.2vw, 1.875rem) / 1.15` |
| Documentation summary | Minimum height 80px; 76px at/below 760px |
| Context selects | Minimum height 48px; explicit visible label |
| Other action targets | At least 44px high; icon-only target at least 44 × 44px |
| Documentation measure | Maximum 75ch for prose; tables may be wider |

Where this table names a role rather than every border/padding declaration,
reuse the shared selector unmodified. The two shared stylesheets are the exact
component recipes, not optional inspiration. A new project-specific override
must address a documented engine need, not approximate a shared component.

- Cream is the dominant page surface. The green model disclosure and existing
  chart surfaces supply contrast; do not turn every region into a green band.
- Sand is for plot areas, table rows and code/formula surfaces, not new layout
  panels. Rust text MUST NOT appear on green. On green, headings, links, term
  controls, icons and focus rings use readable cream.
- Formula/code surfaces use **green on sand**, including nested syntax spans.
  Descriptive prose outside the code surface inherits its surrounding region.
  Do not render cream formula text on sand or rust table links on sand.
- Reuse the three established fonts only. IBM Plex Mono carries labels and
  measurements. Explicit `font-variant-numeric: tabular-nums` is required for
  tables, outputs, scores, selected context and changing numeric readouts.
- h1 and h2 use balanced wrapping. Titles stay left aligned. Do not insert
  manual line breaks to make one screenshot fit.
- Charts return to the figure gutter; prose may retain approved engine offsets.
  No project-specific narrow chart column or offset may clip axes or labels.
- Preserve source figure numbers where they identify actual figures. Do not add
  decorative numbered documentation sections or the label **Field notes**.
- No gradients as hero backgrounds, glass panels, decorative blur, emoji icons,
  generic three-card feature grids, new font family, pervasive shadows or
  fade-in-on-scroll treatment.
- Reflow at 320, 375, 768 and 1440 CSS pixels. No page-level horizontal overflow.
  Wide scientific tables may scroll inside labeled, keyboard-accessible wrappers.
  Text and menus must remain usable at browser zoom. Long names wrap.

## 6. Shared subject-selection component

### Committed identity

Use `.std-selection-area` with `.std-selected-row` for each subject. A row has:
small role label; h2 committed identity; sourced context/status; primary action
with the common search SVG. At/below 470px the action and identity stack.

- Single subject: Selected player / Change player.
- Two independent subjects: Player A / Change player A, then Player B / Change
  player B. Do not reset the other slot when choosing one player.
- Draft discovery: Selected draft pick / Pick N / actual selected draftee context
  / Find a player. The complete cohort is searchable regardless of current pick.
- In-context inspection of an actual draftee uses the **same dialog** with a
  pick-scoped roster and a Change player action. It does not change the analysis
  view or select a fitted-outcome illustration.

The original native engine selectors remain the authoritative state inputs.
Adapters may hide their visual presentation, but must delegate changes through
the existing input/change/submit contracts. Do not create a second independent
player state or dispatch duplicate changes after a source engine commits an ID.

An adapter must expose the existing shared-controller contract:

```ts
type RosterEntry = {
  id: string | number;
  name: string;
  context?: string;
  source?: unknown;
};
type SubjectAdapter = {
  slot?: 'A' | 'B';
  label?: string;
  action?: string;
  pickerTitle?: string;
  ready: () => boolean;
  loading?: () => boolean;
  selected: () => string;
  context?: () => string;
  roster: () => Promise<RosterEntry[]>;
  commit: (entry: RosterEntry) => void;
};
```

`id` is a stable source identity, not a row index or normalized display name.
An ID need only be unique inside an explicitly scoped roster. `name` retains
source spelling. `context` distinguishes duplicate names and unavailable
measurements. `source` may retain the original option/payload reference required
by the engine. Escape/filtering must never call `commit`. Roster or commit errors
must reach the common recovery UI. A scoped actual-record adapter can omit the
top identity-row functions because its underlying selector owns that display.

### Dialog and search

- Native `<dialog>` opened with `showModal()`, labeled h2, visible search label,
  search input, live result count/status, result buttons and Close player list.
- Width: min(460px, viewport minus 28px). Padding: 24px. Maximum height: 85dvh.
  Cream, 2px green border. Results scroll within 42dvh. Close target: 44px.
- Opening focuses search and shows the full authoritative **scoped** roster;
  filtering works from the first character. Do not use a browser datalist as the
  visible shared player chooser.
- Normalize accents, case, spaces and punctuation. Support surname, whole-name
  substrings, name-word prefixes and unambiguous initials. Display real spellings.
- A result shows name plus available disambiguation: team, season, draft year,
  pick or eligibility reason. Duplicate names must not collapse into one entry.
- Enter chooses a unique exact match, otherwise a unique filtered match. Several
  matches require explicit selection. Empty results never select a fallback.
- ArrowDown from search focuses the first result. Up/Down traverse the results;
  Home/End reach the endpoints. Native Tab order remains available.
- Escape, explicit Close and a click outside the dialog cancel without changing
  selection. Closing returns focus to the opener without scrolling the page.
- A failed roster request reports the failure and recovery, rather than an empty
  successful result. Closing/reopening can retry. A late response cannot refill
  a closed dialog or replace the roster of a newer opening.
- Disabled controls have a real disabled state and do not animate as enabled.
  Scope changes invalidate the old roster. Preserve eligible identities by stable
  ID according to the source engine's rules; do not silently substitute a player.

### Controls that are not subject searches

Season, metric, team, view, category, match, point stage, draft pick, salary budget
and scenario controls remain labeled context selectors/radios/ranges. They share
height, typography, focus and feedback, but must not be disguised as player
searches. A finite set of **fitted-outcome illustrations** also remains a labeled
context selector. Its examples are model references, not a new committed actual
draftee or a claim of playing-style similarity.

## 7. Analysis workspace and reading help

- The view/context controls precede **Reading the chart**, which precedes results.
  It is a native, closed disclosure containing the existing interpretation guide,
  worked example, denominators and chart instructions. No invented guidance.
- Keep a short critical caveat beside the affected chart even when the longer
  Limitations section is collapsed. A closed disclaimer cannot repair a misleading
  label, unsupported score or missing uncertainty at the point of use.
- Chart heading, scope, units, legend, interaction instruction and readable
  selected result must stay discoverable together. Labels cannot rely on hover.
- Preserve SVG viewBox, chart labels, hit targets, keyboard-operable marks and
  source fallback records. Do not transform a plot mark's position for press
  feedback; use outline, stroke or opacity without moving its measurement.
- Use shape, labels, outlines or pattern as well as color. Preserve green/rust/
  sand series distinctions. For diverging quantities, preserve the seven-bin ramp
  and hatch on all three negative bins: `#9C3D1E`, `#B26750`, `#C6907F`, `#D0BE9E`,
  `#79A183`, `#477A56`, `#14532D`. Positive bins are solid.
- Shot make-probability is sequential, not a diverging quantity: retain its fixed
  bins below 30%, 30–40%, 40–50%, 50–60%, and 60% and above, and the supported-
  destination diamond. Never rescale these bins independently for each player.
- Formatting cannot change full-precision model inputs, ranking ties, axis
  meaning or thresholds. Display rounding is separate from calculation.
- Unavailable is not zero. Unsupported evidence remains unavailable with its
  supplied reason; retain any historical data the source still allows displaying.
- Ambiguous overlapping marks expose named alternatives; do not arbitrarily pick
  a person. Keyboard selection must remain precise and available on phones.
- Tables retain captions, units, row/column headers and reading order. Do not
  replace a meaningful table with a picture of that table.
- With JavaScript disabled, retain the existing explanation and pre-rendered
  records/default examples where supplied. A dynamic-only analysis must clearly
  explain its JavaScript requirement rather than display fake saved results.

## 8. Documentation and vocabulary

All four outer documentation disclosures start closed on a fresh unfragmented
visit. Their summaries, labels, order and IDs are fixed by section 3. The green
model treatment remains green when closed and open. The other three stay cream.
Each summary has a visible directional icon and native keyboard activation.

**How the model works** contains, in this order:

1. Existing concise model overview, if supplied.
2. **Method**, a closed nested disclosure with actual explanatory content.
3. **Formulas**, a closed nested disclosure with equations and symbol meanings.
4. **Validation and research**, a closed nested disclosure containing existing
   validation, evaluation, research precedents or explicitly scoped evidence.

Every nested disclosure must contain meaningful readable material, not just an
empty ID, hidden template, repeated title or a link to another empty region.
For a future analysis without a formula or validation study, state that supplied
scope truth explicitly. During authoring, a missing explanation is an obvious
`TODO_FORMULA_COPY` or `TODO_VALIDATION_COPY` blocker. Never invent a study to fill
the standard, and never ship a TODO marker. Document an approved omission here.

**Limitations** preserves the source's sample, data coverage, measurement,
uncertainty, causal and interpretation boundaries. **Definitions** preserves
metric names, units and deep-link targets. **Sources and code** provides named
data providers and scope, analysis/code access where public, downloadable
methodology/data where supplied, attribution and required license notices.

Do not link a private repository as though it were accessible. Do not change its
visibility. Link the public methodology when that is the approved available
resource. Data provenance, code license and font license are distinct records.

Term help uses the common native definition dialog: a correctly labeled title,
plain-language explanation, Close action and full-definition link. Underlined
term buttons indicate help and declare dialog semantics. The full-definition
action closes help, opens the relevant documentation ancestors, updates the
hash and moves focus to the real definition. Escape restores trigger focus.
Do not hide a term button in prose with no visible affordance.

## 9. Hover, press and motion

Use the shared experience layer. The approved behavior is restrained and remains
usable when animation is unsupported or disabled.

| Interaction | Required behavior |
|---|---|
| Fine-pointer link hover | Underline moves from 4px to 6px offset; 1.5px thickness |
| Menu hover | Green text on cream mixed with 7% green; **no dark rust/red block** |
| Ordinary control hover | Current-color outline with visible offset |
| Keyboard focus | 3px outline/4px offset in the experience layer; menu override 2px green/3px offset; cream on green |
| HTML press | Scale from current value toward .975 over 90ms; release to 1 over 160ms |
| Shared easing | `cubic-bezier(.2,.8,.2,1)` |
| Shared color feedback | 120ms; settling/disclosure feedback 200ms |
| Menu/view reveal | Restrained 4px shift settling over 180ms; no hidden default content |
| Cross-page transition | Old root 140ms fade/up 4px; new root 180ms from down 6px |
| SVG/chart mark press | Visible stroke/opacity feedback; no geometry translation or scaling |
| Range interaction | Thumb feedback; the numeric value still comes from the engine |

- Pointer, touch and keyboard activation receive feedback. Hover styling applies
  only with a fine hover-capable pointer. Touch must not depend on sticky hover.
- A new gesture retargets/cancels the old animation from its current rendered
  value. Do not queue clicks, delay navigation or lock controls until motion ends.
- Moving outside a control's original bounds plus 8px cancels activation; handle
  pointercancel, blur and release. Preserve scrolling and ordinary text entry.
- `prefers-reduced-motion: reduce` removes transforms, timed animation, animated
  scrolling, view-transition motion and **all `::details-content` transitions**.
  Outlines, selected states, content changes and normal navigation still work.
- Native cross-document view transitions are progressive enhancement. No new
  router/framework dependency, no page-wide spinner and no entrance animation
  on every section. Never hide critical content pending an animation.

## 10. Loading, performance and state truth

Use each requested feature only where the page has the matching need. These are
conditional behavior rules, not a demand to simulate a server on static pages.

| Feature | Required use | Prohibited substitute |
|---|---|---|
| Pre-rendering | Static shell, documentation and supplied default records exist in built HTML | Blank JS-only page shell |
| Skeletons | Real roster/data wait; mark decoration aria-hidden and announce loading | Timed artificial wait or permanent shimmer |
| Stable loading layout | Reserve the last useful chart height while the engine reports busy | Whole-page jumps or a skeleton covering controls |
| Optimistic update | Show explicitly selected identity and loading context immediately | Invented score, ranking, successful server write or new measurement |
| Stale-while-revalidate | Last successful roster metadata in the same scope, refresh in background | Mixing model values, identities, versions or seasons |
| Request cancellation | Abort superseded engine fetches; ignore late responses and closed-dialog results | A slow old response replacing a newer selection |
| Intent prefetch | Up to six same-origin page destinations per page, hover/focus intent | Eagerly downloading every player payload |
| Connection restraint | Skip prefetch with Save-Data or 2g/slow-2g | Assuming every reader has a fast laptop connection |
| Blurry placeholders | Only for a genuine raster-photo load, same aspect ratio, replaced on decode | Blurred SVG charts, formula text, glass panels or invented images |
| Tabular numerals | Tables, metrics and changing readouts | Proportional digits making values shift horizontally |
| Balanced headlines | h1/h2 wrap without clipping or manual device-specific breaks | Fixed width text that fails at zoom |

The shared roster cache has at most 12 URL-scoped entries and refreshes metadata
after 60 seconds. It retains identity/scope metadata rather than a duplicate set
of mutable model statistics. Do not add a service worker or offline persistence
policy without reviewing freshness, privacy and invalidation requirements.

The original engine owns schema/data-version validation, identity checks,
evidence eligibility, reset, scenario and URL semantics. The shared controller
adapts presentation only. Scope changes must revalidate selected IDs. Distinguish
loading, empty eligible scope, no search match, unsupported evidence, malformed
payload, network failure and success. Preserve valid old output only when it is
clearly identified; never relabel stale data as the new player's result.

## 11. Content and data rules

- Use approved project prose and documented exported results. Never invent a
  result, biography, cohort size, season, model, data license or performance claim.
- Question/description comes before background exposition. Existing research
  findings stay visible; formatting does not require a new marketing statement.
- Remove reader-facing development history: “current release”, “new version”,
  “previous implementation”, abandoned methods and unexplained version comparisons.
  State the method used by the page directly.
- Preserve genuine scientific time comparisons, training/test periods, previous
  seasons, priors and earlier draft picks. Those are not development history.
- Preserve version identifiers in machine contracts and technical downloadable
  provenance when needed for reproducibility. Do not run a blind string deletion
  across formulas, source links, IDs, data or model records.
- Explain metrics in ordinary language beside their technical names. Distinguish
  description, prediction and causation. Keep sample/evidence caveats attached.
- No em dashes in new prose, throat-clearing, inflated claims or invented numbers.
  Apply the established stop-slop writing review before shipping new copy.
- Values originate in the analysis repository. UI work does not refit a model,
  regenerate a research export, publish private provider rows or change thresholds.

## 12. Contracts for the existing projects

These are intentional content/visual differences within the shared page order.
They are not permission to change common menus, search, docs or interaction states.

### NBA Statistical Twins

- Fixed 2023–24 regular-season scope; 750-minute eligibility threshold. Do not add
  a fake season filter. Initial subject is Stephen Curry.
- One selected player, five ranked matches, twin map, selected head-to-head stats.
  Desktop map and ranking share the analysis area; at/below 760px ranking comes
  before the map. Both select the same comparison state.
- Map radial distance encodes similarity; angle carries no basketball meaning.
  Never describe it as actual shot location or a learned position embedding.
- Preserve All five matches, Next match and Find twins for [player]. Recentering
  changes the subject and updates the shared identity without losing focus.
- Preserve the eight-facet weighted percentile/nearest-neighbor methodology,
  score interpretation, tie rules and limitations. Rankings must match source.
- Sources retain game-log provenance, research precedents, downloadable
  methodology and applicable source/font notices. Private analysis code remains
  private. No invented public GitHub destination.

### Moneyball: Basketball Edition

- One selected player; contribution metric, season, team, salary units and
  supported time span are context controls. Roster follows the active view.
- Main league-wide contribution/pay chart precedes selected comparison/records.
  Preserve the meaning of the fitted line and above/below-line interpretation.
- Definitions state the actual least-squares fitting and cohort rules directly,
  without “current release” language. Preserve native-unit residuals and rounding
  rules, negative R² where defined and explicit undefined cases.
- Keep contribution and salary provenance, scope and provider notices. Do not
  substitute the unrelated uncommitted Moneyball research in a visual release.

### NBA Shot Selection Analytics

- One selected player, supported seasons, source evidence status, historical/
  relocation scenario and separate Modeled Ability view.
- Preserve supported season catalogs and selected-player-ID behavior; no silent
  replacement when a player is absent or ineligible in another season.
- Before & After starts at 0% historical shots. A positive slider overlays the
  source relocation destinations/origins. New player, season or reset returns
  that scenario to 0%. Modeled Ability preserves its chosen slider setting.
- Keep the fixed probability bins, evidence warnings, relocation marker shapes,
  original payload validators and source loading boundaries.
- Size the complete court by both available width and viewport height. The NBA
  court height is capped at 60svh (60vh fallback), preserving its viewBox and
  proportions. This leaves room to see the court and its key together on laptop
  windows, including MacBook Air-sized windows. Surrounding controls, results and
  documentation remain readable, normally scrolling content. Apply the same cap
  to the comparison and movement courts; do not crop plots or shrink page text.
  At desktop widths the single-player controls sit beside the court, retaining
  their document/focus order; narrow screens keep the existing stacked controls.
  The single court-sizing owner is public/shot-court-viewport.css, loaded only
  for the single-player and comparison pages. Do not add a second viewport cap
  to the shared experience stylesheet.
- Method contains spatial estimation/relocation rules and formulas; Limits
  contains interpretation/evidence restrictions; Terms retain native units.
- The child comparison link belongs to this project family, including in menus.
- Expose the existing comparison action as a green button beside Page sections
  in the opening. Retain its exact label and native link behavior; wrap the
  actions on narrow screens rather than hiding or shrinking the comparison.

### Compare two shot mixes

- This is a Shot Selection subproject, not a seventh independent study.
- Preserve a parent return link and interpretation note in the workspace.
- Independent Player A and Player B use the shared picker; both respond to one
  shared shooting scenario. Results remain paired with each player's identity.
- Parent definitions, uncertainty and method links open valid destinations.
  The page still presents the same four documentation slots; do not strand the
  reader with a standalone tool and no way to find its scientific explanation.

### NFL QBs Visualized

- Use the existing public comparison analysis, not the separate local execution
  study. Preserve its seasons, eligible quarterbacks and recorded data contracts.
- Two subject rows; Attribute profile and Stats comparison select the active
  visualization. Do not silently replace the second quarterback on an A change.
- Attribute guide/stat-specific explanations stay near the relevant result;
  formulas, research, data/manifests and limitations occupy the shared docs.
- Source datasets, saved comparisons and downloads remain inspectable. Table
  links on sand use green, readable underlined text.

### Tennis point stages

- Preserve category, player, point-stage and match controls and their eligibility
  relationships. Source years and charted-match scope remain explicit.
- Reuse the source worked reading example inside Reading the chart, then present
  the player charts. Point-stage grouping remains specific to this analysis.
- Retain sampled-match limitations, source/license attribution and existing
  methods. Research coverage is not evidence of a validation study; do not invent
  one to fill the documentation slot.

### NBA Draft Success

This is the approved Draft Success presentation under the shared blueprint.

| Role | Required behavior |
|---|---|
| Scope | 2009–2022 selections; first four seasons; source outcome cutoff |
| Intro | NBA Draft *Success*; existing question “What happens in the first four seasons?” |
| Initial state | Pick 41, accumulated WAR measure; source-selected actual record |
| Global subject action | Find a player searches all 838 source-directory draftees |
| Global player commit | Delegate to source form; update pick/year and open Players |
| Actual-record action | Shared search scoped to the selected pick; changes actual draft year, preserves view |
| Reference illustration | Separate native selector of supplied fitted-outcome examples; not an actual-player search |
| Main views | Overview, Players, Annual WAR, Careers, in that order |
| Phone views | Labeled native view selector with the same four choices |
| Other inputs | Pick 1–60/previous/next, WAR/rate, supported salary budgets and example method |
| Documentation | Shared four closed regions; old Methods view is rehoused into model documentation |

- Keep the approved expected-pick export, all 60 defaults and 179 supplied
  alternatives unchanged. Illustration labels distinguish observed outcomes from
  predictions and playing-style similarity. Preserve gaps and original pick/year.
- Preserve the selection URL parameters `pick`, `measure`, `budget`, `examples`,
  `player` and `reference`, plus the active view hash. Reload and Back/Forward
  restore actual player and illustration independently. Reject invalid values
  according to the source engine's fallback rules.
- Searching globally may move to another pick. Scoped inspection cannot do so.
  Plot selection updates actual draftee state; overlapping marks expose named
  alternatives without choosing automatically. Native underlying source inputs
  remain the state authority.
- Preserve Overview's expected four-season outcome, uncertainty/support and
  selected actual-player interpretation. Players retains both inspectable records
  and participation/exposure information. Annual WAR retains fitted four-season
  WAR divided by four and its per-season units. Careers retains its source
  threshold, bands and long-horizon limitations.
- Keep selected salary budget independent from the optional **Compare at 120%
  of rookie scale** panel. Opening that panel does not change the budget. Picks
  31–60 retain the explicit absence of first-round scale ceilings/matches.
- A nonparticipant can have zero accumulated WAR but no defined impact rate.
  Unresolved measurement is not a measured zero. Tiny rated samples retain their
  exposure caution; mean confidence intervals are not prediction intervals.
- Preserve the one approved Jokić season-impact worked example and its sources.
  Other players show only approved participation/availability and aggregate data;
  formatting cannot expose private provider-season values.
- Do not mount an individual-player similarity renderer or fabricate twins from
  the expected-pick illustration export. They are separate statistical questions.
- Keep all pre-rendered source tables, accessible plot controls, provenance and
  scientific paragraphs. A format adapter may relocate them, not drop them.
- The four-column paired-change table keeps whole-word headers on phones with
  normal word breaking and zero extra header tracking. Preserve font size and
  numeric cell contents; do not solve a narrow table by shrinking all data text.

## 13. Implementation ownership and delivery

Use the current stack: Astro/MDX, plain CSS, native HTML controls/dialogs and the
existing browser engines. No React, Tailwind, UI kit or animation dependency.
Follow the official [Astro styling documentation](https://docs.astro.build/en/guides/styling/)
for scoped/global CSS behavior; check the corresponding official documentation
before changing routing, components or content collections.

| Authoring file | Responsibility |
|---|---|
| `scripts/project-standard-transform.mjs` | Rehouse source HTML into the shared regions, retaining engine DOM and content |
| `docs/project-standard.css` | Shared presentation recipes and tokens |
| `docs/project-standard-experience.css` | Shared motion, menu, contrast and responsive refinements |
| `docs/project-standard-controls.js` | Subject adapters, common search, definition help and identity synchronization |
| `docs/project-standard-experience.js` | Pointer/keyboard feedback, menus, reveal, prefetch and true loading decoration |
| `scripts/project-standard-reader-copy.mjs` | Reviewed exact copy replacements, including generated prose |
| `scripts/project-standard-draft-source.mjs` | Isolated draft-only Astro build; never changes the source production gate |
| `scripts/project-standard-preview.mjs` | Functional local review site, noindex and no production analytics |
| `scripts/project-preview-versions.mjs` | Immutable saved local site versions and comparison data |
| `scripts/verify-project-blueprint.mjs` | Repeatable local structure, viewport, source-table and Draft interaction checks |
| `scripts/prepare-standard-release.mjs` | Explicit export into an isolated release checkout; use `--include-draft-success` to retain the approved Draft Success page |

The local verifier requires `BLUEPRINT_DRAFT_SOURCE`, the matching isolated
build's `dist/projects/nba-draft-success/index.html`. It compares scientific table
cells rather than accepting a visual-only pass. `BLUEPRINT_URL` selects the
running review site; `BLUEPRINT_REPORT` selects an untracked report directory.
`PROJECT_STANDARD_PLAYWRIGHT` and `PROJECT_STANDARD_CHROMIUM` can identify
existing browser tooling. These tools are review prerequisites, not new site
dependencies. Do not install dependencies to satisfy the verifier without asking.

The isolated native release uses `PreparedProject.astro`, prepared page JSON and
its manifest. The native build must not depend on a running localhost server,
Playwright, a browser cache or a fetch of the live website. Commit the exact
prepared head/body and asset graph. Register preserved inline script/style CSP
hashes through Astro. Preserve canonical and social-sharing metadata, original
engine scripts, public data, fonts, downloads, licenses and asset hashes.

Do not import an unused legacy layout into the prepared route: its global styles
can leak into the page, including green headings on green chart panels. Verify
computed colors, not just the authored rule. Do not disable CSP to make a preview
work. Keep script attributes blocked and host framing rules aligned with the
established security configuration. Test built pages, not dev-server behavior.

### Local review, versions and publication

1. Keep research source and unrelated dirty files intact. Record the starting
   branch/commit and explicit changed paths. Commit each completed scoped step.
2. Build the draft in an isolated copy where only that copy admits draft content.
   Root `isPublished` and `draft: true` remain effective for production.
   The local source builder fingerprints its own configuration as well as the
   source, requires a successful-build marker before reusing an output, and
   leaves public-file serving to the preview server. It does not duplicate every
   dataset into each cached source build. This exception applies to local review,
   not the normal production asset build.
3. Preview the functional site, including navigation, Home/Projects entries and
   the project itself. Local review uses noindex and omits production analytics.
   A page screenshot alone is not an interactive website draft.
4. Save a **named immutable website version** through the local preview lab.
   It captures page HTML plus referenced CSS, JS, fonts, data and downloads by
   content hash. Missing dependencies fail the save; there is no hidden live
   fallback. Test a saved version independently of the authoring server.
5. Earlier saved versions remain available for side-by-side comparison at phone,
   desktop and fill widths. These are local files, not remote backups. Deleting
   or moving their storage needs separate authorization.
6. Present the exact review URL and blueprint, with known remaining limitations.
   Wait for approval of that named version before admitting any unapproved project into release.
7. Only after approval, prepare the isolated production candidate, run its normal
   production build and checks, then obtain any still-required publication
   confirmation. A push to main deploys; a local commit does not.
8. After authorized deployment, fetch the public routes, metadata, source links,
   security behavior and the active production host. Check any secondary host
   separately before reporting that it changed. Never infer publication from a
   successful build. Use [the testing workflow](site-testing.md) for future experiments.

## 14. New-project intake and implementation procedure

Collect these inputs from approved analysis documentation before creating UI:

```text
DISPLAY_TITLE:
TITLE_ITALIC_WORDS:
SLUG:
PARENT_PROJECT: none or existing registry key
QUESTION:
DESCRIPTION:
DATASET_AND_GRAIN:
SEASONS_AND_CUTOFF:
METHOD:
SOURCE_REPOSITORY_AND_ACCESS:
APPROVED_DATA_EXPORTS_AND_SCHEMA:
DEFAULT_SELECTION_AND_REASON_FROM_SOURCE:
SUPPORTED_VIEWS_AND_CONTROL_SCOPES:
SCENARIO_RESET_RULES:
UNAVAILABLE_AND_INELIGIBLE_REASONS:
URL_STATE_CONTRACT:
READING_GUIDE:
METHOD_EXPLANATION:
FORMULAS_AND_SYMBOLS:
VALIDATION_OR_DOCUMENTED_EVIDENCE_SCOPE:
LIMITATIONS:
DEFINITIONS:
SOURCES_LICENSES_AND_DOWNLOADS:
NO_JAVASCRIPT_FALLBACK:
PUBLICATION_STATUS: draft
```

An unknown field is an explicit `TODO_...` in the local draft, never plausible
filler. Missing analysis inputs block that feature's release. Do not guess a
default player, eligible population, confidence level or statistical threshold.

Implementation sequence:

1. Read this contract and the approved analysis inputs. Capture matching desktop
   and phone views of the incumbent reference before editing.
2. Add metadata using existing collection fields: title, description, question,
   dataset, method, repo where available, seasons, draft. Retain existing compact/
   metadata-in-body flags where the engine owns those regions.
3. Register the main/child relationship once. Reuse the full shared shell and
   four documentation slots; map each source paragraph/table to a destination.
4. Write a subject adapter only where the engine needs one. Reuse the dialog,
   labels and authoritative source input events. Keep analysis logic out of it.
5. Attach original data/engine and preserve IDs, accessible names, deep links,
   query state and caveats. Apply common CSS rather than near-matching styles.
6. Verify the acceptance matrix below. Fix defects in a bounded pass and confirm
   the fixes. Save the reviewed version and record its unresolved issues honestly.
7. Link the blueprint in the implementation/review handoff. A deliberate exception
   requires an owner decision recorded here with scope and reason.

## 15. Acceptance matrix: all required before release

Record the command/report, target version and result for every applicable row.
“Not applicable” must name the missing capability that makes the test inapplicable.
A screenshot or a detector pass alone does not establish functional correctness.

| Area | Required evidence |
|---|---|
| Shared structure | Exact ordered regions, labels/anchors, one h1, four outer details closed, meaningful nested method content |
| Title/menu | No terminal periods; correct italic phrase; readable menus; current page; child comparison only under Shots |
| Listings | Source-derived title/description, correct main/child status, no draft leaks in production |
| Visual | Matched before/after desktop and 375px; inspect 320px, 768px, 1440px, long names and zoom |
| Overflow | No body overflow; charts/axes fit; wide tables scroll within their own labeled region |
| Contrast | Normal/placeholder/formula/code text ≥4.5:1; large text ≥3:1; UI/meaningful graphic distinctions ≥3:1; inspect SVG separately |
| Keyboard | Skip link, nav, child disclosure, picker, charts, details, term dialog, full definition, Escape and focus return |
| Mouse/touch | Hover on fine pointer; visible press; cancel after dragging off; scrolling preserved; no hover-only action |
| Motion | Rapidly interrupt interactions; reduced motion disables HTML, SVG, page and details-content movement |
| Search | Scoped roster, exact/partial/accent/unique/ambiguous/no-match names, duplicate identity, empty scope, cancellation |
| Async | Real loading, skeleton bounds, failure/retry, stale response, scope change, invalid payload, no fabricated results |
| State | Controls and plot agree; A/B independence; scenario reset; refresh and Back/Forward; valid and invalid URL values |
| Scientific integrity | Export hashes unchanged; values/rankings/nulls/thresholds/formulas/uncertainty match source |
| Data disclosure | No private provider rows, private repository link promise, missing license or invented validation claim |
| Pre-render | Meaningful built HTML, source fallback records, honest no-JS state, no dependency on authoring server |
| Security | Production build passes; no CSP violations; scripts/styles registered; no unsafe script attributes or relaxed security |
| Network | No missing local assets/downloads; no browser application errors; intended offline/saved behavior checked |
| Metadata | Correct title/description/canonical/social URL; preview noindex; approved production removes preview directives |
| Versioning | Named frozen version captured; compare prior version; saved page works without live-authoring fallback |
| Production gate | Unapproved draft routes, listings, menus and sitemap entries stay absent; no accidental push or deployment |

For Draft Success, additionally exercise all four views, picks 1/41/60,
WAR/rate, the supplied budget and example options, global lookup, scoped actual
draftee, unavailable rate, ambiguous marks, independent reference illustration,
rookie-scale boundary at picks 30/31, and restored URL/history state. Compare the
source table inventory and approved data hashes before/after formatting.

## 16. Maintaining this contract

Change a common component in its shared owner, update this document and inspect
all affected projects. Do not fork the same component into per-project variants.
Keep research-specific decisions in the project subsection. Record exceptions
with exact scope; a blanket “use judgment” is not an exception.

Retain historical records as history without allowing them to override current
rules. Update the session handoff to describe what works now, what remains local
and what was actually checked. A successful local review must not be described
as publication, scientific approval or a completed external review.
