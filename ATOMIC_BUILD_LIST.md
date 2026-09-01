# Cactus🌵Byte Studios™ Atomic Build List

Status: Building — no item in this document authorizes a Vercel deployment by itself.

## Shared release gate for every app

- [ ] Confirm the actual source repository and its one canonical Vercel project
- [ ] Keep production stable while the app-specific batch is built
- [ ] Show the app name, version, `Cactus🌵Byte Studios™`, and `All Rights Reserved` in the footer
- [ ] Provide a Settings surface and native Android sharing with an app-colored QR code using that app’s logo
- [ ] Check Android phone, Z Fold cover screen, Z Fold open screen, and iOS-sized layout
- [ ] Avoid service workers unless an app-specific requirement makes one necessary
- [ ] Run the app’s build/QA and preserve the last known-good deployment as the rollback point
- [ ] Test the real production domain on Android after approval: key action, displayed version, native sharing, and QR scan
- [ ] Record the verified production deployment as the new rollback point before beginning the next app
- [ ] Review the complete app batch, deploy once only with approval, confirm production, then update the roadmap

## Platform and release safety

- [x] CactusByte production project is identified: `cactusbyte-studios`
- [x] Latest CactusByte production commit is verified ready: `c3c0e83`
- [x] Canonical projects are mapped for the portfolio
- [x] Inspect generated domains and ready rollback deployments for duplicate CactusByte, TerraFlow, and PocketStomp projects
- [ ] Never delete a duplicate project until its domain assignment and fallback deployment are recorded
- [ ] Record each successful production deployment here before beginning the next app
- [x] Record the canonical source repository, Vercel project, production domain, and ready rollback deployment for every app in `PRODUCTION_REGISTRY.md`
- [x] Verify TerraFlow Supabase project `mvxiwdbfpdvriymcjqge` is `ACTIVE_HEALTHY`, run a read-only database health check, and add daily read-only anti-pause monitoring
- [ ] Check production environment-variable names and make one real authenticated API smoke test where an app uses server APIs
- [ ] Add a common accessibility pass: readable text, 48px touch targets, contrast, focus state, loading/error state, and reduced-motion support
- [ ] Add a performance pass: fast first usable screen, controlled image sizes, responsive API/AI states, and no unnecessary service workers
- [ ] Define privacy, retention, deletion, rate-limit, spam-prevention, and source-attribution requirements before collecting user data
- [ ] Add app-level error monitoring and an owner-visible health check for failed APIs, data sources, and payments
- [ ] Maintain signed-out, standard-user, owner, and tester/lifetime-pass QA accounts where the app supports those roles
- [ ] Verify central billing: correct price, server-confirmed entitlement, billing management, cancellation behavior, and no duplicate-charge path
- [x] Re-run CactusByte registry/core QA after the Fantasy, ScoutTrace, and PocketStomp reconciliation: 185 core checks and 37 owner/billing checks passed, with owner-authority and auth-persistence regressions passing
- [x] Re-run available portfolio QA after the Fantasy correction: CactusByte 222 checks plus owner/auth regressions passed; ShadowNex Prime 24 checks and static build passed; MachZero 35 predeploy checks and 7 scan regressions passed; ScoutTrace 18 regressions passed; Fantasy 3 API regressions passed; 120 JavaScript files passed syntax validation; all 13 demo videos passed codec, duration, narration, and seekability checks

## Cactus🌵Byte Studios™ v1.5.0+

- [ ] Compare the latest GitHub source with the verified production commit before new hub work
- [ ] Verify the live CactusByte ID restoration flow on Android after the latest auth release
- [ ] Verify Idea Radar, source citations, and the owner-only gate with production configuration
- [ ] Reconcile all registry versions and production links with their canonical Vercel projects
- [ ] Keep ShadowNex Prime™ represented in the launchpad and Release Center
- [ ] Display current deployment/version truth without marking staged releases as live
- [x] Give every app’s shared demo control a direct playable demo-video path and optional live guided screen tour
- [x] Verify all 13 app-specific MP4 files are reachable and pass the media QA checks
- [x] Audit current source integration: CactusByte, No Problem, MachZero, Rapid Takeoff, Acelynn Pro, PocketStomp, GhostLane, Fantasy Football Matrix, ScoutTrace, ShadowNex Prime, and OrbitGather mount the shared demo control
- [x] Confirm all 13 canonical production domains remain reachable with HTTP 200 before demo integration work
- [ ] Mount the shared demo control in the canonical First Bearing source (`data-cactusbyte-demo="first-bearing"`)
- [ ] Mount the shared demo control in the canonical TerraFlow source (`data-cactusbyte-demo="terraflow-matrix"`)
- [ ] Verify the full demo flow on each canonical production domain after the approved one-time app deployment
- [ ] Produce 75–90 second narrated walkthrough videos for complex workflows: OrbitGather, TerraFlow, Rapid Takeoff, ShadowNex Prime, No Problem Matrix, and PocketStomp
- [ ] Keep concise 60-second videos for focused workflows unless an app-specific review shows more detail is needed

## OrbitGather™ v0.5.0

- [ ] Compare the current private GitHub source against the earlier staged private-lead foundation before merging any features
- [ ] Restore or implement the homeowner request flow, contractor lead vault, lead details, and secondary source action only in the canonical OrbitGather source
- [ ] Configure a dedicated Firebase project and server-only lead-contact protection before enabling private leads
- [ ] Complete ZIP-radius, city normalization, multi-source lead quality, duplicate detection, and no-results diagnostics
- [ ] Add Android homeowner-to-contractor claim QA before release
- [ ] Add contact verification, contact-consent wording, and photo access control before homeowner details are released
- [ ] Define lead expiration, dispute, refund, invalid-lead, and source-outage behavior before monetizing private leads
- [ ] Verify each lead source’s allowed-use terms before enabling it in production

## No Problem Pressure Washing Matrix™ v1.0.0

- [x] Deploy the approved access-decision batch once to canonical production deployment `dpl_5YpdwumeHjePxJhkFry5FqJbbdoa` and verify `noproblem-pws.vercel.app` with no runtime errors
- [x] Audit quote-generation reliability and add bounded Gemini/client waits with same-photo retry recovery
- [x] Add the repository app shell as a fallback so an older upstream Vercel deployment cannot take down the complete Matrix UI
- [x] Remove the service worker and unregister stale installations
- [x] Verify fast quote flow stays photo-first and keeps measurements optional
- [x] Remove the one-story/multi-level controls and make photo analysis automatically classify standard, manual-review, or outside-scope access; exclude roof, gutter, two-story, ladder, and elevated-access work from priced services
- [ ] Confirm approved service boundaries, contact capture, export/share, and mobile camera flow
- [x] Align server fallback, device settings, and quote output on the approved $99.99 minimum service call while retaining owner configuration
- [x] Pass 13 quote regressions covering default/configured minimums, repository-shell fallback, timeout recovery, worker removal, and customer estimate limitations
- [x] Add clear quote/inspection limitations where photos cannot establish final measurements, access, safety conditions, or scope

## MachZero™ v1.4.1

- [x] Verify the configured Gemini 3.6 Flash model remains supported and keep the server-only `GEMINI_API_KEY` path intact
- [x] Bound Gemini and Android client waits, preserve photos for retry, and prevent quota/credential failures from triggering a duplicate AI request
- [ ] Make one authenticated scan against the staged API and verify its grounded sources before deployment approval
- [x] Confirm the service-worker removal remains intact and repair the predeploy checker so an intentionally absent `sw.js` passes QA
- [x] Remove the stale client-side v1.4.2 label override so the visible app remains aligned with package and registry v1.4.1
- [x] Make Quick Scan an explicit single-camera-photo path and Advanced Scan an explicit up-to-six-photo path
- [ ] Test Quick Scan with one photo and Advanced Scan on Android
- [ ] Show price evidence and confidence instead of presenting uncertain appraisal data as fact

## Rapid Takeoff™ v0.2.0

- [ ] Audit blueprint upload, analysis, estimate output, print/PDF, and mobile layout
- [ ] Expand trade coverage only after validating the current takeoff path

## Acelynn Pro™ v1.1.2

- [ ] Audit diagnostic workflow, microphone permissions, error states, and mobile controls
- [ ] Verify current logo, version, footer, share, QR, and settings surfaces

## PocketStomp™ v1.0.0

- [x] Select `pocketstomp-v2-brett81ross` as the keeper after reviewing all three Vercel projects and verifying its advanced V2 production UI
- [x] Reconcile CactusByte’s launch, icon, source repository, release record, and production registry to the same keeper without deploying
- [ ] Preserve `pocketstomp` and `pocketstomp-z6yl` as rollback candidates until the approved release is confirmed
- [ ] Audit session flow, camera/sensor permissions, coaching output, and Android layout

## GhostLane™ v1.7.4

- [x] Record Supabase as intentionally paused to preserve the two available active project slots for TerraFlow and OrbitGather; do not treat this as an outage or attempt automatic restoration
- [ ] Audit current navigation/radar data handling and privacy claims against actual behavior
- [ ] Verify Stripe access gate without exposing user location or identity unnecessarily
- [ ] Remove or qualify any claim that cannot be proven by the available route and camera data

## First Bearing™ v2.6.1

- [ ] Load the private source into the app workspace through the connected GitHub path
- [ ] Audit recovery flows, notification behavior, share flow, and Android accessibility

## Fantasy Football Matrix™ v1.5.4 (staged)

- [x] Replace the Vercel-blocked ESPN roster fan-out with current nflverse rosters and real 2025 weekly-stat baselines
- [x] Verify the current nflverse assets and correct the weekly-stat URL to the maintained `stats_player/stats_player_week_2025.csv.gz` release
- [x] Keep ESPN scoreboard status optional so a 403 cannot take down the player engine
- [x] Label rookie/current-roster fallbacks separately from measured weekly production
- [x] Align runtime, API, UI, and footer version constants at v1.5.4
- [x] Remove the service worker and unregister stale Android registrations
- [ ] Generate and commit the reproducible nflverse fallback snapshots when the data download gate is available
- [x] Pass local API regression tests for CSV parsing, measured-stat joins, rookie fallback labeling, and an ESPN-403 degraded state
- [ ] Complete browser, Android-size, share, and QR QA before deployment approval

## Acelynn’s ScoutTrace™ v1.2.1

- [x] Remove the invalid service worker and unregister stale browser installations
- [x] Align the source shell, runtime constant, manifest, demo shell, and footer at v1.2.1
- [x] Pass JavaScript syntax, embedded-shell parsing, version-drift, and worker-reference QA
- [x] Align the Android wrapper with v1.2.1 and replace its broad JavaScript interface with a canonical-origin-only native scan command
- [x] Restrict Android camera permission grants to the canonical ScoutTrace HTTPS origin and send external navigation to the device browser
- [ ] Complete interactive browser and Android-size QA before deployment approval
- [x] Audit feature claims, browser/Android limitations, scan permissions, and safe error handling without claiming browser-level malware detection
- [x] Verify the approved ScoutTrace brand is used consistently across icon, app, native share, and cyan/teal high-correction QR surfaces
- [x] Clearly distinguish browser-visible checks from the optional native Android device-security sweep
- [ ] Validate the Android package-visibility declaration and native build before Play Store distribution

## ShadowNex Prime™ v2.2.0

- [ ] Audit public/open-source data attribution, refresh behavior, and source reliability
- [ ] Verify 3D globe performance and controls on Android phone and Z Fold sizes
- [ ] Show source and refresh timestamps, and qualify intelligence outputs as public/open-source information

## TerraFlow Matrix™ v1.15.0

- [x] Confirm the private canonical source `Brett81Ross/terraflow-matrix` is accessible through the connected GitHub path at main commit `c5e33eb`
- [ ] Materialize a local checkout attached to the canonical repository history; direct HTTPS clone still requires a non-interactive GitHub credential
- [x] Select `terraflow-matrix` as canonical after verifying it owns the public domain and full rollback history; hold `terraflow-matrix-dui4` as the recorded duplicate
- [x] Verify Supabase is `ACTIVE_HEALTHY`, exercise the database with a read-only query, and include it in daily CactusByte Health Watch activity checks
- [ ] Reconcile the intended v1.15.0 release with the v1.7.0 version currently rendered by GitHub `main` and the production domain
- [ ] Remove the `sw.js` registration and service-worker file before the next approved release, then verify stale caches no longer control the Android app
- [ ] Run Android field workflow QA for mowing, lawn care, irrigation, photos, reports, and offline/error behavior
