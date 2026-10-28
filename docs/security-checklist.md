# Portfolio security checklist

## Analytics follow-up: 28 October 2026

Vercel's dashboard confirms the Hobby plan. Free page-view analytics is deployed
and the dashboard recorded the two browser setup visits. The current allowance
is 50,000 events per month; Hobby cannot purchase event overages. No Pro trial,
paid analytics add-on or custom event tracking was enabled. Collection is limited
to Vercel production; the Netlify/local build omits tracker elements.
[Vercel analytics pricing](https://vercel.com/docs/analytics/limits-and-pricing).

The clean installation and both production build variants passed. The audit
reports zero vulnerabilities after compatible Undici and Zod updates. All ten
live pages passed header and generated script-hash checks; the nine public pages
contain one tracker each and the internal style reference contains none. The
live analytics script returned HTTP 200. Home-page browser inspection found no
application error or CSP violation, and the dashboard counted home and About.
No security directive was weakened, and no API secret was added.

This follow-up verifies the Vercel plan and analytics cost boundary. Other account
controls below, including MFA, membership, environment scopes, alerts and Netlify
billing settings, remain outside this check. The 10 October release evidence
below is historical and does not describe the current page count or output hashes.

## Original security release: 10 October 2026

Checked 10 October 2026. The portfolio publishes static pages and public basketball data. It has no visitor accounts, database, uploads, or paid API calls. The reviewed security changes now serve on both public hosts: dependency patches, matching browser security headers, generated page policies, and the corrected canonical address. Production release and live verification are complete. Account settings still require sign-in, so the security audit remains open.

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
| 6 | Check user permissions | Hosting and GitHub accounts | Verify | The application has no user roles. GitHub API inspection returned only `nanu731`, with the admin role, as a portfolio collaborator. GitHub MFA was not exposed by the API. Hosting membership, deployment-token scopes, and MFA await sign-in. |
| 7 | Sanitize user inputs | Yes, browser search and controls | Good | Search filters a local player catalog. The code renders names and status messages with `textContent`, validates season and player payloads, and restricts player-file paths to numeric JSON filenames. It sends no visitor input to a database or command executor. |
| 8 | Protect against XSS | Yes | Good within checked scope | I found no application `innerHTML`, `set:html`, `eval`, or equivalent unsafe HTML insertion. Astro now hashes page scripts for CSP. Both explorers passed live browser checks on Vercel and Netlify with the page policy and response headers active. The negative inline-script fixture was blocked by the browser client, which does not prove CSP rejection. |
| 9 | SQL injection protection | No SQL database | N/A | The site makes no SQL queries. |
| 10 | Check database rules | No database | N/A | JSON exports are public static files. They have no database access rules. |
| 11 | Add rate limiting | Optional hosting abuse control | Verify if needed | The website exposes static files rather than expensive application endpoints. App-level limiting is unnecessary for the current features. Review the hosts' traffic protections if abuse or bandwidth costs become a concern; I did not inspect dashboard rules. |
| 12 | Set spend cap | Hosting costs | Verify | There are no paid application API calls to cap. Check plan limits, usage alerts, and any available spending controls on both hosting accounts. |
| 13 | Secure file uploads | No visitor uploads | N/A | The website has no upload form or upload endpoint. Maintainer-supplied images still pass through build tools and need patched dependencies. |
| 14 | CSRF protection | No authenticated writes | N/A | The site has no visitor session or state-changing application endpoint. |
| 15 | Check CORS settings | Yes | Good for public content | Vercel returns `Access-Control-Allow-Origin: *` for sampled public pages and JSON, without `Access-Control-Allow-Credentials`. Netlify returns neither header on those samples. Public data requires no credentialed cross-origin access. Revisit if private APIs appear. |
| 16 | Enable HTTPS | Yes | Good | Both live hosts use valid HTTPS, redirect HTTP to HTTPS, and send HSTS. The custom apex redirects to the HTTPS www address. |
| 17 | Add security headers | Yes | Good | Both host configurations now specify CSP framing protection, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`. Astro supplies script/style restrictions in each page. All seven public pages on each host return the intended matching headers. HSTS remains present. The page hashes and host policy coexist without chart-script failures. |
| 18 | Secure cookies | No application cookies | N/A | I found no application cookie code or `Set-Cookie` on sampled responses. Any future session cookies need Secure, HttpOnly, and suitable SameSite settings. |
| 19 | Disable debug mode | Yes | Good within checked scope | Sampled live pages contain no Astro development toolbar or Vite client. Both hosts return 404 for `/.env`, `/.git/config`, and `/@vite/client`. The existing local output contains no source maps or environment files. |
| 20 | Check production settings | Yes | Good release; verify dashboards | The clean release audit reports zero known dependency vulnerabilities. The built pages, sitemap and RSS now use `https://www.nslanalytics.com`. The release and metadata match on both public hosts. Hosting build branch, runtime, preview access and account settings still require dashboard inspection. |

## Repair progress

1. Dependency patches are deployed. The initial npm audit reported nine affected packages: one critical, seven high, and one moderate. The patch operation stayed within the existing version ranges, changed no direct dependency list, and cleared the audit to zero. Astro is now 7.3.8 and Sharp 0.35.5. The production build passes. The [Astro advisory](https://github.com/withastro/astro/security/advisories/GHSA-26w7-cxv4-gfx2) requires processing an untrusted AVIF image; this static site has no visitor upload or server image endpoint in its source.
2. Browser security policies are deployed. Astro generates script/style hashes in each page's CSP meta element, with resources restricted to the current origin. Script attributes remain blocked. Style attributes remain permitted for existing swatches and highlighting. The matching host CSP headers block framing, plugins and form submissions without a second script rule that would conflict with the generated hashes. The other headers deny framing, prevent MIME guessing, limit referrer information, and disable unused device/payment capabilities. See [Astro's CSP configuration](https://docs.astro.build/en/reference/configuration-reference/#securitycsp), [Vercel's header guidance](https://vercel.com/docs/cdn-security/security-headers), and [Netlify's header guidance](https://docs.netlify.com/manage/routing/headers/).
3. The canonical-address correction is deployed. All seven HTML pages, sitemap files and RSS use `https://www.nslanalytics.com`. Live canonical metadata, sitemap and RSS match the verified release on both hosts.
4. Account checks await sign-in. GitHub, Vercel and Netlify displayed login screens in Chrome. The GitHub API returned only `nanu731` as a repository collaborator. GitHub MFA was not exposed by the API. No account settings, collaborators, environment variables, billing configuration or credentials were changed. [Astro documents which environment variables reach browser code](https://docs.astro.build/en/guides/environment-variables/).

## Release verification

The production build passes. Its existing empty-blog warnings remain. Astro also emits warnings about attribute-specific CSP rules and Shiki inline styles; the scoped style-attribute exception preserves those styles without allowing inline JavaScript. Hash checks confirmed that all built HTML pages contain CSP and that each inline script matches a generated hash. The two host header maps match.

Both explorers load in an isolated release build served with the exact matching host response headers. Both passed all eighteen slider/view combinations in 2025-26 and loaded LeBron across all five seasons. Checks covered player search, LeBron and Wembanyama, comparison reset, keyboard selection, range keys, radio keys, contextual help opening and Escape dismissal, and Chris Paul's unavailable estimates. The 2024-25 map remains usable without showing estimates; the 2025-26 ineligible state gives the existing reason and retains the previously recorded Loading placeholder. No application source or public data changed.

Chrome confirmed actual viewports of 1440 × 1000 and 375 × 812. Both pages had no horizontal overflow or application console warnings or errors. Chrome blocked the framed child page served with the configured framing headers. The negative inline-script/event-handler fixture was blocked by the browser client before navigation, so that attempt does not prove CSP enforcement. Static checks verified hash permissions and `script-src-attr 'none'`; normal scripts ran under both policies.

The release worktree starts at remote main `adbae3f` and contains only the five reviewed security commits. The dependency list, application source and public data match remote main. Clean installation, a fresh zero-vulnerability audit, production build, seven page-policy checks, four inline-script hash checks, metadata checks, and scans of 2,503 published files passed. Prototype assets, layout-test content, design tooling, environment files and source maps are absent from the release output. All 85 recorded original untracked files retain their SHA-256 hashes and remain outside the release.

## Account checks after sign in

1. Inspect GitHub two-factor authentication under account security; inspect portfolio repository collaborators. Confirm each collaborator with Narayan before any removal. Check Vercel and Netlify account MFA and team members too. For provider-based sign-in, verify the identity provider's protection and any alternate sign-in methods. Keep recovery codes outside the repository and chat. [GitHub setup guidance](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication), [Vercel MFA guidance](https://vercel.com/docs/two-factor-authentication), [Netlify user settings](https://docs.netlify.com/manage/accounts-and-billing/user-settings/).
2. Inspect project and shared environment-variable names and scopes on both hosts. This website needs no application API secret. Check any `PUBLIC_` variable for accidental secrets, and inspect production, preview and development scopes. Do not reveal values in chat or the audit record.
3. Identify each hosting plan before changing billing controls. Review usage notifications and any automatic credit purchases. On eligible Vercel plans, a spending amount alone does not stop usage; the pause-production action controls that behavior and can make all team projects unavailable. Netlify credit-based Free has a hard limit; paid credit-based plans can offer automatic recharge. Legacy plans need their own review. Narayan must choose any budget amount and accept the availability tradeoff. [Vercel spend management](https://vercel.com/docs/spend-management), [Netlify credit-plan guidance](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/).
4. The production checks below are complete. Finish the inaccessible dashboard checks before marking the security audit complete. Ask before changing access, authentication, billing settings or budget amounts.

## Verified production release

The isolated release includes the five reviewed security commits and a verification-record commit, through `fa02072a545b3f21aabe0ced0464e74f5be160ab`. The push fast-forwarded production main from `adbae3f`; the remote confirmed the new commit. Application source, layout, analytics, public data and the direct dependency list match the preceding main. No design installation, prototype, layout-test content or temporary output entered this release. No force push or history rewrite occurred.

GitHub reports Vercel success for that commit: [Vercel deployment](https://vercel.com/nsl8/portfolio/BYodXseSxFyNkQFk1MxNxyURG7rd). Public requests establish the Netlify deployment: its server returns the new header policy and the same verified release bytes. The Netlify dashboard and deployment identifier remain inaccessible. A sampled Netlify response returned request ID `01M4KVSDJHJA9YWFVG26YAB3NF` on 10 October 2026 at 21:34 UTC. The homepage SHA-256 on both hosts is `84c8d7fe70334940b047b734d9171368fc745b3403213917f0a4ce2c618a9ff9`.

On each host, all seven HTML pages, nine referenced scripts/styles/fonts, fifteen sampled data files, and three sitemap/RSS files match the isolated production build byte-for-byte. All page policies match their generated versions. Canonical URLs, sitemap and RSS name `https://www.nslanalytics.com`. The sample includes the availability catalog, manifest, all five season indexes, all five LeBron payloads, two Wembanyama payloads and Chris Paul's 2024-25 payload. This sample does not cover every published player file.

Both hosts return these exact configured headers on all checked files:

| Header | Verified value |
|---|---|
| Content-Security-Policy | `frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'none'` |
| X-Frame-Options | `DENY` |
| X-Content-Type-Options | `nosniff` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` |

Vercel retains HSTS `max-age=63072000`; Netlify retains `max-age=31536000; includeSubDomains; preload`. HTTP redirects to HTTPS on both hosts. The custom apex redirects through HTTPS to the www address. Both hosts return 404 for `/.env`, `/.git/config` and `/@vite/client`.

Live Chrome checks passed all ninety combinations of five seasons, six slider settings and three views in each explorer on each host. Checks covered LeBron, Wembanyama's capped estimate, keyboard player selection and slider controls, help opening/dismissal, comparison reset, and unavailable estimates. The single-player help action focuses the matching definition and Back retains the slider. Both explorers passed actual desktop 1440 × 1000 and mobile 375 × 812 checks without horizontal overflow. Application console warnings, errors and CSP violations were absent during these live tests. The existing ineligible-season Loading placeholder remains a recorded content limitation; no release regression required rollback.

## Account-control result

| Control | Status | Evidence or exact next action |
|---|---|---|
| GitHub portfolio collaborators | Verified | The authenticated GitHub API returns only `nanu731`, with admin access. |
| GitHub MFA | Unverified | The API does not expose MFA; sign in to the account-security tab and inspect its status. |
| Vercel and Netlify MFA and team access | Unverified | Both account tabs show sign-in screens. Sign in and inspect MFA, alternate sign-in methods and project/team members. |
| Project and shared environment variables | Unverified | Inspect names and production/preview/development scopes on both hosts, including shared variables. Do not disclose values. |
| Hosting plans, usage alerts and spending controls | Unverified | Inspect each plan, alert thresholds, hard limits and any automatic purchases. Narayan must choose any changed budget amount. |
| Hosting build settings and preview access | Unverified | Compare the dashboard settings with the recorded production branch/build/runtime settings and inspect preview protections. |

No account settings, credentials, collaborator permissions or billing controls changed. Sign in yourself to the three account tabs, then identify which are ready for inspection. Keep passwords, verification codes, recovery codes and secret values out of chat. A completed deployment does not complete these account checks or certify the site against every attack.
