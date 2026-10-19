// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// Use the verified public address for canonical URLs, sitemap and RSS.
	site: 'https://www.nslanalytics.com',
	// MDX-imported component styles can miss inline CSP hashes. Same-origin
	// stylesheet files retain the existing strict style policy.
	build: { inlineStylesheets: 'never' },
	security: {
		// Astro hashes bundled and inline scripts at build time. The hosts add
		// frame-ancestors through response headers, where browsers enforce it.
		csp: {
			directives: [
				"default-src 'self'",
				"base-uri 'self'",
				"object-src 'none'",
				"form-action 'none'",
				"frame-src 'none'",
			],
			scriptDirective: {
				resources: ["'self'", { resource: "'none'", kind: 'attribute' }],
			},
			styleDirective: {
				// Existing chart swatches and syntax highlighting use style attributes.
				// Keep that exception on attributes; style elements retain their hashes.
				resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }],
			},
		},
	},
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
