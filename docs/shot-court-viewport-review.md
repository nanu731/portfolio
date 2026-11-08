# Shot-selection court viewport review

7 November 2026. Prepared on the Contact review branch for the owner to inspect before a main merge.

At 1440 × 900, the previous shot court SVG measured 998 pixels tall and its title/legend/detail panel measured 1230 pixels. The court now sizes against viewport height, preserving its aspect ratio. The complete court panel fits one viewport when scrolled to its top. Introductory copy, controls and the rest of the article retain their normal document flow.

The override applies only to the single-player shot-selection project at desktop widths of at least 64rem and heights of at least 45rem. Shot locations and Make-chance map reserve measured space for their title, guidance, legend and keyboard details. Shot movement reserves extra space for its two courts and volume explanation. Phone courts retain their previous geometry; the stacked movement view still requires scrolling on a phone. Enlarged text falls back to the existing responsive layout.

The seven reviewed project exports, their 2,065 assets, data, calculations, wording, fonts, palette, analytics guard and hosting policies remain unchanged. A new page-specific stylesheet is loaded by the preserved-project wrapper. Contact navigation also uses wrapping flex layout at narrow sizes, replacing the inherited three-column grid that overflowed at doubled text.

## Checks

- Production-environment build: 13 pages; existing seven-project, inline-policy-hash and 2,065-asset preservation guard passed. Contact integration passed across 12 public routes.
- All three views fit the complete court panel at 1280 × 720, 1366 × 768, 1440 × 900 and 1920 × 1080. At 1280 × 720 the panels measure 534, 669 and 681 pixels.
- The 375 × 812 phone baseline is unchanged. Native keyboard cell inspection and the Chris Paul 2025–26 unavailable court passed.
- Doubled-root-text checks passed without horizontal document overflow at 320, 768 and 1280 pixels. No application page errors occurred.
- The source detector found no issues in the new court stylesheet. Matched before/after laptop and phone captures remain outside Git.

These focused browser checks use Chromium. Physical-device, native zoom and screen-reader checks did not run. Contact remains a disabled design preview with no email delivery service. Main merge and production publication remain pending owner review.
