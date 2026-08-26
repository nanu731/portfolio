# Portfolio site status

Snapshot for a reader new to the site, rewritten each time. Updated 26 August 2026.

## Where this exists

The site is built and running. Netlify watches the project, rebuilds on every push, and
the first build succeeded. The address is nlekhi.netlify.app, and that is the real one:
the chosen domain is still unregistered, and a lookup for it returns nothing at all, so
it is not an address anyone can type.

One catch, found by trying to open the site rather than by assuming. Every page returns
a refusal and bounces to a Netlify login. The site has visitor access restricted, so
only someone signed in to the Netlify account can see it. The build is genuinely there
and genuinely working; the public cannot reach it. Turning that off is a setting in the
dashboard, and until it changes, sending the address to an admissions officer or an
employer would send them to a login screen.

The work itself is shared. A push on 26 August sent the banded write-ups, the colour
ramp, the shot selection planning, and this document, after three weeks in which the
copy on GitHub had not moved.

So: the code is shared, the build works, the address exists but is closed to visitors,
and the domain is still unregistered. One dashboard setting stands between this and a
site someone could actually read.

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

That last part now works on project write-ups, which it did not a week ago. A write-up
used to arrive as one block at a single distance from the edge, because the writing
comes from a document file and a plain document has no way to say "start a new band
here." A write-up can now place a band wherever it wants, choose how far each one sits
from the edge, and put its one dark green block where the argument needs it. Charts
still hold their own line while the writing moves around them, which is the whole point
of the arrangement and the part that did not previously happen.

Real writing is in place for the home page, About, the site description, and the
footer. Nothing is published: no projects, no posts.

## The next project

An NBA shot selection study, built in a separate repository across five seasons, is the
next thing to land. It needs three things the site has never carried: a written section
with fixed charts, a search box over roughly fifteen hundred player seasons that draws
a chart in the reader's browser, and three ranked tables.

All three sit on one page rather than splitting across two. The search box goes
directly after the finding, high enough that a reader who stops halfway still meets it.
It is likely the most interesting thing the site will have, so putting it behind a link
was the wrong call.

The court itself is not built. What exists is a description of the site thorough enough
for whoever builds that project to hand back work that fits, covering how large data
files should reach the page, the colours the court zones should use, and where the
three parts sit in the layout.

## Settled recently, and why

Project write-ups move to a document format that can carry components. The alternative
was to split the writing automatically at each heading and rotate the offsets, which
needs no extra marking when writing but cannot choose which section gets the dark green
block, and cannot place a chart or a table at a chosen point. A project page has to do
both, so the writing carries a little visible scaffolding in exchange.

The court zones get a seven-step colour ramp running rust through sand to green, with
league average at the middle. A zone at league average takes the colour of the panel
behind it and disappears, so only departures carry ink. The bad half of the ramp is
hatched. Rust against green is the one pairing red-green colourblind readers cannot
separate, so without the hatch that ramp is unreadable for roughly one man in twelve.

The interactive parts stay hand-written rather than built on an extra library. One
search box, one list, and one chart do not justify a permanent dependency. If that
grows, the decision gets revisited rather than fought.

The span of seasons a project covers stays plain text. Structuring it would let the
projects list sort and filter, and with nothing published that buys nothing.

Four links in the navigation stay four. The new project is reached through Projects,
like everything else.

## Waiting on you

- Opening the site to visitors. It builds and runs, but every page currently answers
  with a login screen, so nobody outside the Netlify account can read it.
- Buying the domain. The name is chosen and the site is configured for it, but nobody
  owns it yet, so links and previews resolve only once it is registered.
- The real numbers and the writing for the shot selection project. Every claim on the
  site comes from you.
- Both empty states read "Nothing here yet." Those are your words, so replace them if
  the voice is wrong.

## Known gaps

- Nothing is published, and finished projects are the reason the site exists.
- On a 320px screen a line runs about 26 characters, short of the 35 that reads
  comfortably. Fixing it would mean type too small to read, so the type wins.
- The browser tab icon is still the template's default. The social sharing image is not.
- There is a throwaway test page sitting alongside the real work, used to check the
  bands render. It is deliberately not part of the project and should be deleted once
  the court chart has a home.
