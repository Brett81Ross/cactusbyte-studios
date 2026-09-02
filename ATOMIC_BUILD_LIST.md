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

## Fuel the Next Update — portfolio standard

- [x] Approve and document the staged `Fuel the Next Update` standard in `FUEL_THE_NEXT_UPDATE_STANDARD.md`.
- [x] Scope the feature to every current CactusByte app except **First Bearing™**, which remains explicitly excluded from shared inheritance.
- [x] Lock the initial product behavior as optional one-time support with suggested $2 / $5 / $10 choices and no effect on Pro, subscriptions, coupons, credits, owner/tester access, feature flags, or roadmap priority.
- [x] Lock distribution-aware routing: web/Android Direct → centralized CactusByte commerce/Stripe after the correct live account is connected; Play → Play-compliant billing path; iOS → App Store-compliant in-app purchase/tipping path.
- [x] Record that the Stripe connection currently exposed to tooling is GhostLane sandbox only and must not be used for live portfolio support payments.
- [ ] Build and QA the shared Fuel UI/payment contract on exact canonical release sources, app by app, without delaying permanent-signing recovery work.
- [ ] Activate live payment products only after correct provider/account verification, sandbox QA, entitlement-isolation QA, and explicit deployment approval.

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

- [x] **SHELVED 2026-09-01:** remove OrbitGather from the active Phase 7 runtime/device queue without deleting its repository, recovery implementation, signing identity, rollback history, or production Supabase project.
- [x] Hide OrbitGather from customer-facing CactusByte hub/storefront, App Matrix, public registry/manifest, Release Center, Pulse destinations, and public app counts by retaining it only in the internal registry with `lifecycle: "shelved"` and `customerVisible: false`.
- [x] Preserve the already-built OrbitGather recovery authority and app-side recovery code in source as inactive infrastructure for a future resurrection.
- [x] Keep the production OrbitGather Supabase project untouched; no recovery Edge Function activation, staging runtime test, uninstall, APK publication, or signing cutover is authorized while shelved.
- [x] Move the active Phase 7 implementation focus to **Acelynn Pro™**; previously code-ready apps remain pending their own device verification gates.
- [ ] Re-activate OrbitGather only after explicit product-resurrection approval and a fresh audit of its core lead-generation value, data quality, and canonical runtime architecture.

- [ ] Compare the current private GitHub source against the earlier staged private-lead foundation before merging any features
- [ ] Restore or implement the homeowner request flow, contractor lead vault, lead details, and secondary source action only in the canonical OrbitGather source
- [ ] Configure a dedicated Firebase project and server-only lead-contact protection before enabling private leads
- [ ] Complete ZIP-radius, city normalization, multi-source lead quality, duplicate detection, and no-results diagnostics
- [ ] Add Android homeowner-to-contractor claim QA before release
- [ ] Add contact verification, contact-consent wording, and photo access control before homeowner details are released
- [ ] Define lead expiration, dispute, refund, invalid-lead, and source-outage behavior before monetizing private leads
- [ ] Verify each lead source’s allowed-use terms before enabling it in production

- [x] Pin the Android signing-cutover identity design to the existing OrbitGather installation UUID; no Supabase DDL/schema migration or cloud-row re-parenting is required.
- [x] Stage CactusByte account↔installation authority plus the isolated `orbitgather-recovery` Edge Function with short-lived tokens, HMAC bridge attestation, restore leases, same-UUID secret rotation, retry-safe pending-secret handling, and no automatic email-only fallback.
- [x] Pass CactusByte OrbitGather recovery-authority QA and full existing hub preflight/build in Actions run `33563934200` against authority head `1dc0e4a2fffe8934e01faff20a92e1653719bb01`.
- [x] Pass OrbitGather recovery contract QA, Next.js production build, scoped Deno 2 Edge Function type-check, and no-deployment guard in Actions run `33563971968`; generated UI source is pinned at `5702fa7db0b8183743ab029e857e8b1071edd087`.
- [x] Prove deterministic settle in Actions run `33563971968` attempt 2: the generated head reran green and reported `Generated OrbitGather identity recovery UI already settled.` with no additional commit.
- [ ] **DEFERRED WHILE SHELVED:** if OrbitGather is explicitly resurrected, configure the same server-only `ORBITGATHER_RECOVERY_BRIDGE_SECRET` in CactusByte and Supabase only after a fresh approval gate, then protect the legacy installation before uninstall and prove isolated clean-install restore preserves the exact UUID, rotates the secret, and retains saved searches/opportunity metadata.

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
- [x] Build versioned merge-only recovery for the four verified production records: saved project, Matrix settings, inventory, and customer contact; exclude staged photos, cookies, credits, lifetime state, caches, service workers, and the deprecated building-level key.
- [x] Reconcile the isolated recovery source with current production behavior so the old manual story selector and old service-worker registration cannot be resurrected from stale GitHub `main`.
- [x] Pass backup/restore functional QA, source-contract QA, JavaScript syntax checks, and deployment-side-effect guards; deterministic generated source is pinned at `997a35dc82826ce9d1dc5bf7223fa34c12a1e505`.
- [x] Prove deterministic settle in Actions run `33557169191` attempt 2: the generated head reran green and reported `Generated recovery source already settled.` with no additional commit.
- [ ] Complete isolated browser/Android export → restore/merge runtime verification and verify the applicable entitlement re-activation path before uninstall/cutover.
- [ ] Add durable account-backed restoration for purchased scan credits or purchased lifetime access before treating those cookie-bound states as generally clean-install recoverable.

## MachZero™ v1.4.1

- [x] Verify the configured Gemini 3.6 Flash model remains supported and keep the server-only `GEMINI_API_KEY` path intact
- [x] Bound Gemini and Android client waits, preserve photos for retry, and prevent quota/credential failures from triggering a duplicate AI request
- [ ] Make one authenticated scan against the staged API and verify its grounded sources before deployment approval
- [x] Confirm the service-worker removal remains intact and repair the predeploy checker so an intentionally absent `sw.js` passes QA
- [x] Remove the stale client-side v1.4.2 label override so the visible app remains aligned with package and registry v1.4.1
- [x] Make Quick Scan an explicit single-camera-photo path and Advanced Scan an explicit up-to-six-photo path
- [ ] Test Quick Scan with one photo and Advanced Scan on Android
- [ ] Show price evidence and confidence instead of presenting uncertain appraisal data as fact

## Rapid Takeoff™ v0.3.0

- [x] Pin canonical production to Vercel project `blueprint-estimator`, repo `Brett81Ross/blueprint_estimator-`, production release commit `e1122d785b116ba6b571d43a5ba2fd1efa106a40`, and current staged `main` lineage.
- [x] Audit lifetime-Pro authority and prove that historical single-use coupon redemption is not account-bound; the 10-year HttpOnly `rapid_takeoff_pro` cookie cannot by itself survive an Android uninstall.
- [x] Stage the two-phase recovery bridge: **Protect Pro Access** claims the still-valid legacy cookie into a verified CactusByte ID lifetime entitlement before uninstall; **Restore Pro Access** consumes a short-lived account-authorized restore token after clean install and issues a fresh HttpOnly cookie.
- [x] Enforce recovery security: authenticated CactusByte ID issuance, app/purpose-scoped 5-minute random one-time tokens, per-ID throttling, SHA-256 token storage, HMAC legacy-cookie claim attestation, timing-safe comparison, lifetime-only entitlement checks, and claim/restore audit events.
- [x] Pass Rapid Takeoff source-contract QA and Next.js production build in Actions run `33559959159`; attempt 3 checked out exact staged head `8436145666e97436da973ad45e8a86e7e5b74e5d` and reported `Generated Rapid Takeoff Pro recovery UI already settled.`
- [x] Pass CactusByte recovery-authority QA, existing 185 core + 37 owner/billing checks, owner/auth regressions, full Next.js production build, and no-deployment guard in Actions run `33560234902` attempt 2 against exact authority head `362c89a401acc3523b0ce9743771a5c55bbc764e`.
- [x] Document the server-only `RAPID_RECOVERY_BRIDGE_SECRET` requirement in both repos; the exact same long random value must be configured in both projects before an approved deployment, and it must never use a `NEXT_PUBLIC_` name.
- [ ] Before any Rapid Takeoff uninstall, deploy/configure only with explicit approval, then complete a real legacy-device **Protect Pro Access** claim while the old Pro cookie still exists and verify the CactusByte lifetime entitlement was created.
- [ ] On an isolated clean install, sign into the same CactusByte ID, run **Restore Pro Access**, verify a fresh Pro cookie/access state, and complete the normal Rapid Takeoff smoke test before authorizing device cutover.
- [ ] Upgrade the existing Next.js `14.2.4` dependency to a currently patched supported release before the next production deployment; keep that framework/security update separate from the signing-recovery bridge.
- [ ] Audit blueprint upload, analysis, estimate output, print/PDF, and mobile layout
- [ ] Expand trade coverage only after validating the current takeoff path

## Acelynn Pro™ v1.1.2
- [x] Pin canonical Acelynn Pro production to Vercel project `acelynn`, repo `Brett81Ross/Acelynn`, production deployment `dpl_BX4tHTSXgh6XqeCBevbm14EdcJT2`, production commit `302c43d029cf975a98e3db20ca9ec5466a9e0dba`, and current `main` `11e4b59139894a194f1eb0342e6a184dda2296df`; the six commits ahead do not modify `index.html`.
- [x] Verify the durable cutover state is the single `acelynn-snapshots` localStorage record, with production retention capped at 12 snapshots; existing JSON export was legacy-compatible but had no import path.
- [x] Stage `acelynn-pro-backup-v1` restore on isolated branch `android-signing-cutover-data-recovery` with legacy-report compatibility, 5 MB cap, 1000-input safety cap, field allowlisting/sanitization, current-device-first dedupe merge, 12-snapshot retention, automatic pre-import backup, and storage rollback.
- [x] Pass functional/source QA, JavaScript syntax checks, live-shell parity, and no-deployment guard in Actions run `33568622698`; generated recovery source is pinned at `00ea3761cff27771f020c194b454b97daae9c168` and attempt 2 reports `Generated Acelynn Pro recovery source already settled.`
- [ ] Complete an isolated browser/Android legacy export → restore/merge round trip and verify all expected snapshots before authorizing uninstall/cutover.
- [ ] Remove/disable Acelynn Pro’s existing service worker in a separate release-quality batch; do not mix that behavior change into the signing-recovery patch.

- [ ] Audit diagnostic workflow, microphone permissions, error states, and mobile controls
- [ ] Verify current logo, version, footer, share, QR, and settings surfaces

## PocketStomp™ v1.0.0

- [x] Select `pocketstomp-v2-brett81ross` as the keeper after reviewing all three Vercel projects and verifying its advanced V2 production UI
- [x] Reconcile CactusByte’s launch, icon, release record, production domain, and production registry to the same keeper without deploying
- [x] Inspect both accessible GitHub candidates (`Brett81Ross/pocketstomp` and `Brett81Ross/pocketstomp-`) and confirm neither committed `main` matches the advanced V2 production source
- [x] Record the production/source evidence in `android-packager/POCKETSTOMP_SOURCE_RECONCILIATION.md`, including exact production localStorage keys and the 100-session retention behavior
- [x] Recover an editable advanced V2 source on isolated branch `production-v2-source-recovery`, preserve provenance limits, and pin the generated recovery source at `1d15d8d2a19a5a641e5239270892ab82458a3a10` without deployment or merge.
- [x] Add versioned archive export/import for `pocketstomp.profile.v2`, `pocketstomp.sessions.v2`, and `pocketstomp.settings.v2` with validation, pre-import backup, dedupe, current-device-first merge, 100-session retention, sanitization, safety limits, rollback, and functional round-trip QA.
- [x] Pass the combined source-contract, live-production parity, backup/restore functional, pinned dependency, and Next.js 16.2.12 production-build gate; then prove deterministic settle in run `33549162028` attempt 2 with branch head unchanged at `1d15d8d…`.
- [ ] Resolve/pin the exact production static image binaries `pocketstomp-icon.png` and `pocketstomp-boar.jpg` or deliberately document an approved replacement before calling the reconstructed source canonical.
- [ ] Complete isolated interactive browser/Android export → restore runtime verification before authorizing uninstall/cutover.
- [ ] Preserve `pocketstomp` and `pocketstomp-z6yl` as rollback candidates until the approved release is confirmed
- [ ] Audit session flow, camera/sensor permissions, coaching output, and Android layout

## GhostLane™ v1.7.4
- [x] Pin GhostLane signing-cutover storage truth on canonical repo `Brett81Ross/ghostlane-app`: `ghostlane_ledger` is durable private intercept history capped at 50 records; `ghostlane_nodes` is a regeneratable camera-mesh cache and is excluded from migration.
- [x] Preserve the intentional Supabase pause/two-project constraint. The signing-cutover recovery path has no Supabase dependency and does not unpause, mutate schema, or deploy functions.
- [x] Stage opt-in encrypted ledger recovery on isolated branch `android-signing-cutover-data-recovery`: AES-256-GCM payload encryption, PBKDF2-SHA256 with 210,000 iterations, random salt/IV, minimum 10-character user passphrase, 5 MB/500-input safety limits, strict field reconstruction, current-device-first dedupe, 50-record retention, encrypted pre-import backup, and rollback.
- [x] Keep passphrases client-only and ephemeral; never store or transmit them, never emit plaintext ledger backups, and allow the user to intentionally start fresh by skipping restore.
- [x] Pass encrypted round-trip/wrong-passphrase/rollback/source/privacy/syntax/no-deployment QA in Actions run `33569797954`; generated recovery mount is pinned at `1ad46ad6df12e5843e8f76581a8ac472b7d2553f`.
- [x] Prove deterministic settle in run `33569797954` attempt 2: generated head reran green and reported `Generated GhostLane recovery source already settled.` with no additional commit.
- [ ] Complete isolated browser/Android encrypted export → restore/merge verification using representative ledger records, confirm the camera-node cache rebuilds independently, or explicitly choose a start-fresh cutover before uninstall authorization.

- [x] Record Supabase as intentionally paused to preserve the two available active project slots for TerraFlow and OrbitGather; do not treat this as an outage or attempt automatic restoration
- [ ] Audit current navigation/radar data handling and privacy claims against actual behavior
- [ ] Verify Stripe access gate without exposing user location or identity unnecessarily
- [ ] Remove or qualify any claim that cannot be proven by the available route and camera data

## First Bearing™ v2.6.1

- [x] Load and patch the private source on isolated branch `android-signing-cutover-data-recovery` without production deployment
- [x] Add validated merge-only JSON restore/import, automatic pre-import backup, duplicate-safe arrays, non-destructive object merge, sanitization, safety limits, and transactional rollback
- [x] Preserve legacy v2.6.0 backup compatibility, including legitimate null optional fields
- [x] Pass source-contract and functional recovery QA in Actions run `33536545004`, including simulated mid-import localStorage failure and rollback
- [ ] Complete representative interactive browser/Android export → restore round trip on the exact release source before authorizing uninstall/cutover

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
- [x] Re-audit canonical production/source truth for signing cutover: Vercel project `acelynn-scoutrace` production deployment `dpl_BYVPu6i8Xrbcts697rRCc1Mfpp7Q` is from commit `9dc845690b865d5694a26166a908450b865e41c2`; current `main` is `c4f5eac6190cb9c2d6908d73b50db3483a683d6c`, five commits ahead only in demo/native-installer/Vercel metadata.
- [x] Verify durable browser state keys `st-h-v2` (scan history, newest-first, max 75) and `st-s-v2` (recreatable settings). The existing Share Summary is human-readable only and is not a restorable backup.
- [x] Stage `scouttrace-backup-v1` on isolated branch `android-signing-cutover-data-recovery` with 5 MB/1000-input safety limits, strict history/settings allowlisting, current-device-first history dedupe, 75-record retention, automatic pre-import backup, clean-install-only settings fill, and transactional rollback.
- [x] Pass recovery functional/source QA, JavaScript syntax checks, and no-deployment guard in Actions run `33569169237`; generated recovery source is pinned at `afad881ab2f78903a55b787c3d738bcee8ef8ae3`.
- [x] Prove deterministic settle in run `33569169237` attempt 2: generated head reran green and reported `Generated ScoutTrace recovery source already settled.` with no additional commit.
- [ ] Reconcile release/version truth before deployment: a read-only production-domain fetch currently renders v1.2.0, while the repository demo shell rewrites raw v1.2.0 source to v1.2.1 and the CactusByte registry lists v1.2.1. Do not silently bump or downgrade during recovery.
- [ ] Complete isolated browser/Android export → restore/merge round trip and verify representative scan-history records before authorizing uninstall/cutover.
- [ ] Reconcile service-worker truth separately before release; the exact recovery source still contains `navigator.serviceWorker.register('sw.js')`, so do not claim worker removal until the canonical release source actually proves it.

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

## Android permanent-signing cutover phases

- [x] Phase 1 — web-layer native-readiness fixes completed without changing production signing identity.
- [x] Phase 2 — 13 permanent Android signing identities staged and verified.
- [x] Phase 3 — compile/target SDK 36 migration completed.
- [x] Phase 4 — brand × distribution split completed: 13 brands × Direct/Play = 26 variants; Direct/Play share the same permanent key per brand; UA remains `CactusByteNative/1.0`.
- [x] Phase 5 — clean-install CactusByte recovery QA passed in Actions run `33532382244`; viewport QA passed in run `33532382258`.
- [x] Phase 6 — app-by-app data/access audit completed and locked in `android-packager/SIGNING_CUTOVER_DATA_AUDIT.md`.
- [x] Permanent-signing gate passed in Actions run `33531865795`: all 26 APKs built, correct Direct/Play permission split, all signatures matched, and every compiled release was non-debuggable.
- [x] Keep the one-brand cutover procedure in `android-packager/SIGNING_CUTOVER_RUNBOOK.md`.
- [x] Phase 7 — First Bearing recovery code/CI gate: validated merge-only restore/import is implemented and functional QA passed in run `33536545004`.
- [ ] Phase 7 — First Bearing device/runtime gate: complete a representative interactive export/restore round trip on the exact release source before uninstall/cutover.
- [x] Phase 7 — PocketStomp source investigation: production V2 and both accessible GitHub repos were compared; neither committed repo matches production; evidence is locked in `android-packager/POCKETSTOMP_SOURCE_RECONCILIATION.md`.
- [x] Phase 7 — PocketStomp source/recovery code/CI + settle gate: reconstructed advanced V2 source is pinned at `1d15d8d…`, combined QA/build passed, and deterministic settle passed in run `33549162028` attempt 2.
- [ ] Phase 7 — PocketStomp runtime/canonical-source gate: complete isolated export/restore runtime verification and resolve the two production static-image assets before any uninstall/cutover.
- [x] Phase 7 — No Problem Matrix code/CI + settle gate: four-record merge-only recovery, production automatic-access parity, no-service-worker parity, rollback/security QA, syntax QA, and deterministic settle passed; generated branch head is `997a35dc…`, settle run `33557169191` attempt 2.
- [ ] Phase 7 — No Problem Matrix runtime/entitlement gate: complete isolated export/restore runtime verification; tester/VIP can re-activate through fresh CactusByte tokens, but purchased cookie-bound scan credits/lifetime still require durable account-backed restoration before general cutover.
- [x] Phase 7 — Rapid Takeoff code/CI + settle gate: two-phase legacy-cookie claim + CactusByte ID restore bridge is staged; Rapid run `33559959159` attempt 3 and CactusByte authority run `33560234902` attempt 2 are green on the exact staged heads.
- [ ] Phase 7 — Rapid Takeoff runtime/config gate: configure the shared server-only bridge secret only with deployment approval, successfully claim existing legacy Pro before uninstall, then prove same-ID clean-install restore and smoke test. No uninstall is authorized before both runtime halves pass.
- [ ] Phase 7 — OrbitGather: add clean-install installation-identity recovery/transfer for existing cloud records.
- [ ] Phase 7 — Acelynn Pro: add validated snapshot import/restore.
- [ ] Phase 7 — ScoutTrace: add JSON scan-history export/import.
- [ ] Phase 7 — GhostLane: add a privacy-preserving ledger migration choice or explicit start-fresh path.
- [ ] Phase 7 — Fantasy Football Matrix: preserve active-draft state or require a clearly warned no-active-draft cutover.
- [ ] Phase 7 — TerraFlow: prove Upload This Device → clean install → Merge From Cloud with record verification.
- [ ] Phase 7 — MachZero: verify Recovery Key before uninstall whenever durable paid access exists.
- [ ] Phase 7 — ShadowNex Prime: provide safe API-key re-entry/transfer without ordinary plaintext secret export.
- [x] CactusByte hub clean-install recovery architecture is proven in CI; actual device execution still requires explicit approval.
- [ ] Phase 8 — prepare migration banner/instructions targeted at the legacy `CactusByteNative/1.0` population only after every applicable Phase 7 recovery gate passes.
- [ ] Phase 8 — execute cutover one brand at a time only after explicit user approval.

**HARD GATE: NO UNINSTALL / NO CUTOVER for any brand until that brand’s recovery gate in `android-packager/SIGNING_CUTOVER_DATA_AUDIT.md` has passed on the exact source intended for release. No item in this ABL authorizes a Vercel deployment, PR merge, Play publication, APK installation, or phone uninstall by itself.**
