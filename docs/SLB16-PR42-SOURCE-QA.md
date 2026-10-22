# CactusByte SLB16 · PR #42 source QA

Date: 2026-10-22. Existing draft PR #42, `work/slb11-approved-showcase-fidelity`.

## Confirmed source defects fixed
- Closing the demo after Details -> Watch Demo could strand keyboard focus on a removed Details control. A persistent React ref now retains the real originating card or hero button until the last modal closes.
- Details and Demo modals lacked background body scroll containment; the previous inline overflow setting is preserved and restored.
- Mobile menu now focuses its first link when opened. Escape closes it and returns keyboard focus to the toggle.
- Mobile search now supports Escape, clears the active query, restores the normal shelves, and refocuses its launcher. Modal Escape takes priority if a dialog is showing.

## QA changes
- Updated the prior source assertion to use the new persistent opener reference rather than the obsolete temporary previousFocus variable.
- Added four Playwright regression tests covering Details -> Demo handoff, modal scroll lock, mobile menu focus, and mobile search Escape.
- Added `scripts/qa-storefront-contract.mjs` to check 14 registry app IDs, five Featured, six More, fallback posters, approved cinematic ID whitelist, OrbitGather exclusion, 10 referenced MP4 demos, verified local brand assets, HTTPS launch links, studio routing, version, and Vercel deployment lock.
- Wired that source-only integrity gate into `npm run qa` and a standalone `npm run qa:storefront-contract` command.
- Integrity checks are source/manifest assertions; new browser tests are **not executed** in this GitHub connector.

## Release blockers
The approved 13 WebPs and approved provisional OrbitGather mark remain absent in the GitHub tree. The separate `qa:cinematic` hash gate, Next build, Playwright runtime, and Samsung Galaxy Z Fold screenshot comparison remain pending. Owner must visually approve before deployment.

## Restrictions
No GitHub Actions, preview, production deployment, merge, unapproved imagery, or unrelated repository changes. Source commit uses `[skip ci]`.
