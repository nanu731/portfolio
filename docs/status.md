# Portfolio site status

Snapshot for a reader new to the site, rewritten each time. Updated 29 August 2026.

This one is written for someone picking the project up cold after a gap. It marks
which parts are settled and which are still moving, because a fair amount of what
looks finished is waiting on decisions being made elsewhere.

## Where this exists

The site is live and anyone can read it. It serves at the netlify.app address, and
that is the real one. Checked by opening it: the home, About, projects and blog pages
all answer normally.

The chosen domain is still not registered. A lookup returns nothing, so there is no
address a person could type. Buying it is the single largest remaining item, and until
it happens the sharing previews and the machine-readable index of the site point at a
host that does not exist, so they are wrong rather than merely missing.

The host rebuilds on every push. That was confirmed by watching a change reach the
live site.

## What is stable

Four things are settled and safe to build on.

The look. Cream and dark green from the Milwaukee Bucks Cream City jerseys, with a
rust accent and a deeper sand tone for chart and table surfaces. Headings in Fraunces,
reading text in Source Serif 4, numbers in a monospace face. Every colour, spacing and
type value comes from one place, and the contrast limits behind them were measured
rather than guessed.

The layout. Each page is a stack of full-width bands, cream and green alternating,
with text at a different distance from the left edge in each so the eye zigzags down.
Charts never move, so they line up down the page while the writing shifts around them.

Project write-ups can now declare their own bands. This was the missing piece for
months: the writing arrives from a document file, and a plain document has no way to
say "start a new band here", so a write-up used to land in one block at one distance
from the edge. It no longer does. An author now chooses where each section sits and
where the single dark green block falls.

Routing and deployment. Adding a project is a matter of writing one document with a
handful of required fields. Its page, its address, and its entry on the projects list
all appear without further work.

## What is not stable

The analytics project supplying the basketball work is mid-rework, and none of it is
settled.

The model that divides the court into regions has already been rebuilt once. It is now
being reconsidered again, in favour of a spatial approach rather than a fixed set of
named regions. The measure itself is also being reframed, so what a number on the
chart means is likely to change.

Everything this document says about the shape of that data is a description of the
current intention. It is not a specification. The shape of the export, the number of
court regions, and the meaning of the score should all be treated as open questions.
Confirm each of them against the analytics project before committing site work that
depends on them. Work built against the present arrangement will need redoing, and
that is expected rather than a failure.

## The shot selection chart

A chart component exists and draws a half court split into fourteen regions, shading
each one by how much it adds to or subtracts from a player's score. It was proven in a
browser: the court is complete in the page before any scripting runs, it holds up on a
phone, and it refuses to build if the court would come out mirrored.

It is built against the region model that the analytics project has since replaced. So
it renders, and it cannot yet show real data. Rewiring it is the first task whenever
the analytics side settles, and how much work that is depends entirely on how far the
new model departs from the old one. If the spatial approach wins, the drawing part is
likely to be rewritten rather than adjusted.

Two colour decisions sit inside it and are worth knowing about, because both are
decisions rather than facts.

The seven-step ramp running rust through sand to green, with the below-average half
hatched, is settled and survives the rework. It is a palette decision, not a data one.
The hatch matters: rust against green is the one pairing red-green colourblind readers
cannot separate, so without it the chart is unreadable for roughly one man in twelve.

The way values are spread across that ramp is provisional. One region near the hoop has
a far wider range than the rest, so a plain even spread left eleven of the fourteen
stuck on the middle colour saying nothing. The current chart stretches the scale to put
the resolution where the values actually are, and prints the real numbers on the legend
so the stretching is visible rather than hidden. That choice was made to fit the present
measure. If the measure is reframed, revisit it, because the reason for it may not
survive.

## Things a newcomer would otherwise rediscover

There is a test page sitting among the project entries. It is scaffolding used to check
that bands and the chart render, not content, and it is marked as a draft so it never
reaches the live site. Its words are deliberate placeholders. Delete it once a real
project page exists.

There is an integration document in the same folder as this one, written for whoever
builds the analytics side. Parts of it are stale. It predates the first data export and
is wrong about the measure, the seasons covered, and how the smoothing is done. Where it
disagrees with the actual files in this project, the files win. It is still worth reading
for the parts about how the site is put together, which have held up.

A safeguard was designed and has not been built. Nothing currently checks that the
region shapes stored in this project describe the same regions as the data file that
colours them. If the analytics side ships new data with different regions while the old
shapes remain, every region would be shaded with the wrong number and nothing would
complain. The chart would look entirely normal and be entirely wrong. Given the rework
now under way, this is the most likely way for this project to start lying, and building
that check should come before any real data goes near the page.

One existing safeguard does work. The court refuses to build if it would render
mirrored, which is worth having because a flipped court passes the analytics checks and
simply comes out upside down. That check protects local work today. It will protect the
live site as soon as a real, non-draft page uses the chart.

## Waiting on you

- Buying the domain.
- Every word of a project write-up. Nothing on this site is written by anyone else, and
  no numbers or findings will be invented. Where writing is missing, the pages carry
  obvious markers rather than plausible filler.
- Confirming the region model and the measure with the analytics side before the chart
  is rewired.
- Both empty states read "Nothing here yet." Those are your words, so replace them if
  the voice has moved on.

## Known gaps

- Nothing is published. Finished projects are the reason the site exists.
- The chart cannot show real data yet.
- The data files and the chart work are not yet part of the project's saved history at
  the time of writing, so they exist only on one machine.
- On a very narrow phone a line runs about 26 characters, short of comfortable. Fixing
  it would mean type too small to read, so the type wins. This is a decision, not an
  oversight.
- The browser tab icon is still the template's default. The sharing image is not.
