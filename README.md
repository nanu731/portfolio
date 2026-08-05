# narayanlekhi.com

Source for Narayan Lekhi's personal site: sports analytics projects, and writing
about them. Each project page carries the question it asks, the data behind it, the
method, and a link to the analysis code.

The site will live at [narayanlekhi.com](https://narayanlekhi.com). The domain is not
registered yet, so that link stays dead for now.

## Built with

- [Astro](https://astro.build), static output, markdown content collections
- Plain CSS. No framework, no component library
- Fraunces, Source Serif 4, and IBM Plex Mono, self-hosted
- Charts exported from R and ggplot2 as SVG
- Deployed on Netlify

Analysis code lives in its own repositories, linked from the project it belongs to.

## Running it

```sh
npm install
npm run dev
```

`npm run build` writes the static site to `dist/`.

## Where things are

`CLAUDE.md` holds the design system and the writing rules: the palette and its
contrast constraints, the type scale, and the rules that keep the banded layout
coherent. `docs/status.md` is a plain-language snapshot of where the project stands.

`/styleguide` renders the colour and type system from the live tokens. It is unlinked
and kept out of the sitemap, so it stays a reference rather than a page.

## Licence

Fraunces is used under the SIL Open Font License; see `src/assets/fonts/OFL.txt`.
Site content and writing are © Narayan Lekhi.
