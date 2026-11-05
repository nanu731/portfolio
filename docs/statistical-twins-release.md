# Statistical Twins and the standard project format

Local production candidate, 5 November 2026. Publication requires the owner's confirmation. No push or deployment has occurred.

## Included in this release

NBA Statistical Twins appears first on Home and Projects. Those pages retain their established layouts. Five main projects use the approved cream opening, italic title emphasis, shared player/help dialogs and closed documentation sections. Compare two shot mixes remains nested under NBA Shot Selection. NBA Draft Success stays local and is absent from published routes, navigation and listings.

The release preserves the reviewed engines and analysis assets. It does not change the existing public datasets, hosting configuration, package dependencies or lockfile. The candidate starts from production branch commit `63520a1` on the isolated local branch `codex/statistical-twins-site-release`.

## Build and editing contract

Astro renders reviewed project exports through `PreparedProject.astro`. The project collection supplies Home and Projects metadata; the new Twins entry supplies its title, question, dataset, method and season. A published entry without a reviewed export stops the build, preventing a fallback to a different project format.

Prepared pages live under `src/prepared-projects`. Their referenced assets are committed under their original public paths, so deployment does not fetch analysis data from a preview server. The existing analysis components remain available for authoring. To change a project's analysis or structure, review a new export and regenerate its payload and manifest. Do not assume that editing an older analysis component changes a prepared page.

The preparation tool reads a named local snapshot into an isolated checkout. It needs the existing local browser tooling only during authoring. The deployed build uses Astro and Node. `npm run build` checks the resulting project pages, meaningful Method disclosures, inline CSP hashes, asset checksums and both Twins listings. No new dependency was added.

Astro registers the exported inline-code hashes through its CSP API. Native Vercel Analytics remains conditional on the production environment, as on the existing site. The local release server substitutes an empty analytics script so review traffic is not recorded. This substitution is outside the deployed files.

## Sources and disclosure corrections

Twins includes the pinned source repository's MIT notice and attribution, its own project license and font notices. The source license was checked at:

[NocturneBear source license, pinned commit](https://raw.githubusercontent.com/NocturneBear/NBA-Data-2010-2024/a5f108b5b1f08074d78b9e8e901926a9ce4c06c5/LICENSE).

GitHub metadata confirmed the Twins analysis repository remains private. The website makes no claim that its full repository is public. The downloadable methodology describes the supplied model without referring readers to unavailable earlier project versions.

The Tennis documentation uses its existing sampled-match limitation in the common research slot. This supplies scope information, not a new validation result. Twins' Method slot now contains its existing nearest-neighbor explanation, moved from Formulas with the anchor and term help preserved. No scientific paragraph or result was invented.

## Verification

- Production-mode build: 11 pages; six prepared project routes and five main listings.
- Guard: all six Method sections contain explanations; all inline hashes and 2,061 built assets match their manifest.
- Browser: 24 route/viewport combinations at 1440px, 375px and 320px with external network blocked. No overflow, missing asset responses or application/console errors.
- Metadata: canonical and social URLs use the primary public host; project pages have no draft robots metadata. Local review responses remain noindex.
- Twins: player selection, source navigation, methodology/license downloads and all 308 ranking audits passed. Draft route returns 404.
- Contrast: 8,249 rendered HTML text regions passed with documentation expanded; SVG text was outside that automated scan.
- Finish review: the empty Method finding was resolved. Targeted desktop/phone checks confirmed one sourced explanation, working term help and no overflow.

The mechanical detector's sole warning matched `stroke-width` as a width animation. This SVG stroke transition changes paint, not CSS layout width; the approved interaction was retained. Screenshots and test logs remain outside Git.

## Review and publication

[Home](http://127.0.0.1:4359/) · [Projects](http://127.0.0.1:4359/projects/) · [Twins](http://127.0.0.1:4359/projects/nba-statistical-twins/)

The release candidate is saved separately from earlier website versions. After the owner confirms this candidate, push and publish from the isolated release branch, then verify the public pages, metadata, assets and hosting security headers. This record currently describes local verification only.
