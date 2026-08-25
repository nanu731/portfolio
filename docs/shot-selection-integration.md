# Integrating the NBA shot selection project

Reference for the session that owns the shot selection analysis repo. It describes
the portfolio site well enough to produce output this site can drop in without a
translation step. Nothing here assumes you have seen the site.

Written 24 August 2026 against the site at commit `9e3fd59`.

## Contents

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
12. [Decisions Narayan has to make](#12-decisions-narayan-has-to-make)

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

| Page | First load | On demand |
|---|---|---|
| Narrative write-up | 0 bytes of JSON. Static SVGs only. | none |
| Explore page | `meta.json` 1.4 KB + `index.json` about 70 KB raw, near 20 KB gzipped | one season file, near 90 KB gzipped, on the first player picked from that season |
| Explore, worst case | someone opens all five seasons across a session | 5 x 90 KB gzipped, spread across interactions, none of it on first paint |

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
mid-sentence. Use `history.replaceState` while typing and `pushState` on selection.

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

- A static file beats a dynamic route for the same path, so
  `src/pages/projects/shot-selection/explore.astro` and the collection entry
  `shot-selection.md` coexist. The first serves `/projects/shot-selection/explore/`,
  the second serves `/projects/shot-selection/`.
- The sitemap picks up new pages on its own. Only `/styleguide` is filtered out.
- A new top-level nav item means editing `Header.astro`, which currently holds four
  links. Adding a fifth is a design decision for Narayan, not a side effect of shipping
  a project.

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
| 5 | cream | `.at-deep` | method and its problems, including the shrinkage decision |
| 6 | cream | `.at-edge` | three leaderboards in one grid |
| 7 | cream | `.at-edge` | a link through to the explore page |
| footer | green | `.at-step` | site footer |

---

## 10. One project page or a section

**Recommendation: one project, one entry in the collection, two routes.**

```
/projects/shot-selection/          narrative, the finding, three leaderboards
/projects/shot-selection/explore/  the picker and the per-player chart
```

### Why not one page

The picker needs `index.json`, a season file, and the chart script. The narrative needs
none of that. Splitting on that boundary is also the performance boundary: the write-up
page ships zero JSON and zero chart JS, so the admissions reader who wants the story
never downloads the tool. Keeping them together taxes every reader for a feature most
will not touch.

### Why not a section of its own

The projects index reads the `projects` collection. A section outside the collection is
invisible from `/projects`, and it loses the schema, the `question` and `dataset` and
`method` and `seasons` fields, the draft mechanism, and the metadata band. You would
rebuild all of it by hand for one project.

### Why not three routes

The three leaderboards belong to the narrative. They are the "here are the extremes"
evidence for the argument the write-up makes. Pulling them onto their own page separates
a claim from the table that supports it. The picker is a different mode of use, so it
earns the split. The tables do not.

### What this needs

The write-up becomes `src/content/projects/shot-selection.mdx` and supplies its own
bands through components, which means `Project.astro` stops wrapping `<slot />` in a
single prose band. Both are changes to shared files, so both need Narayan's approval
before anyone writes them. `CLAUDE.md` says to write plain `.md`, and MDX stays
configured for exactly this kind of case, so this is the escape hatch working as
designed rather than a violation of it.

The alternative, if he would rather not touch the layout, is a hand-written
`src/pages/projects/shot-selection.astro` composing bands directly, the way
`about.astro` does. It costs the collection entry and the metadata band, so the project
would not appear on `/projects` without more work. I recommend the MDX route.

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

## 12. Decisions Narayan has to make

Nothing below should ship without him saying yes.

1. **A framework integration, or vanilla JS.** Recommendation: vanilla, with the
   tripwire in section 4.
2. **The MDX write-up plus the `Project.astro` slot change.** Recommendation: do it,
   because the alternative loses the collection entry.
3. **The zone ramp in section 7.** Seven stops anchored on three existing tokens, plus
   the hatch channel. He owns the palette.
4. **`netlify.toml` for immutable data headers.** Optional. Works without it.
5. **A fifth nav link, or reaching the project through `/projects`.**
6. **Promoting `.plot svg { display: block; width: 100%; height: auto }` from
   `styleguide.astro` into `global.css`.** One line, and every chart page needs it.
7. **Free text or a structured pair for `seasons`.** Still open in `CLAUDE.md`.

Every word of prose on the site comes from him. Leave `TODO_` markers rather than
plausible copy.
