// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

/**
 * Drafts are visible in dev so a route can be reviewed, and dropped from the
 * production build so unverified metadata never ships as a claim.
 *
 * Shared rather than repeated at each call site: every list of projects and the
 * route that generates their pages have to agree, or a listing links to a page
 * that was never built.
 */
export const isPublished = ({ data }: { data: { draft?: boolean } }) =>
	import.meta.env.PROD ? !data.draft : true;

export const SITE_TITLE = 'Narayan Lekhi';
export const SITE_DESCRIPTION =
	'Sports analytics projects and writing by Narayan Lekhi, a high school student.';
