import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

// Projects are finished analyses, not a stream of dated entries. They carry fields
// blog posts have no use for, which is why this is a separate collection: merging
// them would make every field optional and enforce nothing.
const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		// Short name, used for listings, the browser title, and Open Graph. The page's
		// own visible headline is the question, not this.
		title: z.string(),
		description: z.string(),
		// The write-up opens with this, which is why it is a field and not a heading.
		question: z.string(),
		dataset: z.string(),
		method: z.string(),
		seasons: z.string(),
		repo: z.string().url().optional(),
		// Long interactive write-ups can opt into the tighter project-page rhythm.
		compact: z.boolean().default(false),
		// A write-up may put its metadata in its own methodology section.
		metadataInBody: z.boolean().default(false),
		// Keeps an entry out of the production build while its numbers are still
		// unverified, so a placeholder can never ship as a claim.
		draft: z.boolean().default(false),
	}),
});

export const collections = { blog, projects };
