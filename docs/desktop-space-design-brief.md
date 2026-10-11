# Desktop space design brief

Measured 11 October 2026 on the built refinement branch after the selector-width
correction. This is a proposal, not an implemented layout change. No push or
deployment ran. The user's preference is fewer wrapped lines below Player A and
Player B, with more of the available desktop space used. Which earlier version
they meant remains awaiting clarification; no rollback has been inferred.

## Workflow and evidence

Impeccable layout/shape guided this assessment, supported by Apple Design craft,
grouping and simplicity, and UI-UX-Pro-Max editorial/layout references. The six
public routes were measured at actual 1440 and 1920px desktop widths. Temporary
browser-only comparison variants used the existing content, palette, fonts,
40px gutter and 40px inter-player gap. Application source was not edited.
The layout-only mechanical scan returned zero findings. This does not certify
visual quality. No additional reviewers or plugins were used.

## Assessment

Reading order follows title, shared scenario controls, player selection, courts
and results. The courts should receive the extra horizontal room. Related
selection controls should remain compact, with guidance on one line when it fits.
The duplicate Player A/B heading and label roles warrant restraint if their
vertical rhythm is revised; preserve explicit accessible labels.

The fixed wide wrapper stops growing at 1088px including 80px of padding. Its
usable content stays 1008px at both desktop widths. At 1440px the comparison
leaves 392px to the right of its content; at 1920px it leaves 872px. This is spare
capacity on an operating surface, distinct from the deliberate asymmetry of
reading pages. The left gutter and prose offsets remain the stable anchors.

Text and controls have different density needs. Long-form prose currently has
624px of usable room in ordinary bands, and project prose retains its separate
measure cap. Widening all prose to match charts would trade reading comfort for
occupancy. Empty blog space and the one-project index should not acquire filler.

Paired courts align across evidence states. Some vertical reserve supports that
alignment; other repeated margins and labels can be tightened in a later scoped
pass. Do not collapse the evidence, guidance and court into an undifferentiated
block or force single-line text at enlarged text sizes.

## Measured comparison alternatives at 1440px

| Width cap | Usable content | Viewport occupied | Right-side space | Each court |
| --- | ---: | ---: | ---: | ---: |
| Current, 68rem | 1008px | 70.0% | 392px | 432px |
| Preferred starting point, 80rem | 1200px | 83.3% | 200px | 528px |
| Upper candidate, 84rem | 1264px | 87.8% | 136px | 560px |

These are usable-region widths, not the percentage of pixels covered by ink.
No universal whitespace percentage determines neatness. The proposed range is
a design judgment supported by these screenshots and existing layout anchors.
The 80rem version increases usable width by 19% and court width by 22%; it
reclaims about half the existing right-side space without going edge to edge.
All three temporary variants kept paired court tops aligned and had no overflow.
They did not undergo the production regression matrix.

Matched view, same viewport and scenario:

- [Current 68rem](/Users/narayanlekhi/.codex/visualizations/2026/10/11/01a128f2-60c9-75a1-8a85-ddfed49aa5fa/desktop-space-68rem-1440.png)
- [Preferred 80rem](/Users/narayanlekhi/.codex/visualizations/2026/10/11/01a128f2-60c9-75a1-8a85-ddfed49aa5fa/desktop-space-80rem-1440.png)
- [Upper candidate 84rem](/Users/narayanlekhi/.codex/visualizations/2026/10/11/01a128f2-60c9-75a1-8a85-ddfed49aa5fa/desktop-space-84rem-1440.png)

## Proposed direction for confirmation

- Give the comparison an 80rem desktop cap first. Consider 84rem on larger
  screens only after viewing the first change. Preserve its left gutter and
  player-column gap; allow its native controls to use their existing measure.
- Keep Player A/B guidance on one line where it fits. Retain natural wrapping
  on intermediate widths and enlarged text. Keep both mobile selectors ahead
  of results; desktop composition may be adjusted independently after the
  user's earlier-version reference is clarified.
- Evaluate a wider single-explorer figure separately, with its surrounding
  prose measure unchanged. Its current court is about 678px wide; extra width
  has less urgency than the 432px paired comparison courts.
- Preserve the reading widths on About, blog and project narrative, along with
  their band offsets. Keep home and index rhythm; widen a data surface where
  it improves inspection rather than expanding every row indiscriminately.
- Review vertical comparison spacing after the width decision. Preserve
  evidence-state alignment and contextual explanations. No typography, palette,
  content, data, animation or dependency change is proposed.

Next implementation requires confirmation of this direction. It should proceed
one change at a time, with matched desktop/mobile views, keyboard and enlarged
text checks, a production build and a separate commit. This brief is not an
approval to push or deploy.

Raw measurements and scan remain outside Git at
`/private/tmp/portfolio-desktop-space-measurements.json` and
`/private/tmp/portfolio-desktop-layout-detector.json`.
