# CactusByte SLB17 — source QA and scoped storefront corrections

Date: 2026-10-22. Branch: `work/slb11-approved-showcase-fidelity`; existing Draft PR #42.

## Confirmed source-level defects repaired

1. **Missing Navigation filter:** GhostLane is assigned the `Navigation` storefront category, but no Navigation browse pill existed. Add Navigation only to the existing More categories group, leaving the approved first six pills and featured artwork order untouched.
2. **Incomplete app search index:** Search ignored the actual `StudioApp.description` and short marketing copy. Extend the existing case-insensitive index to include `app.description`, `copy.short` and `app.category`. Queries for real features such as "appraisal", "exterior-service" and "skate coaching" can now reach their registered apps.
3. **Reduced-motion preference bypassed:** Two handlers hard-coded `scrollIntoView({behavior:"smooth"})` regardless of OS reduced-motion settings. Centralize scrolling in `scrollToSection` and use `behavior:"auto"` when `prefers-reduced-motion: reduce` is active.

## QA strengthened

- Expanded `scripts/qa-storefront-contract.mjs` with source checks ensuring every configured app-copy category has a browse filter, Navigation is accessible, registered app descriptions are searchable, and programmatic scroll respects reduced-motion.
- Expanded `scripts/qa-storefront-fidelity.mjs` with three specific invariants.
- Added four responsive Playwright cases for Navigation/GhostLane, description-based search, reduced-motion scrolling, and standard scrolling.
- Evaluated **55/55 source-only fidelity checks** against the actual staged Git blobs and source dependencies, and verified every app-copy category has a corresponding filter. These checks do **not** constitute a Next.js build or real-browser test pass.
- Total prepared `tests/storefront-responsive.spec.ts`: **29 test() definitions** (including viewport parameterization); browser tests are not executed in this GitHub-only session.

## Still pending

The owner-approved 13 cinematic WebP files and provisional OrbitGather logo are not committed to this repository. `npm run qa:cinematic` must not be represented as passed. Full Next.js compilation, Playwright device-emulation execution, and owner-verified real Samsung Galaxy Z Fold screenshot fidelity are still required.

## Release lock

No GitHub Actions, no merge, no Vercel preview or deployment, no version bump, no new imagery, no unrelated app modifications. PR remains draft. Commit message includes `[skip ci]`.
