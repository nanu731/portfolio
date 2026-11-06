# Test the site away from production

Use the local preview lab for private experiments and Vercel Preview for a
hosted review. Production is the `main` branch at
[www.nslanalytics.com](https://www.nslanalytics.com/).

1. Start each experiment from the latest `main` in a separate `codex/` branch
   and checkout. Leave production and unrelated local research edits in place.
2. Try changes locally first. In the authoring checkout, the
   [Preview Lab](http://127.0.0.1:4358/preview-lab/) saves named site versions and
   compares them at desktop and phone widths. These copies stay on this computer.
3. For a hosted review, push the approved-to-share experiment branch or update
   `codex/staging`. Open its **Preview** deployment in Vercel or the GitHub
   deployment status. Vercel gives each build a unique URL. A branch URL can
   follow the latest build on that branch. The production domain remains on `main`.
4. Use the unique deployment link or commit SHA when requesting feedback so
   reviewers can return to the exact version. Leave unapproved work off `main`.
5. After approval, build and verify the approved commit, then merge or push it to
   `main`. Confirm Vercel reports success and check the production URL directly.

The GitHub repository is public. Keep private research, credentials and anything
not ready to share in local previews. A protected deployment URL does not hide
files pushed to a public branch. Keep production analytics disabled in previews.

See [Vercel deployment environments](https://vercel.com/docs/deployments/environments)
and the [project page blueprint](project-page-blueprint.md).
