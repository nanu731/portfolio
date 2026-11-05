/** Reviewed static project exports, rendered by Astro with its normal CSP and analytics. */
export interface PreparedProject {
  kind: string;
  slug: string;
  title: string;
  description: string;
  head: string;
  body: string;
  bodyClass: string;
  scriptHashes: `sha256-${string}`[];
  styleHashes: `sha256-${string}`[];
}
const pages = import.meta.glob('../prepared-projects/*.json', { eager: true, import: 'default' });
export function getPreparedProject(slug: string): PreparedProject | undefined {
  return pages[`../prepared-projects/${slug}.json`] as PreparedProject | undefined;
}
