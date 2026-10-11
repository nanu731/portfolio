# Design tools and UI audit handoff

Updated 10 October 2026, America/New_York. Completed installations were reused.
Two independent reviewers completed the critique and baseline audit. UI repairs
and their confirmation pass remain pending because first-use hook approval is
unverified. No push or deployment ran.

## Isolated branch and preservation

Branch: `codex/portfolio-ui-refinement`; reviewed starting commit: `b2a9325`.
Base: released security main `62498a81ec8a6445fe5b2ec7b62b61de576f0314`.
The setup copied only the reviewed Impeccable installation from
`456b1db3b0802b59c9645d77e8ee1ecbbf481eed`, with 64 matching vendored files.
No installation was repeated. Application source, public data, dependency files
and hosting policies match the released security baseline. The final production
build's 2,503 files also match the security output byte for byte. All 85 recorded
untracked files in the original checkout retain their hashes.

## Installed tools and native availability

| Tool | Retained version | Verified status |
| --- | --- | --- |
| Impeccable | Skill 4.5.0, engine 0.1.11; historical installer 4.1.0 | Skill discovered; reviewed local files present; hook approval unverified |
| Apple Design | `emilkowalski/skills` revision `e8a175de22ae1e49370fc144c1f3bb9aeedf988d` | Installed user skill discovered and read |
| shadcn MCP | `@jpisnice/shadcn-ui-mcp-server@3.0.0` | Configured; actual tooltip tool call passed; absent from native tool catalog |
| Chrome DevTools MCP | `chrome-devtools-mcp@1.10.1` | Configured; actual browser tool calls passed; absent from native tool catalog |

The MCP servers reuse Node 24.16.0 outside the website. Chrome retains an isolated
profile, disabled usage statistics and disabled CrUX requests. No browser profile,
credential value, website dependency or lockfile changed. The shadcn React/Radix
reference was inspected; no component library was introduced.

Actual initialization, discovery and calls used a temporary stdio MCP client
with the authorized worktree/evidence roots. This verifies server connectivity;
it does not prove native Codex catalog availability. This chat remains attached
to the original checkout despite commands targeting the UI worktree. Computer
use denied inspection of Codex's own app; no alternate automation bypass was used.

Sources: [shadcn MCP](https://github.com/Jpisnice/shadcn-ui-mcp-server),
[Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp),
[Apple Design](https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md),
[Codex MCP configuration](https://learn.chatgpt.com/docs/extend/mcp?surface=cli),
[Codex hook trust](https://learn.chatgpt.com/docs/hooks).

## Hook approval remains required

The project instructions stop UI edits when the Impeccable hook needs approval.
The hook reference states: “On Codex, the user must approve the hook via `/hooks`
the first time.” The reviewed manifest invokes the local launcher on PostToolUse
and Stop. File presence, project trust and engine defaults do not establish that
Codex approved or executed it. No trust record was changed and no bypass was used.
A user confirmation request remains unanswered.

Open this existing worktree as a fresh local portfolio task, load both native MCP
servers, and review the exact project hook through Codex CLI `/hooks`. Confirm
approval before UI edits. Keep the installations and existing branch. Two-agent
permission is already granted and does not need to be requested again.

## Independent critique and technical audit

The user authorized two reviewers. Assessment A (`/root/design_review`) performed
an independent visual/design review; Assessment B (`/root/technical_review`)
performed detector and browser evidence checks. They used separate new browser
pages/profiles. A completed and entered parent context before B findings did.

The [combined durable critique](../.impeccable/critique/2026-10-11T02-43-09Z__src-pages-index-astro.md)
contains scores, locations, repairs, evidence and criterion dispositions.
Nielsen design score: 28/40, Good. Separate technical score: 16/20, Good.
The source detector reported zero primary findings and one `em-dash-overuse`
advisory in the internal style reference. Token names containing `--` caused a
false positive; no ignore was added. The detector overlay was skipped to preserve
CSP. Real screenshots, DOM/accessibility snapshots, console/network records and
Lighthouse replaced overlay evidence. No overlay or live detector server is
claimed.

Nine distinct findings remain unresolved:

| Priority | Finding |
| --- | --- |
| P1 | The Estimated Range (90%) trigger's accessible name omits (90%) |
| P1 | Mobile comparison separates Player A and B searches by 2,174px |
| P2 | Home project title and season run together in an unstyled list |
| P2 | Different evidence notes shift paired desktop courts by 52px |
| P2 | Enlarged root text overflows the narrow header to 442px |
| P2 | Search suggestions remain open after keyboard focus leaves search |
| P2 | Unavailable-season court text retains Loading after loading finishes |
| P3 | Short pages leave cream below the green footer |
| P3 | Shared comparison season select and range lack ID/name |

Chrome identifies the shared season select as the form-field advisory's affected
resource. DOM inspection also confirms missing identifiers on the shared range.
Both have accessible labels and working controls; no unlabeled-control or
security failure was established. Stable identifiers are the narrow repair.

PRODUCT.md and DESIGN.md remain absent. The existing site, project instructions
and verified documentation supplied the bounded audit context. Impeccable context
was not rerun. UI-UX-Pro-Max design-system, editorial-style and warm-palette
searches were completed and read as references. Their generic replacement fonts,
colors, grids and effects were rejected under the binding portfolio constraints.
Craft-floor remains for immediately before the first actual UI edit.

## Current verification

The background built preview applied the real Vercel response headers after
asserting equality with Netlify. It was stopped after the audit. Each reviewer
captured the six requested routes at actual 1440 x 1000 and 375 x 812, verified
through innerWidth/innerHeight. Normal-size 320 x 812 also reflowed without page
overflow. The 200% root-text test exposed the header issue; it was not native zoom.

Both explorers completed all five seasons, six slider settings and three views
at both viewports: 360 rendered states. The matrix dispatched input/change events
through MCP evaluation and checked rendered readiness, mode and values. Separate
native keyboard checks covered search, range, court inspection, popup dismissal,
duplicate rejection and reset. Wembanyama's cap and Chris Paul's unavailable
states were inspected in both explorers. No state caused page overflow or new
slider/view data requests. This does not claim 360 physical gestures.

A separate browser profile confirmed prefers-reduced-motion was true. All six
routes at both sizes had no active animation or nonzero transition; both explorers
also rendered the three views at 25%. Ordinary application routes/matrix had no
console errors, failed requests or CSP violations. Same-origin fonts loaded.

Seven built HTML pages have generated CSP and valid permitted inline hashes.
Script attributes remain denied. Host header sets match. Canonical URLs, sitemap
and RSS use https://www.nslanalytics.com. Published output contains no environment,
Git, skill, MCP or dependency-directory paths. A normal HTML negative fixture
kept the actual page policy: Chrome blocked its unhashed inline script and its
inline event handler after a real tool click. Both probes remained BLOCKED;
expected fixture CSP errors were recorded separately from application errors.

The current production build passed with seven pages and the existing empty-blog,
CSP-scope and syntax-highlighting warnings. The current dependency audit reports
zero vulnerabilities. The earlier clean installation remains valid for unchanged
dependency files. Screenshots, raw protocols and temporary clients remain outside
Git. No matched after views exist because no UI repair occurred.

## Evidence and limits

Independent reports: `/private/tmp/portfolio-ui-assessment-A.md` and
`/private/tmp/portfolio-ui-assessment-B.md`; B's report indexes the detector,
360-state matrix, reduced motion, keyboard, distinct states, network and Lighthouse
records. Current parent evidence includes the production-build log, dependency
audit JSON, static-security JSON, negative-security JSON and final-preservation JSON
under `/private/tmp/portfolio-ui-`. A-/B-prefixed screenshots remain in the
authorized visualization directory. The stored critique is this target's first
snapshot; there is no improvement trend yet.

Unverified: physical touch, speech-control device, screen-reader speech, native
zoom, other browsers, slow-network races and low-end performance. Lighthouse
category scores of 100 do not cancel its experimental range-label failure. No
analytics revalidation, account-control inspection, live-host validation, push or
deployment occurred. Existing security/account records remain historical evidence.

Next: resolve hook/native-tool task context; complete focused repairs one at a
time, show and commit each completed change, then one matched confirmation pass.
Ask before any necessary comparison restructuring or dependency addition.
Preserve all identity, factual copy, analytics, data and policies. Do not push or
deploy this branch.
