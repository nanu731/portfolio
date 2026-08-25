# Portfolio site status

Snapshot for a reader new to the site, rewritten each time. Updated 25 August 2026.

## Where things stand

A portfolio for sports analytics work: home, About, blog, projects. Readers split
between college admissions officers and analytics hirers. Current work is with a school
basketball team.

The palette is cream and dark green from the Milwaukee Bucks Cream City jerseys, with
a rust accent. Cream carries the page, dark green the type and solid blocks, and a
deeper sand tone gives charts and tables a surface. Headings are Fraunces, reading
text Source Serif 4, numbers Plex Mono.

Each page is a stack of full-width bands, cream and green alternating, with text at a
different distance from the left edge in each, so the eye zigzags down the page. Charts
never move, so they line up while the writing shifts around them, and they are the
widest thing on any page.

That zigzag works on the pages built by hand: home, About, and both index pages. It
does not yet work on a project write-up, where the whole piece sits in one band at a
single distance from the edge. The writing for those pages comes from a plain text
file, and plain text has no way to say "start a new band here." How an author marks
those breaks is the one open question on the layout. The design notes now say so
rather than describing the zigzag as though it already happened everywhere.

Real writing is in place for the home page, About, the site description, and the
footer. Nothing is published: no projects, no posts.

## The next project

An NBA shot selection study, built in a separate repository across five seasons, is the
next thing to land. It needs three things the site has never carried: a written section
with fixed charts, a search box over roughly fifteen hundred player seasons that draws
a chart in the reader's browser, and three ranked tables.

All three now sit on one page rather than splitting across two. The search box goes
directly after the finding, high enough that a reader who stops halfway still meets it.
It is likely the most interesting thing the site will have, so putting it behind a link
was the wrong call.

A reference document describes the site for whoever builds that project, covering how
large data files should reach the page, the colours the court zones should use, and
where the three parts sit in the banded layout.

## Settled recently, and why

The court zones get a seven-step colour ramp running rust through sand to green, with
league average at the middle. A zone at league average takes the colour of the panel
behind it and disappears, so only departures carry ink. The bad half of the ramp is
hatched. Rust against green is the one pairing red-green colourblind readers cannot
separate, so without the hatch that ramp is unreadable for roughly one man in twelve.
That rule now sits beside the other two colour rules rather than in a document someone
might not read.

The interactive parts stay hand-written rather than built on an extra library. One
search box, one list, and one chart do not justify a permanent dependency. If that
grows, the decision gets revisited rather than fought.

The span of seasons a project covers stays plain text. Structuring it would let the
projects list sort and filter, and with nothing published that buys nothing.

Four links in the navigation stay four. The new project is reached through Projects,
like everything else.

## Waiting on you

- Buying the domain. The name is chosen and the site is configured for it, but nobody
  owns it yet, so links and previews resolve only once it is registered.
- Deciding how a project write-up marks its section breaks. That is what unblocks the
  zigzag on those pages.
- The real numbers and the writing for the shot selection project. Every claim on the
  site comes from you.
- Both empty states read "Nothing here yet." Those are your words, so replace them if
  the voice is wrong.

## Known gaps

- Nothing is published, and finished projects are the reason the site exists.
- On a 320px screen a line runs about 26 characters, short of the 35 that reads
  comfortably. Fixing it would mean type too small to read, so the type wins.
- The browser tab icon is still the template's default. The social sharing image is not.
