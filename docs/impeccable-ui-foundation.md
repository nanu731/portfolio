# Impeccable foundation: installation only

## Scope and provenance

Started from synchronized `main` at
`adbae3fd1d28db669372998d27644cc770006396` on
`codex/impeccable-ui-foundation`. The pushed `codex/unavailable-chart-state`
branch remains at `d100b07e83c9c32fac32a788326b6f92a498dd1f`; it is not an
ancestor of this work. Preserved untracked files remain excluded.

Installed with `npx impeccable install --providers=codex --scope=project` on
3 October 2026. Official source: https://github.com/pbakaus/impeccable.
The npm installer reports 4.1.0, the installed skill reports 4.5.0, and the
platform engine reports 0.1.11. These are separate upstream version numbers.

The 62 installed skill files match the official `skill-v4.5.0` universal archive
byte-for-byte. The hook matches that release after the installer's path change
from `.codex/skills/` to `.agents/skills/`. It runs the design detector on
PostToolUse and Stop, with respective 5-second and 30-second timeouts.
Upstream LICENSE and NOTICE accompany the vendored files.

The downloaded arm64 engine matches the official engine-v0.1.11 checksum:
`7427918d6e75507401a1b7b691eefe58a7c01a2fc63b712016ffc5a0ac1c05e6`.
It remains local and ignored. The committed launcher pins the engine version
and verifies a release checksum when it needs to download a missing binary.
No application dependency or lockfile changed.

## Checks and stop boundary

Hook JSON and bundled JSON parsed; five JavaScript syntax checks and shell
launcher syntax passed. Engine handshake returned `impeccable-engine 0.1.11`.
Ignore checks cover local config, caches, sessions, review screenshots and the
platform binary while retaining shared product/design records and the hook.
The production build passed: seven pages, with the existing empty-blog warnings.
Application source, public data, scripts and hosting configuration match main.
Git's whitespace check flags six existing lines in the upstream `extract`,
`harden` and `optimize` references. They remain unchanged to preserve release
identity. Project-written changes pass the whitespace check.

The skill is absent from this task's discovered skill list. Its official hook
instructions require first-use approval through Codex `/hooks`. No hook trust
was granted, no UI command or initialization ran, and no product or design
context was invented. Browser checks and matched screenshots remain pending
because this installation-only task made no visible change.

`AGENTS.md` remains its existing symlink to `CLAUDE.md`; the new workflow rules
there require Impeccable, context review, audit before editing, restrained
changes and visual verification. Existing historical hosting notes are outside
this installation's scope; current release facts remain in `docs/status.md`.

## Resume

Open a fresh Codex task rooted in this portfolio on this feature branch. Confirm
Impeccable appears in `/skills` (restart Codex if needed), review and approve
only this project's Impeccable hook through `/hooks`, then request
`$impeccable init` using existing site content and verified documentation.
Continue the authorized audit and subtle polish only after setup works. Do not
include the separate unavailable-chart repair. Keep UI changes in a later
commit. Merge and deployment still require separate approval after visual review.
