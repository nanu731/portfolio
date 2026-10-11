# Design tools and verification handoff

Updated 10 October 2026. Tooling setup is complete. UI review and refinement
remain pending; this record does not claim a completed design audit.

## Isolated branch

Branch: `codex/portfolio-ui-refinement`.
Base: remote main `62498a81ec8a6445fe5b2ec7b62b61de576f0314`, fetched before
creating the managed worktree. No push or deployment ran.

Only the reviewed Impeccable installation from
`456b1db3b0802b59c9645d77e8ee1ecbbf481eed` was copied from the foundation branch:
the skill, hook manifest, ignored runtime rules, installation record and workflow
instructions. The foundation branch's other changes were not merged. The
application source, public data, dependency files and hosting policies remain
identical to the released security baseline. All 85 recorded untracked files in
the original checkout retain their hashes.

## Installed development tools

| Tool | Version or revision | Location and configuration |
| --- | --- | --- |
| Impeccable | Skill 4.5.0; engine 0.1.11; historical installer 4.1.0 | Project-local skill and hooks; downloaded platform engine ignored |
| shadcn MCP | `@jpisnice/shadcn-ui-mcp-server@3.0.0` | Codex user configuration; stdio through the existing Node installation; no token |
| Chrome DevTools MCP | `chrome-devtools-mcp@1.10.1` | Codex user configuration; `--isolated --no-usage-statistics --no-performance-crux` |
| Apple Design | `emilkowalski/skills` at `e8a175de22ae1e49370fc144c1f3bb9aeedf988d` | User skill installation; appears in the next task's skill discovery |

Both servers use the existing Node 24.16.0 installation. No website dependency
or lockfile changed. The five pre-existing MCP entries were compared before and
after configuration and remain identical. A private settings backup remains
outside the repository. No credential values were requested or recorded.

Sources: [shadcn MCP](https://github.com/Jpisnice/shadcn-ui-mcp-server),
[Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp),
[Apple Design](https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md),
[Codex MCP configuration](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).

## Actual connection evidence

The new servers are absent from this already-running task's native tool catalog.
Their configuration alone was not counted as a connection test. A temporary MCP
stdio client performed real initialization, tool discovery and tool calls against
the pinned servers. It declared the authorized worktree and evidence directory as
MCP workspace roots. These are server smoke tests, not proof that a fresh Codex
task has loaded the native tools.

- shadcn returned its 3.0.0 handshake and the `get_component` tooltip reference
  without a GitHub token. The React/Radix example remains reference material.
- Chrome returned its 1.10.1 handshake, opened the built portfolio, captured twelve
  screenshots and inspected console messages and network requests.
- The temporary browser used an isolated profile, with usage statistics and CrUX
  requests disabled. The protocol process closed after verification.

The first local preview attempt failed because its temporary root-route guard
returned 403. The guard was corrected in the temporary preview server. Initial
screenshot writes also failed before the client declared its authorized MCP
workspace roots. The successful final run used the built local pages. These early
failures were not treated as successful browser or security checks.

## Baseline checks

The built preview applied the actual Vercel response headers, after verifying
that Netlify's configured header values match. Chrome inspected home, About,
projects, blog, NBA project and comparison at both actual 1440 x 1000 and
375 x 812 viewports. The tool read `innerWidth` and `innerHeight`; this was viewport
emulation with a mouse, not a physical touch-device test.

Each opening view had no horizontal overflow, application console error, CSP
violation or failed network request. The comparison page produced one DevTools
issue on each viewport: a form field lacks an ID or name. The affected element
and impact still need investigation before deciding a fix.

Screenshots and protocol/network evidence remain outside committed source. No
after screenshots exist because no UI edit occurred. Opening-view checks do not
establish complete explorer interaction or accessibility compliance.

The clean installation passed. The application dependency audit reports zero
vulnerabilities. The production build passed with seven pages and the existing
empty-blog, CSP-scope and syntax-highlighting warnings. All seven built HTML
pages contain generated CSP; inline scripts match permitted hashes; script
attributes are denied; arbitrary inline scripts are not allowed. Published
output contains no environment-file, Git, MCP, skill or dependency-directory
paths. Configuration and dependency files match the security release.

## Required review before UI edits

The project instructions stop UI edits when Impeccable's hook needs approval.
The reviewed hook invokes the versioned local launcher on PostToolUse and Stop.
The hook reference requires first-use approval by the user through Codex
`/hooks`. No hook trust record was altered or bypassed. Engine hook status shows
configuration defaults, which does not prove Codex approval or automatic execution.

Impeccable context ran once with the home-page source target. It permits narrow
refinement against the incumbent site while recording the missing PRODUCT.md and
DESIGN.md as documentation gaps. Applicable critique, audit, polish and hook
references were read. Apple guidance was read. Impeccable reported 4.5.2 available;
the reviewed 4.5.0 installation was retained. Update only in a later session so
a running task does not replace its active instructions.

Critique's Codex-specific gate requires permission for its two independent
reviewers. Permission was requested; no answer has arrived. No sub-agent was
spawned and no critique score was fabricated.

## Guidance status

| Criteria | Status | Evidence and remaining work |
| --- | --- | --- |
| Impeccable installation, context and external-tool setup | Passed | Pinned installation and successful protocol calls |
| Impeccable hook review and native Codex tool discovery | Needs work | Fresh task and user hook approval required |
| Impeccable independent critique and deterministic audit | Needs work | Reviewer permission and complete review pending |
| Impeccable matched refinement and confirmation | Needs work | Baselines captured; no UI edits or after views |
| Existing identity, fonts, layout, data and security preservation | Passed for setup | Application and public files unchanged |
| Apple immediate feedback, input continuity and spatial consistency | Needs work | Full interaction paths not reviewed this session |
| Apple typography, reflow and reduced motion | Needs work | Opening views have no overflow; expanded checks pending |
| Apple spring animations, glass materials and replacement fonts | Not applicable | Binding portfolio constraints and limited refinement scope |
| Physical touch, screen-reader speech and complete accessibility compliance | Needs work | No such evidence gathered |

## Continue in the existing worktree

Open a fresh portfolio task using this managed worktree and branch. Check that
Impeccable and Apple Design are discovered and both MCP servers expose native
tools; restart Codex only if those additions are absent. Review and approve only
the project's Impeccable hooks in `/hooks`. Do not reinstall or merge the
foundation branch again.

Resolve the pending reviewer permission. Capture durable product/design context
from the confirmed project instructions and existing code. Search ui-ux-pro-max
style and palette references before visual decisions; preserve the established
system. Read craft-floor immediately before the first UI edit.

Complete one evidence-based critique/audit, make focused refinements, show and
commit each completed change, then perform one confirmation pass. Verify both
explorers across all five seasons, six slider settings and three court views,
player selection, reset, help, capped and unavailable estimates, keyboard, reflow,
reduced motion, console/network and CSP. Keep source-only UI changes separate
from setup. Finish with matched screenshots, actual dimensions and per-criterion
evidence. Do not push or deploy this UI branch.
