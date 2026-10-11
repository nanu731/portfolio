---
name: Narayan Lekhi
colors:
  cream: "#F2E9CE"
  sand: "#D0BE9E"
  green: "#14532D"
  accent: "#9C3D1E"
  muted: "#C9BCA0"
  gold: "#D29B2C"
  relocated: "#007EA7"
  green-mid: "#79A183"
  green-deep: "#477A56"
typography:
  display:
    fontFamily: Fraunces
    fontSize: "clamp(3.2rem, 9vw, 5.625rem)"
    fontWeight: 600
  body:
    fontFamily: Source Serif 4
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: IBM Plex Mono
    fontSize: "0.75rem"
  control-and-subheading:
    fontSize: "1rem"
  guide-step:
    fontSize: "1.15rem"
  mobile-court-title:
    fontSize: "1.35rem"
  mobile-heat-legend:
    fontSize: "0.65rem"
  court-empty-svg-text:
    fontSize: "24px"
spacing:
  space-3xs: "0.25rem"
  space-2xs: "0.5rem"
  space-xs: "0.75rem"
  space-s: "1rem"
  space-m: "1.5rem"
  space-l: "2.5rem"
  space-xl: "4rem"
  space-2xl: "6rem"
  space-3xl: "9rem"
---

# Design System: Narayan Lekhi

## Overview

Narayan's supplied direction is bold and graphic: flat color blocks, a strong
type scale, asymmetric prose and charts as the visual identity. Palette C,
Masonry, comes from the Milwaukee Bucks Cream City jerseys and Milwaukee's
brick and cream masonry. This record extracts the incumbent system; it adds no
new art direction. The source of truth remains the shared CSS tokens.

## Colors

Cream dominates page surfaces. Dark green carries type, rules and structural
bands. Rust marks links and active navigation on cream. Sand belongs to charts
and tables; muted type belongs on green. Cyan marks relocated shots and receiving
volume. Gold remains an older chart token.

Rust text must not appear on green. Reversed bands use cream or muted text.
Diverging charts use seven established rust-to-sand-to-green steps; the complete
below-average arm retains its hatch. The sequential make-chance map uses five
fixed bins across players. Shape cues accompany color; outlined diamonds mark
supported receiving areas.

## Typography

Fraunces carries display and headings; Source Serif 4 carries prose; IBM Plex
Mono carries labels and numerals. No fourth family belongs here. Display and
h1-h2 use WONK 1 with SOFT 80-100; h3 and smaller roles flatten those axes.
Optical sizing follows the rendered role. Data columns require tabular numerals.

The body starts at 1.25rem with a 1.5 scale ratio. Heading clamps protect narrow
screens. Preserve the implemented axis settings. The smaller control, guide-step, mobile
court-title, heat-legend and court-empty SVG sizes above record existing component
exceptions; they add no new type choices.

## Layout

Full-width cream and green bands structure pages. Prose offsets come from the
spacing scale above 48rem; narrow screens use a consistent inset. Figures return
to one fixed gutter and outgrow the prose measure. Ordinary pages have one green
band plus the footer; project pages have two plus the footer.

Keep the current responsive court layouts. Comparison groups both selectors ahead of mobile results. Moved selector controls
use a single-column layout and preserve the existing search measure cap. Desktop comparison
uses an 80rem desktop cap with the 40px gutter and inter-player gap retained.
Introductory prose keeps its previous measure. Shared intrinsic grid rows align
courts across evidence states; desktop child margins yield to the grid gaps,
and selector padding uses the smaller spacing token. Mobile spacing remains unchanged. The
header uses a text-relative container query to wrap enlarged text; normal-size
header geometry remains unchanged.

## Elevation & Depth

Flat surfaces and rules supply structure. Preserve the existing interface
without decorative shadows, glass effects or gradient backgrounds.

## Shapes

Use the incumbent square controls, ruled rows and basketball court geometry.
Retain chart circles, crosses, diamonds and hatches with their current meanings.

## Components

The header presents the name, ordered navigation and GitHub link. Project
indexes use ruled rows. The home row uses the same ruled treatment with title and season on separate lines.
Player search uses a labeled combobox, suggestions and arrow/Enter selection.
Native selects and range controls drive the explorer. Definition buttons open
contextual help. Court SVGs support keyboard inspection. Unavailable analysis
keeps explicit reasons and null estimates.

The saved critique records the historical baseline. The local refinement branch
fixes its eight scoped issues; production retains the released version until a
separate approved release. The footer adjustment remains deferred.

## Do's and Don'ts

- Preserve supplied wording, analytical results, palette and fonts.
- Use spacing tokens and visible keyboard focus.
- Keep chart encodings and uncertainty explanations intact.
- Avoid replacement imagery, motion, React, Tailwind and component libraries.
- Ask before markup restructuring, reading-order changes or moving files.
