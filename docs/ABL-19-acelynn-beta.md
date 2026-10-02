# ABL 19 — Acelynn beta screenshot match

Scope: `/acelynn-beta` only. Reference: Brett’s 16198.jpg, excluding browser controls, screenshot overlays, and Fold taskbar.

- [x] Black background, cyan waveforms, existing approved microphone icon, centered title and beta badge.
- [x] Compact Android App / Share / QR / Join Tester Group controls; responsive two-column actions on phones.
- [x] Three stacked numbered tester steps, prominent opt-in button, amber same-account note.
- [x] Verified Google Group and Google Play opt-in URLs; existing feedback email retained.
- [x] Native sharing with copy/manual fallback; local QR with Acelynn icon and colors.
- [x] Isolated CSS module replaces beta global styles. CactusByte chrome excluded only on beta route.
- [x] Footer names, studio link, All Rights Reserved, explicit beta-page version 1.2.2.
- [x] Existing root-layout guardrails follow GlobalChrome mounting instead of failing after relocation.
- [x] Route-specific browser tests added to the responsive QA command.

No changes to Acelynn Android build, package, Play release, analysis logic, or tester eligibility. No generated artwork. Existing icon reused; CSS displays its microphone region in the hero.

Deployment remains manual (`git.deploymentEnabled:false`). No preview/production deployment authorized. Preserve current production until Brett approves the verified batch.
