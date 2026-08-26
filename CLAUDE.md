# Portfolio Site

## What this is

Narayan Lekhi's personal portfolio, displaying sports analytics projects. Each
project gets its own page: the question asked, the method, the findings, the code.

Site title is `Narayan Lekhi`, appearing minimally in the header. No large hero
treatment of it, no tagline underneath. One external link, github.com/nanu731.
No LinkedIn.

Audience splits evenly between college admissions readers and people hiring for
sports analytics roles. Both are smart and short on time. The admissions reader
may not know what a possession-level dataset is; the analytics reader will spot
hand-waving immediately. Be concrete and skip jargon that isn't doing work.

## Stack

- Plain CSS. No Tailwind, no component libraries, no UI kits.
- Static plots exported from R (ggplot2) as SVG, stored in `public/plots/`
- Analysis code lives in separate repos, linked from each project page
- Deployed on Netlify from GitHub, at `narayanlekhi.com`

### Build and hosting

Netlify builds this repo. These settings live in the Netlify dashboard, not in the
project, so they are written here rather than left invisible.

- Branch: `main`. Every push deploys.
- Build command: `npm run build`
- Publish directory: `dist`
- Node: pinned to 22 by environment variable in the dashboard, matching the
  `engines` floor in `package.json`
- Serving at `nlekhi.netlify.app`. That is the real address until the domain exists.

`site` in `astro.config.mjs` is set to `https://narayanlekhi.com` ahead of
registration. The domain is not bought yet, so canonical URLs, the sitemap, RSS,
and link previews stay broken until it exists and points at Netlify. They point at
the unregistered domain rather than at the netlify.app address, so they are wrong on
the live site too, not merely absent.

Project write-ups are `.mdx`, so a page can place band components, an interactive
chart, and tables at chosen points in the body. Blog posts stay plain `.md`. Plots
exported from R go in as `<img>` tags in both.

Do not add dependencies without asking. A portfolio site does not need a
framework on top of a framework.

Check https://docs.astro.build before working on routing, components, content
collections, or styling. Ignore its Tailwind, framework component, and
internationalization guides. All three are out of scope here.

### Running the dev server

Always start in background mode so the terminal stays free: `astro dev
--background`. Manage it with `astro dev stop`, `astro dev status`, and
`astro dev logs`.

## Visual direction

Bold and graphic. Strong color, large type, confident layout, real contrast.

Bold is the easiest direction to get wrong, because the default "bold" output
looks like every AI-generated landing page. The following are banned:

- Purple-to-blue gradients. Any gradient used as a hero background.
- Glassmorphism, frosted panels, blurred translucent cards
- Rounded cards in a three-column grid with icon, heading, two lines of body
- Emoji as icons
- Centered hero with a huge headline, a one-line subhead, and two buttons
- Generic sans stacks: Inter, Poppins, Montserrat as the primary face
- Drop shadows on everything
- Fade-in-on-scroll applied to every element

What bold should mean here instead:

- Flat color blocks over gradients. Full saturation, no tinted neutral scale.
- Type doing the heavy lifting. Real typographic scale, not four sizes of the
  same font at different weights.
- Asymmetry. Off-center layouts, deliberate white space, elements that break
  the grid on purpose.
- Charts treated as the graphic element. The plots are the visual identity of
  a sports analytics site. Design around them rather than decorating near them.

### Layout

Pages are a stack of full-width bands, cream and green alternating as structure,
with content at a different horizontal offset in each so the eye zigzags down.
Nothing is centred. Three rules hold the system together; breaking any of them
looks like a small change and quietly dismantles it.

- **The figure gutter.** Figures never take an offset. Every figure sits at one
  fixed left inset while prose bands shift around it, so figure numbers align down
  the page and the charts are the spine the moving text reads against. A figure
  inside a prose band cancels that band's offset to return to the gutter, and
  outgrows the text measure so the chart is the widest element on the page.
- **The green budget.** One green band per ordinary page, plus the footer. Two plus
  the footer on a project page. More and cream stops being the dominant surface.
- **Offsets come from the spacing scale**, never eyeballed, and exist only above
  48rem. Narrow gets one consistent inset, which is why this layout survives it.

Sand is for chart and table surfaces only. Never a layout panel.

Before implementing any visual decision, use the ui-ux-pro-max skill to search
for style and palette references rather than defaulting to model instincts.

### Color

Cream and dark green from the Milwaukee Bucks Cream City jerseys: 1970s-80s
athletic design filtered through Milwaukee's brick and cream masonry. Cream is
the dominant surface, not an off-white. Palette C, Masonry. Every value is a
custom property in one place; both constraints sit as comments beside them.

- `--cream` `#F2E9CE` page ground
- `--sand` `#D0BE9E` second surface: plot areas, zebra rows, pulled-out sections
- `--green` `#14532D` type, rules, full-bleed blocks
- `--accent` `#9C3D1E` rust: links, active nav, third chart series
- `--muted` `#C9BCA0` secondary type on green blocks only

- **Accent never on green.** Measured 1.34:1, invisible. Reversed green blocks
  take `--cream` or `--muted` for type, nothing else.
- **Charts separate series by green / accent / sand**, never by two greens. Every
  mid-green tested hit 1.7-2.8:1 against `--green`, under the 3:1 needed to tell
  series apart. Shape and fill carry the second channel.
- **Diverging ramps hatch the whole bad arm.** The zone ramp runs rust through sand
  to green in seven steps: positions 1-3 below average, 4 the neutral midpoint, 5-7
  above. Positions 1-3 carry a 45 degree hatch and 5-7 stay solid. Rust against green
  is the red-green axis, so the two arms collapse to one under protanopia and
  deuteranopia: the poles measure 2.3 apart and the inner pair 0.8. The hatch is what
  carries good against bad for those readers, and for grayscale print. Never dropped
  for looking busy. The seven values are `#9C3D1E`, `#B26750`, `#C6907F`, `#D0BE9E`,
  `#79A183`, `#477A56`, `#14532D`; ends and midpoint are `--accent`, `--sand`, and
  `--green` unchanged.

### Type

- Display: Fraunces, weights 500 and 600. Axes by role, not by size: `WONK 1`
  with `SOFT 80-100` on display and h1-h2, both flat at h3 and below, where wonky
  letterforms stop reading as intentional. Track `opsz` to rendered size.
- Body: Source Serif 4, weight 400, `font-optical-sizing: auto`.
- Numerals and labels: IBM Plex Mono, weights 400, 500, 600. Tabular data needs
  `font-variant-numeric: tabular-nums` explicitly; proportional digits break columns.

No fourth family. Astro's Fonts API applies `variationSettings` once per family
and cannot vary WONK and SOFT per element, so self-host the Fraunces variable
file through `fontProviders.local()` to keep per-role axis control.

## Writing rules

All prose runs through the stop-slop skill before it ships:

- No throat-clearing openers. Start with the substance.
- No em dashes.
- Active voice. Every sentence has a subject doing something.
- No adverbs.
- No "not X, it's Y" contrasts. State Y.
- No vague declaratives. Name the specific thing.
- Vary sentence length. Do not end every paragraph with a punchy one-liner.

Project write-ups specifically:

- Open with the question, not with context-setting.
- Report what was found, including negative and partial results. A finding that
  the effect is a wash is a real finding and should be stated as one.
- Name the methodological problems that came up and how they were handled. This
  is more interesting than a clean narrative and more credible.
- Do not oversell. No "revolutionary," no "game-changing," no claims the data
  does not support.

## Content structure

Projects are finished analyses. The blog is short writing, works in progress,
and notes. Two collections, not one: projects need fields blog posts don't, so
merging them would make every field optional and enforce nothing.

Projects schema beyond title and description: `question`, `dataset` (what data,
at what grain), `method`, `repo`, `seasons`. The write-up opens with `question`
rather than with context-setting, which is why it is a field and not a heading.

Blog posts carry `pubDate`; projects aren't chronological, so RSS is blog-only.

`/styleguide` is my colour and type reference: unlinked, unindexed, not public.

## Working conventions

- Ask before restructuring directories, renaming content files, or changing the
  palette and type choices once they are set.
- Make one change at a time and let me see it in the browser before moving on.
- Rewrite `docs/status.md` at the end of any session where something meaningful
  changed, without being asked. It is a handoff snapshot for a reader with no
  access to the code, so no file paths, no code, no implementation detail.
- **Keep the record honest in both directions.** Settling a decision must not delete
  the note that the thing still does not work. Finishing the work must not leave that
  note behind. These are the same rule read from either end: the document says what is
  true now, not what was true when someone last thought about it. Deciding how to build
  something and building it are different events, and the file has to distinguish them.
- **Sweep for the sibling claim.** One event usually falsifies more than one sentence.
  When something changes, go looking for the other places that quietly assumed the old
  state instead of fixing only the line that was pointed at. A file contradicting itself
  is worse than one uniformly out of date: the accurate half earns the trust that the
  stale half then spends.
- **Say which claims were checked.** Where a document asserts something about the world
  rather than about the code, verify it and note that it was verified. A remote state
  read from the remote, a domain confirmed by a lookup, a deployment confirmed by
  fetching it. Where something cannot be checked from here, say that plainly rather than
  guessing or going quiet.
- Use custom properties for spacing as well as colour.
- Never invent copy, project details, results, or numbers. Every claim on the
  site comes from me. Where copy is missing, leave a marker like
  `TODO_ABOUT_COPY` rather than filling it in.

## Launch state

No projects and no posts at launch. Ships with the home page, the About page, and
both indexes empty.

Both collections handle zero entries the same way: no "coming soon" cards, no
dummy entries, no filler, and no empty list container sitting under a heading. An
empty state that reads as deliberate beats fake content. This applies to the blog
index as much as the projects index.

## Settled

Newest first. A new decision goes on top, so this section reads as a log and
appending is the natural motion.

- **A write-up supplies its own bands through MDX with band components.** A project
  page places an interactive chart and leaderboard tables at chosen points inside the
  body, so it carries components rather than prose and images alone. Splitting plain
  markdown at headings and rotating the offsets automatically cannot express that, and
  cannot choose which section takes the green band. MDX is already configured, so this
  costs no new dependency.
- `seasons` is free text. Structured start and end pairs would let the projects index
  sort and filter, and with one project that buys nothing. Revisit if the index ever
  needs it; converting means editing frontmatter, not code.
