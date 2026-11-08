import { createContactHandler } from '../src/lib/contact-delivery.js';

// Vercel's native Web handler keeps Astro's existing static output unchanged.
export default { fetch: createContactHandler() };
