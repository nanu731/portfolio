# Integrating the NBA shot selection project

> **Current status, verified 6 September 2026:** The targeted version-two spatial
> integration supersedes the zone-era data and chart plan in this document. The
> portfolio uses schema `2.0.0`, data version `2025-26-targeted-v2`, 318 player
> payloads, 156 cells per player, historical shot markers, and six targeted relocation
> settings. It loads the player index once and one selected player payload at a time.
> The older zone component, assets, and version-one export remain preserved. Use this
> document for site architecture and historical rationale; where it conflicts with the
> spatial explorer or its verified export, those current sources control. Adding the
> other four seasons and a season selector is the next expansion, not part of this
> release.

Reference for the session that owns the shot selection analysis repo. It describes
the portfolio site well enough to produce output this site can drop in without a
translation step. Nothing here assumes you have seen the site.

Written 24 August 2026, revised 25 August 2026, against `main`. Deliberately no
commit hash: this line ships inside the commit it would have to name.

## Read this first

Thirteen rules. Break one and the work gets rejected or, worse, quietly dismantles
something. Everything else in this document is detail hanging off these.

1. **No dependency without asking Narayan.** Charting libraries and framework
   integrations both count. The site runs on five dependencies and no devDependencies.
2. **The accent never sits on green.** `#9C3D1E` on `#14532D` measures 1.34:1. Green
   blocks take `--cream` or `--muted` for type, nothing else.
3. **Charts never separate series by two greens.** Every mid-green tested landed between
   1.7 and 2.8:1 against `--green`, under the 3:1 needed. Shape and fill carry the
   second channel.
4. **Zone ramp positions 1 to 3 carry the hatch, positions 5 to 7 stay solid.** The
   hatch carries good against bad for red-green colourblind readers, who cannot separate
   the two halves of this ramp by hue. It is never dropped for looking busy.
5. **Figures never take an offset.** A chart goes inside `.figure` or it loses the
   gutter, and nothing errors when it does.
6. **The green budget is one band per page plus the footer, two plus the footer on a
   project page.** `Project.astro` already spends one on the question band.
7. **Sand is a chart and table surface.** Never a layout panel, never a full-width band.
8. **Every colour, space, and type value comes from a custom property** in
   `src/styles/global.css`. No hex literals, no pixel literals in new CSS.
9. **Never invent copy, numbers, or results.** Leave a `TODO_` marker. Every claim on
   this site comes from Narayan.
10. **The build is static.** No server, no API routes, no runtime environment variables.
   Everything is build-time or browser.
11. **Offsets exist only above 48rem.** Design every component to work at one inset with
    no offset at all, because that is what a phone gets.
12. **Plain CSS.** No Tailwind, no UI kit, no CSS-in-JS, no preprocessor.
13. **The banned list is real:** gradients as backgrounds, glassmorphism, rounded
    three-column icon cards, emoji as icons, centred hero with two buttons, Inter or
    Poppins or Montserrat, drop shadows, fade-in-on-scroll.

Prose follows the writing rules in `CLAUDE.md`: no em dashes, active voice, no adverbs,
no throat-clearing openers.

## Contents

**Decisions and rationale**

1. [Static assets](#1-static-assets)
2. [Data loading at 3 MB](#2-data-loading-at-3-mb)
3. [Charting libraries](#3-charting-libraries)
4. [Interactivity and the dependency question](#4-interactivity-and-the-dependency-question)
5. [Build and deployment](#5-build-and-deployment)
6. [The design system](#6-the-design-system)
7. [Colour scale for the 14 zones](#7-colour-scale-for-the-14-zones)
8. [Routing](#8-routing)
9. [Fitting the band system](#9-fitting-the-band-system)
10. [One project page or a section](#10-one-project-page-or-a-section)
11. [What to emit from the analysis repo](#11-what-to-emit-from-the-analysis-repo)
12. [Decisions, and where each one landed](#12-decisions-and-where-each-one-landed)

**Raw reference**

13. [Verbatim file contents](#13-verbatim-file-contents)
14. [The full src/ tree](#14-the-full-src-tree)
15. [Existing patterns, verbatim](#15-existing-patterns-verbatim)
16. [Responsive approach](#16-responsive-approach)
17. [Gotchas](#17-gotchas)

---

## The stack in one screen

| | |
|---|---|
| Framework | Astro 7.1.5, static output |
| Node | >= 22.12.0 |
| Dependencies | `@astrojs/mdx` 7.0.5, `@astrojs/rss` 4.0.19, `@astrojs/sitemap` 3.7.3, `sharp` 0.35.3 |
| Styling | Plain CSS in one file, custom properties for every colour, space, and type step |
| Framework integrations | None. No React, Preact, Vue, Svelte, or Solid |
| Charting libraries | None |
| Client JS today | One 6-line inline script on `/styleguide` |
| Build | `npm run build` writes `dist/` |
| Host | Netlify, deployed from GitHub, no `netlify.toml` in the repo |
| Domain | `narayanlekhi.com`, configured but not registered |

The whole repo is 12 `.astro` files, one CSS file, one TypeScript consts file, and
one content config. Read `CLAUDE.md` at the repo root for the design system and the
writing rules. It governs.

---

## 1. Static assets

### Where they live

Two directories, and the choice between them decides whether a file gets processed.

`public/` sits at the repo root and Astro copies it into `dist/` byte for byte. No
hashing, no optimisation, no import needed. Current contents:

```
public/
  favicon.ico
  favicon.svg
  og.png
  plots/.gitkeep      <- where exported R plots go
```

`src/assets/` runs through Astro's asset pipeline, which hashes filenames and
optimises images. It holds `fonts/fraunces-variable.woff2` and its licence.

### Convention

Anything in `public/` gets referenced by a root-relative path with no import:

```astro
<img src="/plots/zone-efficiency.svg" alt="..." />
```

`CLAUDE.md` fixes the convention for plots: static plots exported from R as SVG,
stored in `public/plots/`, referenced as `<img>` tags in markdown. Follow it. Your
five-best and five-worst SVGs go there.

Name them so they sort and read on their own: `shot-selection-best-2023-24.svg`
beats `plot1.svg`.

### One caveat for SVG in an `<img>` tag

An SVG loaded through `<img>` cannot inherit page CSS. It cannot read
`var(--green)`, and any font it names has to resolve on the client. So for the
pre-rendered narrative charts:

- Bake the hex values in at export time. Section 6 lists them.
- Either convert text to paths in R, or accept that the site's three faces load on
  the page and name them with fallbacks. Converting to paths is more reliable and
  costs you selectable text you do not need in a chart.
- Set a `viewBox` and drop `width`/`height` attributes so the file scales. Global
  CSS already applies `img { max-width: 100%; height: auto }`.

The per-player chart is different: it is inline SVG in the page, so it does read
CSS custom properties. Section 3 covers it.

---

## 2. Data loading at 3 MB

### The answer

Put the JSON in `public/data/shot-selection/`, fetch it at runtime, one season file
per request, on demand, cached in a `Map` for the session. Do not import it in
frontmatter, and do not let it reach the HTML.

### Why the other two options lose

**Bundled into HTML at build time.** If you `import seasons from '../data/2023-24.json'`
in an Astro frontmatter block, Vite reads it at build time. That much is fine: nothing
ships to the browser. The trap is the next step. To hand that data to a client script
you have to serialise it, either through `define:vars` or a `JSON.stringify` into a
script tag, and both inline the bytes into the HTML document. Five seasons means a
3 MB HTML file. It blocks first paint, no CDN caches it separately from the page, and
every visit re-downloads all of it. Reject this one.

**Bundled as hashed JS chunks.** Put the files in `src/data/` and load them with a
dynamic `import()` or `import.meta.glob`. Vite code-splits each season into its own
content-hashed chunk under `_astro/`, which Netlify serves with long-lived immutable
caching. Wire cost lands close to the fetch approach. Two things cost you: the data
joins the build graph, so Vite parses 3 MB on every build and any data revision needs
a site rebuild rather than a file copy; and JSON arrives as a JS module, so the
browser parses it as script.

**Fetched from `public/`.** Astro copies the files through untouched, Netlify serves
them as plain static JSON with compression on the wire, and the browser parses them
with `JSON.parse`. Updating data means copying files and committing. The one thing
you give up is automatic cache-busting, which you buy back by versioning the filenames
or the directory.

### First-load cost, stated

Assume the analysis repo also emits a small index file (section 11 specifies it).

| Stage | Cost | When |
|---|---|---|
| Project page loads | 0 bytes of JSON. Static SVGs and the chart script only. | first paint |
| Reader reaches the picker | `meta.json` 1.4 KB + `index.json` about 70 KB raw, near 20 KB gzipped | on scroll into view or on focus of the search box, not before |
| Reader picks a player | one season file, near 90 KB gzipped | first player from that season only, then cached |
| Worst case | 5 x 90 KB gzipped across a session | spread over interactions, none of it on first paint |

Because the picker shares the page with the write-up, defer the index fetch until the
picker enters the viewport or the search box takes focus. Otherwise every reader of the
write-up pays 20 KB for a feature they may never scroll to.

Compare with the bundled-into-HTML path: 3 MB of HTML before anything renders. The
gap is the whole argument.

### The index file is the load-bearing piece

The picker searches 1,507 player-seasons. It must never touch a 600 KB season file to
do that. Emit a flat index of name, team, season, and id, and keep the season files
for chart payloads only. Selecting a player is the moment you fetch a season.

### Fetch pattern

```js
const cache = new Map();

async function season(id) {
  if (!cache.has(id)) {
    const res = await fetch(`/data/shot-selection/${id}.json`);
    if (!res.ok) throw new Error(`season ${id} failed: ${res.status}`);
    cache.set(id, await res.json());
  }
  return cache.get(id);
}
```

Warm the likely season when the reader focuses the search input, so the fetch overlaps
their typing:

```js
input.addEventListener('focus', () => season(defaultSeason), { once: true });
```

### Caching headers

Astro's own hashed output under `_astro/` gets immutable caching from Netlify. Files
copied from `public/` do not, so each visit revalidates. Two ways to fix it, and both
need Narayan's sign-off because both add or change a file at the repo root:

1. Version the directory (`public/data/shot-selection/v1/`) and add a `netlify.toml`
   with an immutable header for that path.
2. Leave revalidation in place and accept a conditional request per season per visit.

Option 2 works today with zero new files. Do not add `netlify.toml` without asking.

### Repo weight

3 MB of JSON per revision lands in git history and stays there. If the analysis reruns
often, say so, and Narayan can decide whether to version the data directory or keep
only the current cut.

---

## 3. Charting libraries

Nothing is installed. `package.json` has five dependencies and none of them draw.

**Recommendation: do not add one.** Hand-author the SVG.

The court and its 14 zones are fixed geometry. Nothing about them needs a scale, an
axis, a layout algorithm, or a data join. The runtime work is one line per zone:

```js
path.setAttribute('fill', rampColour(value, n));
```

D3 would cost 60 to 300 KB depending on how much you take, and would earn none of it
back. The site already hand-writes SVG. From `src/pages/styleguide.astro`:

```html
<g stroke="var(--green)" stroke-opacity="0.16" stroke-width="1">
  <line x1="34" y1="30" x2="410" y2="30" />
</g>
<g fill="var(--accent)" fill-opacity="0.85">
  <polygon points="130,120 136,131 124,131" />
</g>
```

Two conventions from that file, both worth copying:

- `fill` and `stroke` resolve `var()`, so chart colours stay tied to the tokens.
- `font-family` does not resolve `var()` as a presentation attribute, so the file sets
  it through a CSS class instead. `font-size` stays an attribute, because inside a
  scaled `viewBox` it is geometry in user units rather than a type token.

### Where the court should live

Render the court and the 14 zone paths server-side in an Astro component, with a stable
id or `data-zone` on each path. The page then ships a complete, correct court in the
HTML before any script runs, and JS only sets fills. A reader with JS disabled sees an
empty court and the leaderboards rather than a hole.

```astro
---
// src/components/ShotChart.astro
import zones from '../data/shot-zones.json';
---
<svg class="court" viewBox="-250 -47.5 500 470" role="img"
     aria-labelledby="court-title court-desc">
  <title id="court-title">Shot selection by zone</title>
  <desc id="court-desc">Half court divided into 14 zones, each shaded by rate.</desc>
  {zones.map((z) => (
    <path id={`zone-${z.id}`} data-zone={z.id} d={z.d}
          fill="var(--sand)" stroke="var(--green)" stroke-width="2" />
  ))}
</svg>
```

Note the two homes for data. The zone geometry is small and presentational, so it goes
in `src/data/` and gets imported at build time. The 600 KB season payloads go in
`public/` and get fetched. Section 11 asks the analysis repo for both.

### Coordinate system

Use NBA half-court coordinates in tenths of a foot, hoop at the origin:
`viewBox="-250 -47.5 500 470"`. If your analysis already uses a different frame, keep
yours and state it once in `meta.json`. What matters is that one frame governs the zone
paths, the court markings, and any shot coordinates.

---

## 4. Interactivity and the dependency question

### Stated plainly

`CLAUDE.md` says no dependency gets added without asking Narayan first. A framework
integration is a dependency. So this is his call, and the honest version of the
tradeoff runs like this.

**Vanilla JS in a `<script>` tag.** Astro processes and bundles scripts in `.astro`
files by default, with TypeScript, so you get types and a bundle without configuring
anything. The site does this once already, on `/styleguide`:

```html
<script>
  const root = getComputedStyle(document.documentElement);
  document.querySelectorAll<HTMLElement>('[data-token]').forEach((el) => {
    const name = el.dataset.token;
    if (name) el.textContent = root.getPropertyValue(name).trim().toUpperCase();
  });
</script>
```

For this feature the work is one input, one filtered list, one selected player, and 14
`setAttribute` calls. Filtering 1,500 strings on each keystroke costs well under a
millisecond, so no virtualisation and no index structure are needed. Cap the rendered
results at about 50 rows and the DOM stays small. Call it 150 lines.

Cost: you wire state to DOM by hand. Add a comparison mode, a second chart, or sorting
that three tables share, and hand-wiring turns into a chore.

**A framework integration.** `npx astro add preact` brings Preact plus
`@astrojs/preact`, and ships around 5 KB gzipped to any page carrying an island.
React costs closer to 45 KB. You get reactive rendering and component state, which
matters when several widgets share state.

Cost: two new dependencies, a build integration, JSX in a repo whose 12 components are
plain Astro, and a second mental model for the person maintaining it.

**Recommendation: vanilla, with a stated tripwire.** One picker and three static tables
do not earn a framework. Write it in a script tag. If the interactive surface later
grows past roughly 250 lines, or a second widget needs to read the first widget's
state, that is the moment to ask about Preact rather than fighting the DOM.

### Three details worth fixing now

**Put the selection in the URL.** `?season=2023-24&player=201939` makes a chart
linkable, makes the back button work, and lets the narrative link to a specific player
mid-sentence. Use `history.replaceState` while typing and `pushState` on selection. On
load, read the query string, and if it names a player, fetch that season and draw it
before the reader touches anything. A shared link has to reproduce what the sender saw,
including scrolling the picker into view.

**Skip the combobox.** A popup listbox drags in `aria-expanded`, `aria-activedescendant`,
and roving focus, and it is easy to get wrong. A text input above a filtered list that
is always visible avoids all of it, and it matches the site's row-based listings. Use
`<input type="search">`, an `aria-live="polite"` count of matches, and real `<button>`
or `<a>` elements for rows so keyboard and screen reader users get them free.

**Announce the chart update.** When a selection changes the chart, update the
`<figcaption>` text and give the figure `aria-live="polite"`, so the change is not
silent.

---

## 5. Build and deployment

Static. `output` is not set in `astro.config.mjs`, and the Astro 7 default is
`'static'`. No adapter is installed. `npm run build` writes `dist/`, Netlify builds from
GitHub and serves the directory.

Confirmed defaults in this version: `publicDir` is `./public`, `build.format` is
`'directory'` (so `/projects/foo/` serves `projects/foo/index.html`), and
`trailingSlash` is `'ignore'`. Existing links write the trailing slash, as in
`/projects/${project.id}/`. Match that.

### What static constrains

- No API routes, no server code, no runtime environment variables, no request-time
  logic. Every byte is either build-time or browser.
- Any dynamic route needs `getStaticPaths`, which pre-renders one HTML file per path.
- Search, filtering, and chart drawing all run in the browser, or not at all.
- Astro's own hashed assets under `_astro/` get immutable caching; files copied from
  `public/` do not.

### The road not taken

You could pre-render 1,507 pages with `getStaticPaths`, one per player-season, each
with its chart already drawn. It would work: perhaps 30 MB of HTML and a slower build.
Two reasons to skip it. The picker still needs client JS to search, so you pay for the
JS either way. And switching players would cost a page load instead of a repaint.

### One trap

`site` in `astro.config.mjs` is `https://narayanlekhi.com`, and nobody has registered
that domain. Anything built from `Astro.site` (canonical URLs, sitemap, RSS) points at
a dead host until it exists. Never construct a data URL from `Astro.site`. Use
root-relative paths like `/data/shot-selection/2023-24.json`, which work on the Netlify
preview domain, on localhost, and on the real domain.

Local dev runs `npm run dev` on port 4321.

---

## 6. The design system

All of it lives in `src/styles/global.css`, imported once through `BaseHead.astro`, so
every page gets it. Use the custom properties. Do not write literal hex values or pixel
values in new CSS.

### Colour

Cream and dark green from the Milwaukee Bucks Cream City jerseys.

| Token | Hex | Role |
|---|---|---|
| `--cream` | `#F2E9CE` | page ground |
| `--sand` | `#D0BE9E` | second surface: plot areas, zebra rows, pulled-out sections |
| `--green` | `#14532D` | type, rules, full-bleed blocks |
| `--accent` | `#9C3D1E` | rust: links, active nav, third chart series |
| `--muted` | `#C9BCA0` | secondary type on green blocks only |

Two constraints govern, both measured rather than guessed:

**Accent never on green.** It measures 1.34:1, which is invisible. Green blocks take
`--cream` or `--muted` for type and nothing else.

**Charts separate series by green, accent, and sand, never by two greens.** Every
mid-green tested landed at 1.7 to 2.8:1 against `--green`, under the 3:1 needed to tell
series apart. Shape and fill carry the second channel so the encoding survives
colourblind readers and grayscale print.

Measured ratios, from `/styleguide`:

| Pair | Ratio | Verdict |
|---|---|---|
| Green on cream | 7.52 | AAA |
| Accent on cream | 5.59 | AA text |
| Cream on green | 7.52 | AAA |
| Muted on green | 4.85 | AA text |
| Green on sand | 5.01 | AA text |
| Accent on sand | 3.72 | graphic marks only, no text |
| Cream / sand step | 1.50 | surfaces read apart |
| Accent on green | 1.34 | banned |

For R exports, these are the hex values to bake in. Charts sit on the sand surface, so
`#D0BE9E` is the panel background, `#14532D` is ink, `#9C3D1E` is the third series.
Gridlines draw at 16% green (`rgb(20 83 45 / 16%)`) so they stay under the marks.

### Type

Three families, no fourth.

| Role | Family | Weights | Notes |
|---|---|---|---|
| Display and headings | Fraunces | 500, 600 | variable, self-hosted, four axes |
| Body | Source Serif 4 | 400 | `font-optical-sizing: auto` |
| Numerals and labels | IBM Plex Mono | 400, 500, 600 | tabular figures need opting in |

Fraunces axes go by role, not by size. `WONK 1` with `SOFT 80` to `100` on display, h1,
and h2. Both flat at h3 and below, where wonky letterforms stop reading as intentional.
`opsz` tracks the rendered size.

Scale, ratio 1.5 on a 20px body:

| Token | rem | px | Axes |
|---|---|---|---|
| `--type-display` | 5.625 | 90 | `opsz 144, SOFT 100, WONK 1` |
| `--type-h1` | 4.21875 | 67.5 | `opsz 96, SOFT 100, WONK 1` |
| `--type-h2` | 2.8125 | 45 | `opsz 72, SOFT 80, WONK 1` |
| `--type-h3` | 1.875 | 30 | `opsz 36, SOFT 0, WONK 0` |
| `--type-body` | 1.25 | 20 | Source Serif 4 |
| `--type-small` | 0.9375 | 15 | Source Serif 4 |
| `--type-label` | 0.75 | 12 | IBM Plex Mono |

Every step clamps so it does not overflow a phone.

`.label` is the mono, uppercase, tracked treatment used for eyebrows, table headers,
captions, and dates. `.numeric` carries the mono face with `tabular-nums`. Any number
anywhere takes one of them. Proportional digits break column alignment.

### Spacing

| Token | rem | px |
|---|---|---|
| `--space-3xs` | 0.25 | 4 |
| `--space-2xs` | 0.5 | 8 |
| `--space-xs` | 0.75 | 12 |
| `--space-s` | 1 | 16 |
| `--space-m` | 1.5 | 24 |
| `--space-l` | 2.5 | 40 |
| `--space-xl` | 4 | 64 |
| `--space-2xl` | 6 | 96 |
| `--space-3xl` | 9 | 144 |

Rules carry depth, not shadows: `--rule-thin` 1px, `--rule` 2px, `--rule-thick` 4px.

### CSS approach

Plain CSS. Global tokens and element defaults in `global.css`; anything page-specific
goes in that page's scoped `<style>` block in the `.astro` file. No Tailwind, no
component library, no CSS-in-JS, no preprocessor.

### Chart-specific classes that already exist

```css
.plot { background: var(--sand); padding: var(--space-m); }
.figure { margin: var(--space-l) 0; }
.figure figcaption { margin-top: var(--space-s); max-width: 46rem; font-size: var(--type-small); }
```

One gap to know about: `.plot svg { display: block; width: 100%; height: auto }` exists
only inside the scoped `<style>` of `styleguide.astro`. It is not global. Any new page
with an inline SVG chart has to declare it, or Narayan should promote it into
`global.css`. Promoting it is the better fix and it is a one-line change.

### Tables

Already styled globally. Use the markup, add nothing:

```html
<table>
  <caption>Best zone efficiency, 2023-24</caption>
  <thead>
    <tr><th>Player</th><th class="n">Shots</th><th class="n">Rate</th></tr>
  </thead>
  <tbody>
    <tr><td>Name</td><td class="n">412</td><td class="n">0.612</td></tr>
  </tbody>
</table>
```

`th.n` and `td.n` right-align and switch to tabular mono. Even rows get `--sand`. The
table element is `display: block` with `overflow-x: auto`, so a wide table scrolls
inside its own box rather than pushing the page sideways.

---

## 7. Colour scale for the 14 zones

### The problem, restated

You need a continuous bad-to-good ramp. Two site rules block the obvious route: the
accent measures 1.34:1 on green, and two greens cannot separate as series. A third
constraint shows up once you start drawing: green court lines vanish on a dark green
fill.

I derived a ramp, then validated it rather than trusting it. Two attempts failed, and
the failures decided the design.

**Attempt one** held lightness roughly constant and pushed chroma out to the token hues,
looking for saturation without darkness. It produced `#FB4F00` and `#00B05C`. Chroma
landed at 0.17 to 0.22 against a palette whose widest token reaches 0.134, so the ramp
read as neon against cream and masonry green. Wrong site.

**Attempt two** held every fill light enough that green ink kept 3:1 against it, so the
court outline would survive everywhere. That capped lightness in a narrow band, and the
narrow band collapsed the ramp: adjacent steps landed 0.042 to 0.057 apart in OKLab
lightness (the floor is 0.06), and mirror pairs across the midpoint separated by as
little as 4.9 under normal vision, below the 15 threshold. Full-colour readers could
not tell a mildly cold zone from a mildly hot one.

**The lesson.** Protecting the court ink through lightness is what breaks the ramp.
Protect it per zone instead, and let lightness carry magnitude.

### The ramp

Seven stops. The midpoint and both poles are exact site tokens. The four intermediate
steps hold the pole's hue and step down in lightness.

| Step | Hex | OKLab L | Ink on it | Ink contrast |
|---|---|---|---|---|
| cold 3 (worst) | `#9C3D1E` (`--accent`) | 0.486 | cream | 5.59 |
| cold 2 | `#B26750` | 0.593 | cream | 3.50 |
| cold 1 | `#C6907F` | 0.701 | green | 3.34 |
| **neutral** | `#D0BE9E` (`--sand`) | 0.808 | green | 5.01 |
| warm 1 | `#79A183` | 0.671 | green | 3.14 |
| warm 2 | `#477A56` | 0.533 | cream | 4.14 |
| warm 3 (best) | `#14532D` (`--green`) | 0.393 | cream | 7.52 |

Adjacent steps sit 11.1 to 15.2 apart in OKLab distance, so every step reads as a step.

**The neutral midpoint is `--sand`, which is also the plot surface.** A zone at league
average takes the colour of the panel it sits on and disappears into it. Only departures
carry ink. That is the strongest available reading of "neutral", and it costs nothing:
sand is already the documented chart surface.

Both arms passed the ordinal ramp checks: monotone lightness, every adjacent gap at or
above 0.06, light end clearing the surface, single hue per arm.

### The colourblind problem, and why texture is mandatory

Rust against green is the red-green axis, the worst case for the two most common forms
of colour vision deficiency. Simulated under protanopia at full severity, the two poles
separate by 2.3, the inner mirror pair by 0.8. For those readers the ramp collapses into
a single lightness gradient with no polarity.

That is not fixable inside this palette. The site has no blue, and adding one changes
the palette, which needs Narayan's approval.

**So polarity moves to a second channel: cold zones get a 45 degree hatch, warm zones
stay solid.** A protan reader then sees darker as stronger and hatched as cold, which
decodes completely. The same encoding survives greyscale print and forced-colours mode.
`global.css` already states the doctrine: shape and fill carry the second channel.

```html
<defs>
  <pattern id="cold-hatch" width="6" height="6" patternUnits="userSpaceOnUse"
           patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="6" stroke="var(--green)"
          stroke-width="1" stroke-opacity="0.35" />
  </pattern>
</defs>
```

Apply it as a second `<path>` over the filled zone, sharing the same `d`, so the fill
and the texture stay independent.

### Ink flips per zone

Each zone strokes its own boundary, so the stroke always sits against its own fill. Flip
the stroke and any label at the midpoint of the ramp:

```js
// Step index runs 0 (cold 3) to 6 (warm 3). The two deepest steps at each end
// take cream; the three around the neutral take green. Matches the table above.
const ink = (step) => (step <= 1 || step >= 5) ? 'var(--cream)' : 'var(--green)';
```

Because the 14 zones tile the half court, their shared edges reproduce the three-point
line, the key, and the restricted area for free. The only extra green strokes are the
outer boundary and the backboard, both of which sit on sand.

### Printed numbers

No ink clears 4.5:1 on the two deepest steps of either arm, so a plain number inside a
dark zone fails WCAG. Two ways out:

1. Keep numbers off the court. Put them in the leaderboard tables and in a hover or tap
   tooltip. The chart carries a legend with scale ticks.
2. Halo the text, which is how map labels solve this:

```html
<text x="0" y="120" fill="var(--green)" stroke="var(--cream)" stroke-width="3"
      paint-order="stroke" class="zone-label">.612</text>
```

`paint-order="stroke"` draws the cream stroke first, so the green glyph reads against
cream at 7.52:1 whatever sits behind it. Use `class` for the font family, since
`font-family` does not resolve `var()` as a presentation attribute.

Do both. Halo the headline number in each zone, and put the full grid in a table.

### Thin samples

A zone with 12 shots and a zone with 400 must not look equally certain. Three
mechanisms, in order of importance.

**1. Colour the shrunk estimate, not the raw rate.** Compute the shrinkage in R and
ship it, so the visual regression toward neutral is a property of the estimate rather
than a cosmetic overlay:

```
shrunk = (made + k * p_league) / (n + k)
```

where `p_league` is the league rate for that zone and season, and `k` is the prior
weight in shots. A zone with n = 12 lands near the league rate, which maps to the
midpoint, which is the sand surface, so it fades into the panel on its own. A zone with
n = 400 barely moves. The ramp then does the uncertainty work with no extra channel.
Pick `k` by empirical Bayes on the league distribution and report the value you used.

**2. Hatch density carries n as a backup.** If the shrunk value alone reads as too
subtle, widen the hatch spacing on low-n zones so thin samples look sparse. Keep this
subordinate to the shrinkage; two competing uncertainty channels confuse more than one.

**3. Below a floor, do not colour at all.** For n under about 5, leave the fill at
`--sand`, keep the hairline outline, and print an em rule rather than a number.
An honest empty beats a colour built on four shots.

Ship both `rate` and `rate_shrunk` in the JSON, print the raw rate and n in the tooltip
and table, and colour by the shrunk value. Then say so in the write-up. `CLAUDE.md`
asks project write-ups to name the methodological problems and how you handled them,
and shrinkage is exactly that kind of problem.

### The legend has to show both channels

Seven swatches with the neutral labelled "league average", plus one hatched swatch
labelled "below average" and one solid labelled "above average", plus the value at each
tick. A ramp without a labelled neutral is unreadable.

### Widen the neutral band

The innermost mirror pair (`#C6907F` against `#79A183`) separates by 11.5 under normal
vision, under the 15 threshold. Rather than re-stepping, widen what counts as neutral:
leave a zone at sand unless its shrunk estimate departs from league average by more than
its own uncertainty. Zones that fail that test are not distinguishable from average, so
painting them as mildly cold or mildly warm overstates what you know. This fixes the
perceptual problem and the statistical one with the same rule.

---

## 8. Routing

File-based, from `src/pages/`. Current map:

| File | URL |
|---|---|
| `index.astro` | `/` |
| `about.astro` | `/about` |
| `blog/index.astro` | `/blog` |
| `blog/[...slug].astro` | `/blog/<id>/` from the `blog` collection |
| `projects/index.astro` | `/projects` |
| `projects/[...slug].astro` | `/projects/<id>/` from the `projects` collection |
| `rss.xml.js` | `/rss.xml`, blog only |
| `styleguide.astro` | `/styleguide`, unlinked and out of the sitemap |

### Content collections

Defined in `src/content.config.ts` with the `glob` loader. The `projects` schema:

```ts
z.object({
  title: z.string(),
  description: z.string(),
  question: z.string(),      // the page's visible h1
  dataset: z.string(),       // what data, at what grain
  method: z.string(),
  seasons: z.string(),
  repo: z.string().url().optional(),
  draft: z.boolean().default(false),
})
```

A markdown file at `src/content/projects/shot-selection.md` produces
`/projects/shot-selection/` with no routing work. `draft: true` keeps an entry visible
in dev and out of the production build, through the shared `isPublished` helper in
`src/consts.ts`. Use it while the numbers are unverified.

### Adding a page or a section

A new page is a new `.astro` file. A new section is a directory. Three things to
remember:

- A static file beats a dynamic route for the same path, so a hand-written page and a
  collection entry claiming the same URL will not collide. The static file wins.
- The sitemap picks up new pages on its own. Only `/styleguide` is filtered out.
- **The shot selection project adds no routes.** It is one collection entry serving
  `/projects/shot-selection/`. Narayan settled this on 24 August 2026, along with no
  fifth nav item. Four links stay four.

---

## 9. Fitting the band system

### How bands work

Every page is a stack of full-width `.band` elements, cream and green alternating, each
holding a `.band-inner` that carries the inset and the measure. Content sits at a
different horizontal offset per band so the eye zigzags down. Nothing is centred.

```html
<div class="band prose-band">
  <div class="band-inner at-step">
    ...
  </div>
</div>
```

Offsets come from the spacing scale and exist only above 48rem:

| Class | Offset |
|---|---|
| `.at-edge` | 0 |
| `.at-step` | `--space-xl`, 64px |
| `.at-deep` | `--space-3xl`, 144px |

Below 48rem every band takes one inset and the offsets vanish. Design the picker and the
tables so they work with no offset at all, because on a phone that is what they get.

### Three rules that break quietly

**The figure gutter.** Figures never take an offset. `.figure` cancels its parent band's
`--offset` with a negative margin and grows by the same amount, so every figure on a page
shares one left edge and the charts become the spine the moving text reads against:

```css
@media (min-width: 48rem) {
  .figure {
    margin-inline-start: calc(-1 * var(--offset));
    width: calc(100% + var(--offset));
  }
}
```

This only works inside `.figure`. A chart in a plain `<div>` loses gutter alignment and
nobody notices for a week.

**The green budget.** One green band per ordinary page plus the footer. Two plus the
footer on a project page. The footer is green on every page, and `Project.astro` spends
one on the question band. **A shot selection project page has exactly one green band
left.** Spend it on the finding, the one sentence a reader should leave with. Neither
the picker nor a table gets to be green.

**Sand is never a layout panel.** `CLAUDE.md` puts it plainly: sand is for chart and
table surfaces only. Your question mentions a rule that sand never abuts green. The
rule in the repo is stronger and simpler: a sand band does not exist, so the adjacency
never comes up. Sand appears inside `.plot` and in zebra rows, both of which live in
cream bands.

### Where this breaks for three views

**Markdown cannot emit bands.** `Project.astro` wraps the entire `<slot />` in one
`.prose-band` at `.at-step`. So a `.md` project write-up is one band at one offset. The
alternating offsets described in `CLAUDE.md` are the intent, and the layout as built does
not yet produce them for markdown bodies. Three views need bespoke bands, which means
either MDX with band components or a hand-written `.astro` page, plus a change to how
`Project.astro` handles its slot. This is the single biggest structural finding in this
document, and it drives section 10.

**The picker is not a figure.** A figure is a fixed artifact with a caption at the
gutter. The picker is a control plus a figure. Give it its own cream band at `.at-edge`,
with the control row at the inset and the resulting chart in a `.figure` directly under
it, inside the same band. Since `.at-edge` sets `--offset` to 0, the figure's negative
margin resolves to zero and the chart lands on the gutter, aligned with every other
figure on the page. Keeping the control and its output in one band keeps them one unit.

```html
<div class="band picker-band">
  <div class="band-inner band-inner--wide at-edge">
    <label class="label" for="player-search">Find a player</label>
    <input type="search" id="player-search" autocomplete="off" />
    <p class="label" aria-live="polite" id="match-count"></p>
    <ul class="rows" id="results"></ul>

    <figure class="figure">
      <div class="plot"><!-- ShotChart --></div>
      <figcaption>
        <b class="label">Fig 3</b>
        <span id="chart-caption">Select a player to draw their chart.</span>
      </figcaption>
    </figure>
  </div>
</div>
```

**Three tables in a row kills the zigzag.** Three consecutive cream bands at three
offsets read as noise, since alternating offsets is the only rhythm left once colour is
budgeted out. Put all three leaderboards in one band, under one h2, in a responsive grid
that goes side by side above about 64rem and stacks below. One band, one heading, three
tables.

**Figure numbering needs a decision.** Figure numbers align down the page and stay
stable. A chart that swaps on selection has an unstable caption. Give it one fixed
number and let only the caption text change to name the current player.

### A workable band order for the project page

| Band | Colour | Offset | Content |
|---|---|---|---|
| 1 | green | `.at-edge` | the question, as h1 (from `Project.astro`) |
| 2 | cream | `.at-edge` | metadata row: dataset, method, seasons, code (from `Project.astro`) |
| 3 | cream | `.at-step` | opening prose, with the best and worst static SVGs as figures |
| 4 | green | `.at-step` | the finding, one paragraph at body size. This spends the last green |
| 5 | cream | `.at-edge` | **the picker and the per-player chart**, control row at the inset, figure at the gutter |
| 6 | cream | `.at-deep` | method and its problems, including the shrinkage decision |
| 7 | cream | `.at-edge` | three leaderboards in one grid |
| footer | green | `.at-step` | site footer |

The picker sits at band 5, directly after the finding. It comes before the method
section on purpose: a reader who stops halfway down still meets the interactive part.

---

## 10. One project page or a section

**Settled: one project, one entry in the collection, one page.** Narayan approved this
on 24 August 2026, revising an earlier recommendation that split the picker onto its
own route.

```
/projects/shot-selection/   question, write-up, the finding, the picker, three tables
```

There is no `/explore/` route and no fifth nav link.

### Why one page

The earlier split put the picker at `/projects/shot-selection/explore/` to keep the
write-up page light. That saving turned out to be small. The season files load only when
a reader picks a player, whichever page the picker sits on, and the index file can wait
until someone touches the search box. So splitting bought a few kilobytes of script and
cost a click on the most interesting thing the site has.

Depth in the URL does not bury anything. Placement does. The picker sits directly after
the finding band, high enough that a reader who stops halfway still meets it.

### Why not a section of its own

The projects index reads the `projects` collection. A section outside the collection is
invisible from `/projects`, and it loses the schema, the `question` and `dataset` and
`method` and `seasons` fields, the draft mechanism, and the metadata band. You would
rebuild all of it by hand for one project.

### Why the tables stay with the narrative

The three leaderboards are the "here are the extremes" evidence for the argument the
write-up makes. Moving them elsewhere separates a claim from the table supporting it.

### What this still needs

The write-up supplies its own bands, which means `Project.astro` stops wrapping
`<slot />` in a single prose band. That change is still open. Section 9 covers the gap
and section 12 records the options.

---

## 11. What to emit from the analysis repo

This is the concrete ask. Produce these and the site side needs no further questions.

### Files

```
public/data/shot-selection/
  meta.json          definitions, league baselines, shrinkage parameters
  index.json         1,507 player-seasons, search fields only
  2019-20.json       per-player zone payloads
  2020-21.json
  2021-22.json
  2022-23.json
  2023-24.json

src/data/
  shot-zones.json    14 zone ids, names, SVG path d strings, label anchors

public/plots/
  shot-selection-best-<season>.svg     pre-rendered narrative charts
  shot-selection-worst-<season>.svg
```

### `meta.json`

```json
{
  "schema_version": 1,
  "generated": "2026-08-24",
  "seasons": ["2019-20", "2020-21", "2021-22", "2022-23", "2023-24"],
  "coordinate_system": { "viewBox": "-250 -47.5 500 470", "units": "tenths of a foot, hoop at origin" },
  "metric": { "id": "efg", "name": "Effective field goal percentage", "digits": 3 },
  "shrinkage": { "method": "empirical Bayes", "k": 40 },
  "league": {
    "2023-24": { "z01": { "rate": 0.612, "n": 120344 } }
  }
}
```

### `index.json`

Compact arrays rather than objects. Field order documented in `meta.json` or here.
Order: `[id, name, team, season]`.

```json
[["201939", "Stephen Curry", "GSW", "2023-24"]]
```

### Season files

```json
{
  "season": "2023-24",
  "players": {
    "201939": {
      "name": "Stephen Curry",
      "team": "GSW",
      "games": 74,
      "zones": {
        "z01": { "n": 412, "made": 252, "rate": 0.612, "rate_shrunk": 0.601 }
      }
    }
  }
}
```

Ship `n`, `made`, `rate`, and `rate_shrunk` for every zone. The site colours by
`rate_shrunk`, prints `rate` and `n`, and leaves the fill at sand when `n` falls below
the floor.

### `shot-zones.json`

```json
[{ "id": "z01", "name": "Restricted area", "d": "M ...", "label": [0, 40] }]
```

Paths in the same coordinate system `meta.json` declares. The site imports this at build
time and renders the court server-side, so the geometry has one home.

### Also useful

- The exact `k` you used for shrinkage and how you picked it, for the method section.
- The n floor below which a zone should stay unpainted.
- Whether `seasons` in the project frontmatter should read as free text like
  "2019-20 to 2023-24". Narayan has not settled free text against a structured pair yet,
  so send free text and flag it.
- Draft numbers stay behind `draft: true` until Narayan verifies them. Every claim on
  this site comes from him.

---

## 12. Decisions, and where each one landed

Narayan settled six of the seven on 24 August 2026. One stays open.

| # | Decision | Status |
|---|---|---|
| 1 | Framework integration, or vanilla JS | **Vanilla.** Hand-written, no new dependency. Revisit past roughly 250 lines of interactive code, or when a second widget needs shared state |
| 2 | How a write-up supplies its own bands | **Open.** See below |
| 3 | The seven-step zone ramp plus the hatch channel | **Approved.** The hatch is now a hard rule in `CLAUDE.md`, alongside accent-never-on-green and no-two-greens |
| 4 | `netlify.toml` for immutable data headers | **Skip for now.** Revalidation per season per visit is acceptable |
| 5 | A fifth nav link | **No.** Four links stay four. The picker lives on the project page |
| 6 | Promoting the chart-sizing rule into `global.css` | **Approved and done.** `.plot svg` now sizes correctly on any page |
| 7 | Free text or a structured pair for `seasons` | **Free text.** Revisit if the index ever needs to sort or filter by season |

### The one still open: how a write-up supplies its own bands

Markdown cannot emit bands, so a project write-up currently renders as one band at one
offset. Section 9 covers the mechanics. Three routes:

**Route A, MDX.** The write-up wraps each section in a band component naming its offset.
Full control over which section gets which offset and where the single green band falls.
Costs roughly a dozen lines of visible scaffolding per write-up.

**Route B, hand-built page.** Total control, no new format, and the project falls out of
the collection. Loses the schema, the metadata band, the draft mechanism, and the
listing on `/projects`.

**Route C, automatic splitting.** The layout splits plain markdown at each top-level
heading, wraps each section in a band, and cycles the offsets. Zero scaffolding when
writing. Gives up choosing which section gets which offset, and cannot place the green
band without a marker of some kind.

**Hybrid, C plus one marker.** Automatic rotation, with a single marker for the band
that goes green.

Every route needs `Project.astro` to stop wrapping `<slot />` in one prose band.

### Standing rules that need no decision

Every word of prose on the site comes from Narayan. Leave `TODO_` markers rather than
plausible copy. Numbers stay behind `draft: true` until he verifies them.

---

## 13. Verbatim file contents

Four files, complete. Nothing summarised.

### `astro.config.mjs`

```js
// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// Set ahead of registration. The domain is not bought yet, so canonical URLs,
	// the sitemap, RSS, and link previews only resolve once it exists and points here.
	site: 'https://narayanlekhi.com',
	integrations: [
		mdx(),
		// /styleguide is an internal reference page. Keep it out of the sitemap so
		// it stays unindexed and unlinked.
		sitemap({ filter: (page) => !page.includes('/styleguide') }),
	],
	fonts: [
		// Fraunces is self-hosted rather than fetched from the google provider on
		// purpose. Astro puts `variationSettings` on the family, not the element, so
		// config alone cannot vary WONK between an h1 and an h3. Loading the real
		// variable file with a weight range instead lets global.css drive the axes
		// per role with font-variation-settings. Verified to carry all four axes:
		// opsz, wght, SOFT, WONK.
		{
			provider: fontProviders.local(),
			name: 'Fraunces',
			cssVariable: '--font-fraunces',
			fallbacks: ['Georgia', 'serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/fraunces-variable.woff2'],
						weight: '100 900',
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
		// These two have no custom axes, so the google provider is enough. It
		// downloads at build time and serves from our own origin, so there is no
		// runtime request to Google.
		{
			provider: fontProviders.google(),
			name: 'Source Serif 4',
			cssVariable: '--font-serif',
			fallbacks: ['Georgia', 'serif'],
			weights: [400],
			styles: ['normal', 'italic'],
		},
		{
			provider: fontProviders.google(),
			name: 'IBM Plex Mono',
			cssVariable: '--font-mono',
			fallbacks: ['ui-monospace', 'monospace'],
			weights: [400, 500, 600],
			styles: ['normal'],
		},
	],
});
```

Note the absence of `output`, `adapter`, `trailingSlash`, `build`, `prefetch`, and
`vite`. Every one of those sits at its Astro 7 default.

### `package.json`

```json
{
  "name": "portfolio-site",
  "type": "module",
  "version": "0.0.1",
  "engines": {
    "node": ">=22.12.0"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "@astrojs/mdx": "^7.0.5",
    "@astrojs/rss": "^4.0.19",
    "@astrojs/sitemap": "^3.7.3",
    "astro": "^7.1.5",
    "sharp": "^0.35.0"
  }
}
```

**There is no `devDependencies` field.** The key does not exist in the file. No test
runner, no linter, no formatter, no TypeScript package of its own (Astro brings its
own). Resolved versions from `package-lock.json`:

| Package | Declared | Installed |
|---|---|---|
| `astro` | `^7.1.5` | 7.1.5 |
| `@astrojs/mdx` | `^7.0.5` | 7.0.5 |
| `@astrojs/rss` | `^4.0.19` | 4.0.19 |
| `@astrojs/sitemap` | `^3.7.3` | 3.7.3 |
| `sharp` | `^0.35.0` | 0.35.3 |
| `vite` (transitive) | | 8.1.5 |

### `src/content.config.ts`

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

// Projects are finished analyses, not a stream of dated entries. They carry fields
// blog posts have no use for, which is why this is a separate collection: merging
// them would make every field optional and enforce nothing.
const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		// Short name, used for listings, the browser title, and Open Graph. The page's
		// own visible headline is the question, not this.
		title: z.string(),
		description: z.string(),
		// The write-up opens with this, which is why it is a field and not a heading.
		question: z.string(),
		dataset: z.string(),
		method: z.string(),
		seasons: z.string(),
		repo: z.string().url().optional(),
		// Keeps an entry out of the production build while its numbers are still
		// unverified, so a placeholder can never ship as a claim.
		draft: z.boolean().default(false),
	}),
});

export const collections = { blog, projects };
```

`z` comes from `astro/zod`, not from a `zod` dependency. Import it the same way.

### `tsconfig.json`

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

Strict mode. `.astro/types.d.ts` is generated, so a fresh clone has no collection types
until something runs `astro sync`, `astro dev`, or `astro build`.

---

## 14. The full `src/` tree

```
src/
├── assets/
│   └── fonts/
│       ├── fraunces-variable.woff2   Fraunces variable file, all four axes (opsz, wght, SOFT, WONK)
│       └── OFL.txt                   SIL Open Font License for Fraunces
├── components/
│   ├── BaseHead.astro                <head> contents: meta, canonical, OG, favicons, font preloads
│   ├── Footer.astro                  The green band that closes every page
│   ├── FormattedDate.astro           Wraps a Date in <time> with a readable label
│   ├── Header.astro                  Site name, four nav links, GitHub icon, bottom rule
│   └── HeaderLink.astro              One nav link, marks itself active from the URL
├── consts.ts                         SITE_TITLE, SITE_DESCRIPTION, and the isPublished draft filter
├── content.config.ts                 The blog and projects collections and their schemas
├── content/
│   ├── blog/.gitkeep                 Empty. No posts at launch
│   └── projects/.gitkeep             Empty. No projects at launch
├── layouts/
│   ├── BlogPost.astro                Date and title band, then one prose band at .at-step
│   └── Project.astro                 Green question band, metadata band, then one prose band
├── pages/
│   ├── about.astro                   /about. Hand-composed bands, not a layout
│   ├── index.astro                   / . Display headline, green subhead band, projects list when non-empty
│   ├── styleguide.astro              /styleguide. Live colour and type specimen, unlinked, unindexed
│   ├── rss.xml.js                    /rss.xml. Blog only, since projects are not chronological
│   ├── blog/
│   │   ├── index.astro               /blog. Sorted list, or a deliberate empty state
│   │   └── [...slug].astro           /blog/<id>/ from the blog collection
│   └── projects/
│       ├── index.astro               /projects. Question-led rows, or a deliberate empty state
│       └── [...slug].astro           /projects/<id>/ from the projects collection
└── styles/
    └── global.css                    Every token. Bands, offsets, figure gutter, type, tables, marks
```

Twenty-one files. That is the whole site.

### Outside `src/`

```
public/                    Copied into dist/ byte for byte. favicon.ico, favicon.svg, og.png, plots/
docs/status.md             Plain-language handoff snapshot, rewritten each session
CLAUDE.md                  Design system, writing rules, working conventions. Governs
AGENTS.md                  Symlink to CLAUDE.md
.astro/                    Generated. Types, collection schemas, downloaded font files. Gitignored
dist/                      Build output. Gitignored
```

---

## 15. Existing patterns, verbatim

Pattern-match these rather than inventing a house style.

### The simplest component: a typed prop

`src/components/FormattedDate.astro`, complete:

```astro
---
interface Props {
	date: Date;
}

const { date } = Astro.props;
---

<time datetime={date.toISOString()}>
	{
		date.toLocaleDateString('en-us', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		})
	}
</time>
```

Frontmatter runs at build time between the `---` fences. `interface Props` is the
convention for typing, and the file exports nothing.

### A component with scoped styles: `src/components/Footer.astro`, complete

```astro
---
import { SITE_TITLE } from '../consts';

const today = new Date();
---

<!-- The one green band guaranteed on every page. It terminates the page, so the
     colour change is the division and no top rule is needed. -->
<footer class="band band--green">
	<div class="band-inner band-inner--wide at-step">
		<p class="label">&copy; {today.getFullYear()} {SITE_TITLE}</p>
	</div>
</footer>
<style>
	footer {
		margin-top: var(--space-2xl);
		padding-block: var(--space-xl);
	}
	p {
		margin: 0;
	}
</style>
```

Three things to copy. The `<style>` block is scoped to this component, so `p { margin: 0 }`
touches nothing else. Every value comes from a custom property. The comment says why
the element looks the way it does, not what the code does.

### Extending an HTML element's props: `src/components/HeaderLink.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

type Props = HTMLAttributes<'a'>;

const { href, class: className, ...props } = Astro.props;
const pathname = Astro.url.pathname.replace(import.meta.env.BASE_URL, '');
const subpath = pathname.match(/[^\/]+/g);
const isActive = href === pathname || href === '/' + (subpath?.[0] || '');
---

<a href={href} class:list={[className, { active: isActive }]} {...props}>
	<slot />
</a>
```

`HTMLAttributes<'a'>` gives every native anchor attribute. `class:list` merges classes
and toggles conditional ones. `<slot />` takes the children.

### How a layout receives and uses props

`src/layouts/Project.astro`. The props are the collection entry's `data`, typed off the
schema, so adding a field to `content.config.ts` flows through to here:

```astro
---
import type { CollectionEntry } from 'astro:content';
import BaseHead from '../components/BaseHead.astro';
import Footer from '../components/Footer.astro';
import Header from '../components/Header.astro';

type Props = CollectionEntry<'projects'>['data'];

const { title, description, question, dataset, method, seasons, repo, draft } = Astro.props;
---

<!doctype html>
<html lang="en">
	<head>
		<BaseHead title={`${title} — Narayan Lekhi`} description={description} />
		{draft && <meta name="robots" content="noindex, nofollow" />}
	</head>
	<body>
		<Header />
		<main>
			<!-- The question is the h1. The write-up opens with the question rather than
			     with context-setting, so repeating the short title here would be a
			     redundant second headline. -->
			<div class="band band--green question-band">
				<div class="band-inner at-edge">
					<h1>{question}</h1>
				</div>
			</div>

			<div class="band meta-band">
				<div class="band-inner band-inner--wide at-edge">
					<dl class="meta">
						<div>
							<dt class="label">Dataset</dt>
							<dd class="numeric">{dataset}</dd>
						</div>
						<div>
							<dt class="label">Code</dt>
							<dd class="numeric">
								{repo ? <a href={repo}>Repository</a> : 'TODO_REPO_URL'}
							</dd>
						</div>
					</dl>
				</div>
			</div>

			<div class="band prose-band">
				<div class="band-inner at-step">
					<slot />
				</div>
			</div>
		</main>
		<Footer />
	</body>
</html>
<style>
	.question-band h1 {
		margin-bottom: 0;
		color: var(--cream);
	}
	.meta {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-s);
		margin: 0;
	}
	@media (min-width: 30rem) {
		.meta { grid-template-columns: repeat(2, 1fr); gap: var(--space-m); }
	}
	@media (min-width: 48rem) {
		.meta { grid-template-columns: repeat(4, 1fr); }
	}
</style>
```

Abbreviated in the metadata list only. Everything else is the file.

Two conventions worth naming. A missing value renders `TODO_REPO_URL` instead of
disappearing, because a gap you can find beats plausible filler. And the layout owns the
whole document, `<!doctype>` down, rather than nesting inside a parent layout.

### How a page pulls from a content collection

`src/pages/projects/index.astro`, frontmatter and the list:

```astro
---
import { getCollection } from 'astro:content';
import BaseHead from '../../components/BaseHead.astro';
import Footer from '../../components/Footer.astro';
import Header from '../../components/Header.astro';
import { isPublished, SITE_DESCRIPTION, SITE_TITLE } from '../../consts';

const projects = await getCollection('projects', isPublished);
---

<div class="band list-band">
	<div class="band-inner band-inner--wide at-edge">
		{
			projects.length === 0 ? (
				/* Deliberate empty state. No "coming soon" cards, no dummy entries, and no
				   empty list container sitting under a heading. */
				<p class="label">Nothing here yet.</p>
			) : (
				<ul class="rows">
					{projects.map((project) => (
						<li>
							<a href={`/projects/${project.id}/`}>
								<span class="row-question">{project.data.question}</span>
								<span class="row-meta label">
									{project.data.title}
									{project.data.draft && ' · draft'}
								</span>
							</a>
						</li>
					))}
				</ul>
			)
		}
	</div>
</div>
```

`getCollection` takes a filter as its second argument. `isPublished` lives in
`src/consts.ts` so every listing and the route that builds the pages agree:

```ts
export const isPublished = ({ data }: { data: { draft?: boolean } }) =>
	import.meta.env.PROD ? !data.draft : true;
```

### How a dynamic route builds its pages

`src/pages/projects/[...slug].astro`, complete:

```astro
---
import { type CollectionEntry, getCollection, render } from 'astro:content';
import Project from '../../layouts/Project.astro';
import { isPublished } from '../../consts';

export async function getStaticPaths() {
	const projects = await getCollection('projects', isPublished);
	return projects.map((project) => ({
		params: { slug: project.id },
		props: project,
	}));
}
type Props = CollectionEntry<'projects'>;

const project = Astro.props;
const { Content } = await render(project);
---

<Project {...project.data}>
	<Content />
</Project>
```

`render()` returns the compiled body as `Content`. The entry goes through as props, and
the layout gets spread `data`. Copy this shape for any new dynamic route.

### Client-side script

The only one on the site, from `styleguide.astro`:

```astro
<script>
	// Read swatch hexes from the computed tokens so this page can never
	// disagree with global.css.
	const root = getComputedStyle(document.documentElement);
	document.querySelectorAll<HTMLElement>('[data-token]').forEach((el) => {
		const name = el.dataset.token;
		if (name) el.textContent = root.getPropertyValue(name).trim().toUpperCase();
	});
</script>
```

Astro bundles and type-checks this by default. TypeScript works with no setup. Add
`is:inline` to opt out of processing, which you should not need.

---

## 16. Responsive approach

### Every breakpoint in the repo

| Query | px at 16px root | What changes | Where |
|---|---|---|---|
| `max-width: 23.999rem` | up to 383.98 | body font drops to 18px | `global.css` |
| `min-width: 24rem` | 384 | `.band-inner` padding goes 16px to 24px | `global.css` |
| `min-width: 30rem` | 480 | project metadata grid goes 1 column to 2 | `Project.astro` |
| `min-width: 48rem` | 768 | `.band-inner` padding to 40px; **offsets activate**; **figure gutter activates**; header padding to 40px; metadata grid to 4 columns | `global.css`, `Header.astro`, `Project.astro` |
| `max-width: 720px` | up to 720 | header GitHub icon hides | `Header.astro` |

Mobile first. Every rule except the two `max-width` queries adds at a wider viewport.

**48rem is the breakpoint that matters.** Below it there are no offsets, `.at-edge`,
`.at-step`, and `.at-deep` all resolve to zero, and `.figure` cancels nothing because
`--offset` is already `0px`. The zigzag is a wide-screen behaviour. The layout survives
narrow screens by having one inset and one column, which is the whole reason it was
chosen over a sidebar.

The `max-width: 720px` query is the only px value in the repo and it does not line up
with 48rem (768px). Between 720px and 768px the GitHub icon returns while offsets are
still off. Harmless, and worth knowing before you assume 768 is the only line.

### Widths

| Token | Value | Used for |
|---|---|---|
| `.band-inner` | `max-width: 44rem` (704px) | default measure, about 63 characters |
| `.band-inner--wide` | `max-width: 68rem` (1088px) | listings, metadata rows, figures |
| `.prose-band .band-inner` | `max-width: 68rem` | wide wrapper so figures can outgrow the text |
| `.prose-band p, h2, ul` | `max-width: 44rem` | the measure, held on text elements |

Figures escape the 44rem measure because the wrapper is 68rem. That is deliberate: the
chart should be the widest element on the page.

### The court at 375px

Arithmetic, since this decides the design.

At a 375px viewport the `max-width: 23.999rem` query applies (383.98px), so body type is
18px and `.band-inner` padding stays at `--space-s`, 16px per side.

```
viewport                        375px
minus band-inner padding (2x16)  343px   content box
minus .plot padding      (2x24)  295px   the SVG
```

With `viewBox="-250 -47.5 500 470"` the court renders 295 x 277px. Scale factor is
`295 / 500 = 0.59` px per user unit.

**It scales. It does not scroll and it does not rotate.**

- A half court is 500 x 470 units, near square at 1.06:1. It fits a phone with no
  drama. A **full** court would be 1.88:1 landscape and would be unreadable here, which
  is one more reason to emit half-court geometry.
- Rotating disorients. Basketball readers know this shape in one orientation.
- Horizontal scroll is worse. Half the court would sit offscreen, and the zones only
  mean anything relative to each other. Tables in this site scroll inside their own box;
  a chart whose meaning depends on seeing all of it must not.

### What degrades, and what does not

**Zone fills and the hatch survive.** They are area encodings, and area scales.

**Zone labels do not survive.** A 10-unit label renders at 5.9px. To clear 11px you need
a font-size of about 19 user units, and fourteen labels at that size collide inside a
295px court.

So the plan below 48rem:

1. Drop all zone labels from the chart. Keep the fills, the hatch, and the court lines.
2. The zone table beneath the chart carries every number. It already exists for the
   accessibility fallback, so this costs nothing new.
3. Tapping a zone highlights its row in that table and scrolls it into view. That gives
   the reader the value without cramming type into the shape.
4. Above 48rem, bring the haloed labels back.

**Touch targets clear the 44px minimum.** The restricted area is the smallest zone at a
40-unit radius, so 80 units across, which renders at 47px. Everything else is bigger.
Verify this if your zone geometry differs.

**One optional buy-back.** Dropping `.plot` padding to `--space-s` below 24rem returns
16px to the chart, a 5% gain. Take it if the labels are close, skip it otherwise.

### Legend and picker at 375px

The legend is 7 swatches plus 2 texture keys. Wrap it to two rows and set the swatch
labels in `.label` at 12px mono. The picker is an input at full width with results
stacked underneath, which is what `.rows` already does everywhere else on the site.

---

## 17. Gotchas

Things that will surprise you, roughly in order of how much time they cost.

### Layout

**`.figure` is load-bearing and fails silently.** The gutter works because `.figure`
cancels its band's `--offset` with a negative margin and grows by the same amount. Put a
chart in a plain `<div>` and it inherits the band's offset, so it sits 64px or 144px off
the line every other figure holds. Nothing errors. Nobody notices for a week.

**`--offset` must stay declared on `.band-inner` above the offset classes.** Both are
single-class selectors, so they have equal specificity and source order breaks the tie.
A `.band-inner` rule written later in the file resets every offset to zero and flattens
the whole layout. The comment in `global.css` says so; heed it.

**Use `width: 100%`, never `100vw`.** `100vw` ignores the scrollbar and causes
horizontal scroll on every desktop browser that reserves gutter space for one.

**The green budget is two per project page, and `Project.astro` already spent one.** The
footer is green on every page and does not count against the page budget. So a project
page has exactly one green band to give.

**Sand is never a band.** It is a surface inside `.plot` and inside zebra rows. A
full-width sand band is not in the system.

### Colour

**Accent on green measures 1.34:1.** It is invisible. Green blocks take `--cream` or
`--muted` for type, and nothing else. This one is easy to break, because `a { color:
var(--accent) }` is the global rule, and `.band--green a` overrides it. Any new component
placed on green needs the same override.

**Never separate chart series by two greens.** Every mid-green tested landed at 1.7 to
2.8:1 against `--green`. Shape and fill carry the second channel.

### SVG

**`fill` and `stroke` resolve `var()`. `font-family` does not.** Set the face through a
CSS class instead, which is what `styleguide.astro` does with `.axis-labels`.

**`font-size` stays an attribute, not a token.** Inside a scaled `viewBox` it is geometry
in user units, like `r` and `stroke-width`. Setting it in px from a CSS token gives you
type that does not scale with the chart.

**An SVG in an `<img>` tag cannot read page CSS.** No custom properties, no inherited
fonts. Bake hexes in at export time and convert text to paths. Inline SVG has none of
these limits, which is why the per-player chart is inline and the R exports are not.

**`.plot svg { display: block; width: 100%; height: auto }` now lives in `global.css`.**
It used to sit in the scoped `<style>` of `styleguide.astro`, where every new chart page
had to redeclare it. Promoted on 24 August 2026. Without it an SVG takes an intrinsic
size and picks up a few pixels of baseline gap underneath.

### Astro

**Scoped `<style>` does not reach slotted content.** A layout cannot style the markdown
it renders through `<slot />`, which is why the prose rules live in `global.css` as
`.prose-band :is(p, h2, h3, ...)`. Reaching in needs `:global()`, and the house style
prefers a global rule with a comment.

**`.astro/` is generated and gitignored.** Collection types, the collection schema JSON,
and the downloaded Google font files all live there. Change `content.config.ts` and the
types stay stale until `astro sync`, `astro dev`, or `astro build` regenerates them. On a
fresh clone, TypeScript reports missing collection types until something runs. If a
schema edit looks ignored, the cache is the first place to look, and deleting `.astro/`
is safe.

**`z` imports from `astro/zod`.** There is no `zod` dependency to install.

**Every dynamic route needs `getStaticPaths`.** The build is static, so a path that
`getStaticPaths` does not return does not exist.

**Draft filtering has to be applied at every call site.** `isPublished` is shared for
that reason: a listing that forgets it links to a page the build never made.

### Deployment

**`site` points at a domain nobody owns.** Canonical URLs, the sitemap, and RSS all
resolve to a dead host until registration. Never build a data URL from `Astro.site`. Use
root-relative paths, which work on localhost, on the Netlify preview URL, and on the real
domain.

**No `netlify.toml` exists.** Build settings live in the Netlify dashboard, which is not
in this repo. Adding the file is a repo-root change and needs Narayan's approval.

### Content

**Never invent copy, numbers, or results.** Leave a marker like `TODO_ABOUT_COPY` so the
gap is impossible to miss. The site's rule is that an empty state you can find beats
plausible text you have to hunt for.

**Empty states are deliberate.** No "coming soon" cards, no dummy entries, no empty list
container under a heading. Both indexes render one `.label` line and nothing else.

**Prose runs through the writing rules in `CLAUDE.md`.** No em dashes, active voice, no
adverbs, no throat-clearing openers, no "not X, it's Y" contrasts. Project write-ups open
with the question, report negative results as findings, and name the methodological
problems.

### Tables

**`table` is `display: block` so it can scroll inside its own box.** That is what keeps a
wide table from pushing the page sideways, and it is done on the element rather than with
a wrapper because tables also arrive from markdown, where there is nowhere to put a
wrapper without adding a plugin. One consequence to check in the browser: a block-level
table sizes its columns to content rather than stretching to `width: 100%`, so zebra rows
on a narrow table may not span the full band. Look at it before assuming it is fine.

**Numbers need `.n` or `.numeric`.** Proportional digits break column alignment.
`font-variant-numeric: tabular-nums` is opt-in, not inherited.
