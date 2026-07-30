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
