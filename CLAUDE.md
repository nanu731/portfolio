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

`site` in `astro.config.mjs` is set to `https://narayanlekhi.com` ahead of
registration. The domain is not bought yet, so canonical URLs, the sitemap, RSS,
and link previews stay broken until it exists and points at Netlify.

MDX stays configured, but write plain `.md` with plots as `<img>` tags. Leaving
MDX in place keeps componentised charts available later without a migration.

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

## Still to decide

- Whether `seasons` is free text or a structured start and end pair. Decides
  whether the projects index can sort or filter by it.
