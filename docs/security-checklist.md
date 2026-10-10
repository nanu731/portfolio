# Portfolio security checklist

Checked 10 October 2026. The portfolio publishes static pages and public basketball data. It has no visitor accounts, database, uploads, or paid API calls. The main fixes are browser security headers and dependency patches. Hosting account controls still need verification.

I reviewed the application source, configuration, existing production output, and 69 commits reachable from local Git refs. I scanned 2,506 Git blobs for common provider keys, private keys, and credential assignments without printing potential values. I checked the home page, both NBA pages, the data manifest, HTTPS redirects, and sensitive development paths on both live hosts. This review does not certify the site against every attack or cover hosting dashboards, remote-only Git history, deleted unreachable objects, or arbitrary secret formats.

## Checklist

Good means the checks found the expected protection within the stated scope. Fix means I found a concrete gap. Verify means account settings require inspection. N/A means the site has no feature that needs the control.

| # | Check | Relevant | Status | Finding and next action |
|---|---|---|---|---|
| 1 | Hide API keys | Yes | Good | I found no application API keys or paid API calls in the reviewed code or history. The browser requests public data files. |
| 2 | Check environment variables | Yes | Good locally; verify hosting | The repository ignores `.env` and its variants except an example file. I found no root environment files or custom environment values in application code. Inspect hosting variable names and scopes; keep secrets out of browser-exposed `PUBLIC_` variables. |
| 3 | Check keys in Git | Yes | Good within scan scope | The scan found no matching credential candidates in reachable local history. No environment files or private-key filenames appeared in the history filename check. Remote-only refs and unrecognised secret formats remain outside this result. |
| 4 | Protect admin routes | No website admin routes | N/A | The website has no admin interface. An unlinked or unindexed page, including the styleguide, remains public and must contain no confidential content. |
| 5 | Add authentication | No visitor accounts | N/A | Public portfolio pages need no login. Protect the GitHub and hosting accounts that can publish changes. |
| 6 | Check user permissions | Hosting and GitHub accounts | Verify | The application has no user roles. Review repository collaborators, hosting team membership, deployment-token scopes, and account MFA. I could not inspect those account settings. |
| 7 | Sanitize user inputs | Yes, browser search and controls | Good | Search filters a local player catalog. The code renders names and status messages with `textContent`, validates season and player payloads, and restricts player-file paths to numeric JSON filenames. It sends no visitor input to a database or command executor. |
| 8 | Protect against XSS | Yes | Good code patterns; fix defense layer | I found no application `innerHTML`, `set:html`, `eval`, or equivalent unsafe HTML insertion. The live pages lack an enforced Content Security Policy. Add and test one, including the existing inline module scripts. |
| 9 | SQL injection protection | No SQL database | N/A | The site makes no SQL queries. |
| 10 | Check database rules | No database | N/A | JSON exports are public static files. They have no database access rules. |
| 11 | Add rate limiting | Optional hosting abuse control | Verify if needed | The website exposes static files rather than expensive application endpoints. App-level limiting is unnecessary for the current features. Review the hosts' traffic protections if abuse or bandwidth costs become a concern; I did not inspect dashboard rules. |
| 12 | Set spend cap | Hosting costs | Verify | There are no paid application API calls to cap. Check plan limits, usage alerts, and any available spending controls on both hosting accounts. |
| 13 | Secure file uploads | No visitor uploads | N/A | The website has no upload form or upload endpoint. Maintainer-supplied images still pass through build tools and need patched dependencies. |
| 14 | CSRF protection | No authenticated writes | N/A | The site has no visitor session or state-changing application endpoint. |
| 15 | Check CORS settings | Yes | Good for public content | Vercel returns `Access-Control-Allow-Origin: *` for sampled public pages and JSON, without `Access-Control-Allow-Credentials`. Netlify returns neither header on those samples. Public data requires no credentialed cross-origin access. Revisit if private APIs appear. |
| 16 | Enable HTTPS | Yes | Good | Both live hosts use valid HTTPS, redirect HTTP to HTTPS, and send HSTS. The custom apex redirects to the HTTPS www address. |
| 17 | Add security headers | Yes | Fix | Both hosts lack CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and explicit framing protection on sampled pages. HSTS exists. Add headers for both deployments and retest the charts. |
| 18 | Secure cookies | No application cookies | N/A | I found no application cookie code or `Set-Cookie` on sampled responses. Any future session cookies need Secure, HttpOnly, and suitable SameSite settings. |
| 19 | Disable debug mode | Yes | Good within checked scope | Sampled live pages contain no Astro development toolbar or Vite client. Both hosts return 404 for `/.env`, `/.git/config`, and `/@vite/client`. The existing local output contains no source maps or environment files. |
| 20 | Check production settings | Yes | Fix and verify | The source uses a static production build, but the locked dependencies have known advisories. The canonical site setting still names `narayanlekhi.com` instead of the current custom address. Verify hosting build branch, runtime, preview access, and account settings in the dashboards. The canonical mismatch concerns metadata and discovery rather than a demonstrated exploit. |

## Fixes to review

1. Patch the dependencies and run a fresh production build plus explorer checks. The npm audit reported nine affected packages: one critical, seven high, and one moderate. These are package counts, not nine confirmed attacks against the live portfolio. The lockfile contains Astro 7.1.5, Sharp 0.35.3, devalue 5.8.2, http-cache-semantics 4.2.0, js-yaml 4.3.0, nanoid 3.3.16, smol-toml 1.7.1, source-map-js 1.2.1, and svgo 4.0.2. The [Astro advisory](https://github.com/withastro/astro/security/advisories/GHSA-26w7-cxv4-gfx2) requires an attacker to cause processing of an untrusted AVIF image; this static site has no visitor upload or server image endpoint in its source. That limits live exposure without removing the need to patch build tools.
2. Add browser security headers to both hosts. A Content Security Policy controls which resources the browser can execute or load; [Vercel's guidance](https://vercel.com/docs/cdn-security/security-headers) and [Netlify's guidance](https://docs.netlify.com/manage/security/content-security-policy/) describe host-specific configuration. Use script hashes or another compatible policy for the existing inline modules. Avoid a policy that breaks the explorers or allows arbitrary inline scripts.
3. Inspect hosting variables, account access, preview protections, and billing controls. The live requests prove public response behavior, not private dashboard configuration. [Astro documents which environment variables reach browser code](https://docs.astro.build/en/guides/environment-variables/).
4. Align the canonical domain and hosting documentation with the serving addresses after confirming the preferred public address.

## Verified live behavior

The public requests returned 200 for the sampled pages and manifest on [www.nslanalytics.com](https://www.nslanalytics.com/) with a Vercel server header, and on [nlekhi.netlify.app](https://nlekhi.netlify.app/) with a Netlify server header. Vercel sends HSTS with `max-age=63072000`; Netlify sends `max-age=31536000; includeSubDomains; preload`. The headers listed as missing were absent on the sampled pages at both hosts.

I changed no application code, dependencies, account settings, or deployments during this audit. The findings remain open until a repair and verification confirm them.
