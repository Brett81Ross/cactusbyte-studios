# SLB15 — PR #42 navigation, focus and source QA

Date: 2026-10-21. Existing Draft PR #42 only.

## Confirmed source defects corrected
1. Fold/desktop sidebar Apps anchor pointed to a collapsed empty catalog. Hooked it to the existing `seeAllApps` function.
2. Phone menu All Apps also led to the collapsed catalog. Hooked it to `seeAllApps`.
3. Beta Labs filter lacked `aria-pressed`. Selected state now reflects the real category.
4. Detail/demo dialogs lacked initial focus, Tab containment and return-to-opener on dismissal. Scoped effect adds these behaviors alongside existing Escape handling.
5. Shared modal close target was 40 × 40; now 44 × 44 CSS pixels.
6. Responsive tap-target QA accidentally counted hidden phone cards (0 × 0) as undersized controls; it now measures only rendered controls.

## Evidence and remaining gates
- Extended the existing source QA with six assertions and added four browser test cases.
- Isolated source assertions evaluated against fetched GitHub files; Next.js build/Playwright rendering were not executed. Never confuse source checks with a browser pass.
- The 13 owner-approved WebP binary assets are still absent in GitHub. The original fallback SVGs remain, and the unapproved OrbitGather poster is excluded.
- Owner's Fold screenshots and explicit visual approval are still required.

## Release lock
No GitHub Actions, merge, Vercel preview or production deployment; `vercel.json` remains locked and PR stays draft. No changes to unrelated apps, product links or approved artwork.
