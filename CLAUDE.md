# Portfolio Site

## What this is

Narayan Lekhi's personal portfolio, displaying sports analytics projects. Built
with Astro, deployed as a static site. Each project gets its own page: the
question asked, the method, the findings, and the code.

The name appears minimally in the header. No large hero treatment of it, no
tagline underneath. Site title is `Narayan Lekhi`. The header carries one
external link, github.com/nanu731. No LinkedIn.

Audience is split evenly between college admissions readers and people hiring
for sports analytics roles. Assume both are smart and short on time. The
admissions reader may not know what a possession-level dataset is. The analytics
reader will spot hand-waving immediately. Write for both by being concrete and
skipping jargon that isn't doing work.

## Stack

- Astro (Blog starter), markdown content collections
- Plain CSS. No Tailwind, no component libraries, no UI kits.
- Static plots exported from R (ggplot2) as SVG, stored in `public/plots/`
- Analysis code lives in separate repos, linked from each project page
- Deployed on Netlify from GitHub

MDX stays configured, but write plain `.md`, with plots as `<img>` tags pointing
at `public/plots/`. Leaving MDX in place keeps componentised charts available
later without a migration.

Do not add dependencies without asking. A portfolio site does not need a
framework on top of a framework.

### Running the dev server

Always start in background mode so the terminal stays free: `astro dev
--background`. Manage it with `astro dev stop`, `astro dev status`, and
`astro dev logs`.

### Astro documentation

Full docs: https://docs.astro.build. Consult before working on related tasks:

- [Pages, dynamic routes, middleware](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Styling](https://docs.astro.build/en/guides/styling/) — CSS guidance only.
  Tailwind is not used on this project.

Framework components (React, Vue, Svelte) and internationalization are out of
scope. Do not add them.

## Visual direction

Bold and graphic. Strong color, large type, confident layout, real contrast.

Bold is the easiest direction to get wrong, because the default "bold" output
looks like every AI-generated landing page. The following are banned:

- Purple-to-blue gradients. Any gradient used as a hero background.
- Glassmorphism, frosted panels, blurred translucent cards
- Rounded cards in a three-column grid with an icon, a heading, and two lines
  of body text
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

- Display: Fraunces, weights 500 and 600. Axes by role: `WONK 1` with `SOFT
  80-100` at display sizes, `WONK 0` and `SOFT 0` below roughly 1.5rem, where
  wonky letterforms stop reading as intentional. Track `opsz` to rendered size.
- Body: Source Serif 4, weight 400, `font-optical-sizing: auto`.
- Numerals and labels: IBM Plex Mono, weights 400, 500, 600. Tabular data needs
  `font-variant-numeric: tabular-nums` set explicitly, since proportional digits
  break column alignment.

No fourth family. Astro's Fonts API applies `variationSettings` once per family
and cannot vary WONK and SOFT per element, so self-host the Fraunces variable
file through `fontProviders.local()` to keep per-role axis control.

## Writing rules

All prose on this site runs through the stop-slop skill before it ships. That
means:

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

```
src/content/blog/       short writing, works in progress, notes
src/content/projects/   finished analyses, one .md per project
src/pages/              routes: index, about, projects, blog, styleguide
src/layouts/            page templates
src/components/         reusable pieces
public/plots/           exported SVG/PNG charts from R
```

Two collections, not one. Projects need fields blog posts don't, so merging them
would make every field optional and enforce nothing. Projects get their own page
template.

Projects schema, beyond title and description:

- `question` — what the analysis asks. The write-up opens with this rather than
  with context-setting, which is why it is a field and not just a heading.
- `dataset` — what data, at what grain.
- `method` — the approach in a phrase.
- `repo` — URL of the analysis repo.
- `seasons` — seasons covered.

Blog posts carry `pubDate` and stay chronological. Projects are not, so RSS
covers the blog only.

`/styleguide` is my colour and type reference. It stays unlinked: absent from the
nav, filtered out of the sitemap, never in RSS. Not public content.

## Working conventions

- Ask before restructuring directories or renaming content files.
- Ask before changing the color palette or type choices once they are set.
- Make one change at a time and let me see it in the browser before moving on.
- When writing CSS, prefer custom properties for color and spacing so the
  system stays editable in one place.
- Do not generate placeholder or lorem ipsum content. Where copy is missing,
  leave an obvious marker like `TODO_ABOUT_COPY` rather than filling it in. The
  site description, About text, and footer line are all coming from me.
- Do not invent project details, results, or numbers. Every claim on the site
  comes from me.

## Launch state

No projects at launch. The site ships with the About page, an empty projects
index, and the blog section in place.

Build the projects index so it handles zero entries without looking broken. No
"coming soon" placeholder cards, no dummy projects, no filler. An empty state
that reads as deliberate is better than fake content.

## Still to decide

- Domain name. Something professional from some combination of lekhi, sports,
  and analytics, depending on availability. `astro.config.mjs` still has
  `site: 'https://example.com'`, which feeds canonical URLs, the sitemap, and RSS.
- Whether `seasons` is free text or a structured start and end pair. Decides
  whether the projects index can sort or filter by it.
- `AGENTS.md` still holds Astro starter text and contradicts this file on
  Tailwind, framework components, and i18n. Pick one source of truth.
