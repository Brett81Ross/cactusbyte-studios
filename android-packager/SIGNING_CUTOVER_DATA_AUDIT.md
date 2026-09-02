# Cactus🌵Byte Studios™ Android Signing-Cutover Data / Access Audit

Status: **Phase 6 complete; Phase 7 recovery tooling in progress — staged only. NO UNINSTALL / NO CUTOVER is authorized by this document.**

This audit exists because the legacy Android APKs and the permanent-signed APKs use different signing certificates. Android cannot update the legacy package in place across that certificate change. The one-time transition requires uninstalling the old package, and uninstalling deletes that package's private WebView/browser state.

This document supplements `SIGNING_CUTOVER_RUNBOOK.md`. The runbook controls the one-brand-at-a-time device procedure; this audit controls whether each brand is actually safe to enter that procedure.

## Classification

- **Category A — recoverable/cloud-backed:** durable state can be restored through login, server authority, recovery key, or verified cloud sync.
- **Category B — local durable state:** uninstall can destroy user-created or identity-bearing data. Export/import, transfer, or a proven cloud copy is required first.
- **Category C — disposable/recreatable:** local state is preference/cache/transient work that can safely be recreated.
- **Hybrid / access blocker:** project data may be disposable or cloud-backed while a local access credential or installation identity still blocks a safe cutover.

## Proven Android safety anchors

- Permanent-signing gate: GitHub Actions run `33531865795` — passed.
  - All 26 brand × distribution APKs built.
  - All 26 signatures matched the 13 permanent brand identities.
  - Direct/Play variants share the same permanent key per brand.
  - Direct variants contain `REQUEST_INSTALL_PACKAGES`; Play variants do not.
  - UA remains `CactusByteNative/1.0`.
  - All 26 compiled release APKs are `debuggable=false`.
- Clean-install CactusByte recovery gate: GitHub Actions run `33532382244` — passed.
  - Email/password session recreation passed.
  - Password-reset recovery passed.
  - Server-side owner verification passed.
  - Fresh trusted-device credential issuance passed.
  - Private owner-device bootstrap/re-trust passed.
  - Production build passed.
- Responsive regression: GitHub Actions run `33532382258` — Chromium + WebKit viewport QA passed.

These CI results prove the Android foundation and hub recovery mechanisms. They do **not** by themselves make every app safe to uninstall.

## 13-app audit

| Brand | Classification | Durable state / access at risk | Required cutover gate |
| --- | --- | --- | --- |
| Cactus🌵Byte Studios™ | A | Local Firebase session and trusted-device token are erased, but owner/account authority is server recoverable. | Know CactusByte ID recovery path; clean-install owner recovery CI remains green on cutover commit. |
| No Problem Pressure Washing Matrix™ | B + access blocker | Saved project, Matrix settings, inventory, and customer contact are browser-local. Staged photos are transient memory. HttpOnly access cookie may contain lifetime access or paid/free scan state. | Recovery code/CI + deterministic settle are complete. Still require isolated runtime round trip and the applicable entitlement restoration proof before uninstall; purchased cookie-bound credits/lifetime require durable account-backed restoration for general cutover. |
| MachZero™ | A/C conditional | Install ID/settings are local; paid plan / unused scan-pack access is transferable through Recovery Key. | If durable paid access exists, create and verify Recovery Key before uninstall; settings may be recreated. |
| Rapid Takeoff™ | C data + account-recovery gate | Blueprint/report work is transient/output-oriented. Legacy lifetime Pro lives in a 10-year HttpOnly cookie, while historical coupon redemption did not bind that grant to a CactusByte ID. | Recovery code/CI + deterministic settle are complete. Before uninstall, current legacy Pro must be claimed into the intended CactusByte ID while the old cookie still exists; then same-ID clean-install restore must be proven after bridge-secret configuration on an approved deployment. |
| Acelynn Pro™ | B | Saved analysis snapshots are local under `acelynn-snapshots` with 12-record retention. | Recovery code/CI, deterministic settle, service-worker retirement, and physical Z Fold recovery-engine QA are complete. Still require production-cutover equivalence: the exact permanent-signed Direct APK must have guaranteed access to the certified recovery implementation and pass a synthetic legacy-signature → uninstall → permanent-signature restore transition before any real uninstall. |
| PocketStomp™ | B — high priority | Production stores calibration profile, session archive, settings, learned corrections locally. Reconstructed source is build/QA settled but still has two unresolved production static-image assets. | Recovery code/CI + deterministic settle are complete. Resolve/pin the production image assets and prove isolated runtime export/restore before uninstall/cutover. |
| GhostLane™ | B — sensitive | Privacy/intercept ledger is local; camera-node cache is recreatable. | Provide privacy-preserving migration choice: opt-in protected export/import or explicit start-fresh acknowledgement. No plaintext secret/cookie dump. |
| First Bearing™ | B — highest consequence | Recovery history, check-ins, sponsor/support contacts, meetings, step work, family plans/boundaries, reminders and related recovery records are local. | Merge-only restore/import and CI are complete. Prove representative interactive export/restore round trip on exact release source before uninstall/cutover. |
| Fantasy Football Matrix™ | B-light | Active draft state/roster/gap state are local; data feed cache is disposable. | Add lightweight active-draft export/import or require no active draft at cutover and clearly warn what resets. |
| Acelynn’s ScoutTrace™ | B | Scan history is local under `st-h-v2` (up to 75 entries); settings under `st-s-v2` are recreatable. | Recovery code/CI + deterministic settle are complete. Still require isolated history round trip plus explicit v1.2.0-live / v1.2.1-source-registry reconciliation before uninstall/cutover. |
| ShadowNex Prime™ | B-sensitive/C | Preferences are recreatable; user-entered API keys are local secrets. | Require keys to be available for manual re-entry or implement an explicit protected secret transfer. Do not include secrets in ordinary plaintext migration JSON. |
| TerraFlow Matrix™ | Hybrid A/B | Core business records are local-first but can be uploaded/merged through owner-scoped Supabase sync. | Sign in → Upload This Device → verify cloud record counts/copy → uninstall → fresh sign-in → Merge From Cloud → verify restored records. Unsynced installs remain Category B. |
| OrbitGather™ | B — critical identity blocker | Cloud records are authenticated by a local installation UUID + secret; the UUID owns saved-search/scan/opportunity foreign-key relationships. | Recovery code/CI + deterministic settle are complete with same-UUID secret rotation and CactusByte binding. Still require approved bridge-secret configuration plus legacy Protect and isolated clean-install Restore runtime proof before uninstall/cutover. |

## Detailed evidence and policy

### Cactus🌵Byte Studios™

The hub stores the Firebase session and trusted-device backup locally, so uninstall erases the current device session. Recovery is nevertheless Category A because clean-install CI proves a fresh email/password session can be created, password reset exists, a verified Firebase owner can be recognized server-side, and a fresh trusted-device credential can be minted. The private `/owner-device` bootstrap is an independent re-trust path.

**Gate status:** recovery architecture and CI complete. Actual phone cutover still requires explicit user approval under the runbook.

### No Problem Pressure Washing Matrix™

Read-only production inspection verified four persistent local records that matter for recovery:

- `no-problem-matrix-last-project`
- `no-problem-matrix-settings-v1`
- `no-problem-matrix-inventory-v1`
- `np_matrix_customer_contact`

The saved project can include customer email/phone, job address, optional GPS location, report data, service/proof selections, discount, and quote notes. Backups are therefore user-sensitive local files and are explicitly labeled to be kept private. Staged photos remain in memory and are not exported. The deprecated `np_matrix_building_level` key from stale GitHub source is not exported or restored.

An isolated recovery branch, `Brett81Ross/noproblem.pws:android-signing-cutover-data-recovery`, now provides schema `no-problem-matrix-backup-v1` with a 5 MB cap, depth/array limits, prototype-key stripping, exact record allowlisting, known inventory-ID allowlisting, merge-only semantics, automatic pre-import backup, and transactional rollback across all four keys. Current-device project/settings values win; backup fills missing contact/inventory values. It never calls `localStorage.clear()` and never exports access cookies, credits, lifetime state, tester tokens, staged photos, caches, service-worker state, or secrets.

The audit also found GitHub `main` lagging current production in two important behaviors. Production already uses the approved automatic access/elevation detection with no one-story/multiple-level selector, and production already unregisters the old service worker instead of registering `/sw.js`. The isolated recovery generator reconciles both live behaviors before applying the backup UI, preventing recovery work from resurrecting those deprecated paths.

Actions run `33557169191` passed the full recovery gate. Attempt 1 generated source commit `997a35dc82826ce9d1dc5bf7223fa34c12a1e505`. Attempt 2 checked out that generated head, passed functional backup/restore QA, source-contract QA, JavaScript syntax checks, and the deployment-side-effect guard, then reported `Generated recovery source already settled.` The branch head remained unchanged, proving deterministic generation.

Access remains a separate gate. `np_matrix_access` is an HttpOnly, server-signed cookie that can carry monthly free usage, paid credits, and lifetime access, and uninstall erases it. CactusByte tester/VIP access is repeatably recoverable without copying the cookie: an authenticated CactusByte ID with an active lifetime tester pass can request a fresh short-lived No Problem token, which the app consumes to issue a fresh lifetime cookie. Purchased scan credits or purchased lifetime access that exist only in the cookie do not yet have a proven account-backed clean-install restoration mechanism.

**Gate status:** code/CI + deterministic settle complete. Still blocked from uninstall/cutover until an isolated browser/Android export → restore/merge runtime round trip passes and the exact device's entitlement re-activation path is verified. General cutover for purchased cookie-bound credits/lifetime remains blocked until durable account-backed purchase restoration exists.

### MachZero™

`machzero.installId` and settings are local. The install ID participates in device-scoped server behavior, but the app already provides Recovery Key creation and Restore Access for paid plan / unused paid scan-pack state on a replacement or reset device.

**Gate status:** architecture exists. Before the actual MachZero uninstall, a user with durable paid access must create/save/test a Recovery Key. Never publish the key in source, issues, screenshots, or migration documentation.

### Rapid Takeoff™

Current takeoff inputs/results are not durable project storage; outputs can be printed/downloaded/shared. The cutover blocker is lifetime access. Rapid Takeoff currently validates the server-signed, 10-year HttpOnly `rapid_takeoff_pro` cookie. Android uninstall removes that WebView cookie. The original single-use coupon cannot safely be reused.

Authority audit found an additional constraint: the historical Rapid coupon record proves only that a hashed coupon was redeemed and that its short-lived app token was consumed; it does **not** record which CactusByte ID owned that legacy Pro grant. Therefore a clean install cannot safely infer ownership from historical coupon data alone.

A two-phase account bridge is now staged. Before uninstall, **Protect Pro Access** sends the user through CactusByte ID authentication, obtains a short-lived one-time `claim` challenge, returns to the same Rapid Takeoff WebView, verifies the existing Pro cookie, and sends a server-only HMAC attestation to CactusByte. CactusByte then atomically consumes the challenge, creates `entitlements/{uid}__rapid-takeoff` as explicit lifetime access with source `legacy_cookie_claim`, and writes an audit event. No cookie or coupon is exported.

After clean install, **Restore Pro Access** authenticates the CactusByte ID, requires an active lifetime Rapid entitlement (or active lifetime tester pass), issues a short-lived one-time `restore` token, and lets Rapid Takeoff consume that server authority before minting a fresh secure HttpOnly lifetime cookie. Recovery tokens are random, purpose/app scoped, five-minute, SHA-256 stored, per-ID throttled, single-use, and audited. Legacy claim attestation uses server-only `RAPID_RECOVERY_BRIDGE_SECRET` with timing-safe comparison.

Rapid Takeoff recovery source is staged on `Brett81Ross/blueprint_estimator-:android-signing-cutover-pro-recovery`. Actions run `33559959159` attempt 3 checked out exact staged head `8436145666e97436da973ad45e8a86e7e5b74e5d`, passed source-contract QA and the Next.js production build, preserved Git deployment-disable policy, and reported `Generated Rapid Takeoff Pro recovery UI already settled.`

The CactusByte authority half is staged on `Brett81Ross/cactusbyte-studios:rapid-takeoff-pro-recovery-authority`. Actions run `33560234902` attempt 2 checked out exact authority head `362c89a401acc3523b0ce9743771a5c55bbc764e` and passed recovery security QA, 185 core checks, 37 owner/billing checks, owner-authority/auth-persistence regressions, full production build, and the no-deployment guard.

The shared bridge secret is documented only as a placeholder in both `.env.example` files. No real secret has been generated or configured in live Vercel environments. The exact same long random server-only value must be configured in both projects as `RAPID_RECOVERY_BRIDGE_SECRET` before any approved runtime test/deployment.

CI also surfaced an existing Rapid Takeoff dependency warning: Next.js `14.2.4` is flagged as vulnerable by npm. That framework upgrade is a separate release-quality blocker and must be remediated before the next production deployment rather than mixed into this recovery patch.

**Gate status:** code/CI + deterministic settle complete. Still blocked from uninstall/cutover until an approved deployment/configuration provides the shared server-only bridge secret, the legacy install successfully completes **Protect Pro Access** while its old Pro cookie still exists, and an isolated clean install proves same-CactusByte-ID **Restore Pro Access** plus the normal app smoke test.

### Acelynn Pro™

Canonical production is Vercel project `acelynn` / repo `Brett81Ross/Acelynn`. The current production deployment is `dpl_BX4tHTSXgh6XqeCBevbm14EdcJT2` from commit `302c43d029cf975a98e3db20ca9ec5466a9e0dba`. GitHub `main` is six commits ahead at `11e4b59139894a194f1eb0342e6a184dda2296df`, but that delta does not modify `index.html`, so the snapshot-storage lineage is unchanged.

The durable state is one localStorage record, `acelynn-snapshots`, retained at a maximum of 12 checks. The live source already exported `{app, created, snapshots}` JSON but provided no import path. The isolated branch `android-signing-cutover-data-recovery` now adds schema `acelynn-pro-backup-v1` while accepting the legacy report format. Restore enforces a 5 MB file limit, at most 1000 input snapshots, strict field normalization, current-device-first dedupe merge, 12-snapshot retention, automatic pre-import backup download, and rollback if the localStorage write fails. `index.html` and `app-base.html` remain byte-identical so the Vercel demo shell uses the same recovery surface.

Actions run `33568622698` passed functional/source QA, JavaScript syntax validation, demo-shell parity, and the no-deployment guard. Attempt 1 generated only `index.html` + `app-base.html` at commit `00ea3761cff27771f020c194b454b97daae9c168`. Attempt 2 checked out that generated head, reported both files already deterministic, passed every gate again, and printed `Generated Acelynn Pro recovery source already settled.`

Service-worker retirement is now part of the certified recovery source at `6363059183cebe650830cc240d275936dc802d34`: stale Acelynn worker registrations and `acelynn-pro-*` caches are retired while localStorage snapshots and unrelated caches are preserved. Physical Android recovery-engine QA then passed on a Samsung Z Fold using the isolated `com.cactusbyte.acelynnpro.qa` package with those exact pinned assets. The test proved live microphone operation, backup survival across QA app-data clearing, clean-state restore, duplicate suppression, chronological post-restore saving, pre-import safety backup creation, and native rejection of a deliberately wrong-app backup. Foundation commit `60b2d82a25c6631aa250a0930d5127964dc34750` passed Acelynn QA run `33624538021` and the 26-APK signing gate `33624537920`.

The normal permanent Acelynn Direct/Play wrappers still load the production web URL rather than the QA-only pinned local recovery entry point. Therefore the physical QA result certifies the recovery engine and Android integration, but it does not by itself prove production-cutover equivalence.

**Gate status:** recovery code/CI + deterministic settle + service-worker retirement + physical Z Fold recovery-engine QA complete. Still blocked from real uninstall/cutover until the exact permanent-signed Direct APK has guaranteed access to the certified recovery implementation and passes a synthetic legacy-signature → export → uninstall → permanent-signature → restore round trip on a non-production Android environment. Explicit user approval remains required after that gate passes.

### PocketStomp™

The verified production app stores profile/calibration data, session history, learned correction/settings state locally under `pocketstomp.profile.v2`, `pocketstomp.sessions.v2`, and `pocketstomp.settings.v2`, with production retaining up to 100 sessions. Neither accessible GitHub `main` matched the advanced production V2 source, so recovery was staged on isolated branch `Brett81Ross/pocketstomp-:production-v2-source-recovery` with explicit provenance limits rather than pretending an older source was canonical.

The reconstructed editable V2 now includes a versioned `pocketstomp-backup-v1` engine with validation, pre-import backup, prototype-key stripping, current-device-first merges, learned-correction merging, session dedupe, 100-session retention, safety limits, transactional rollback, and export → empty-device → restore functional QA. Combined source-contract QA, production-parity QA, backup/restore functional QA, pinned Next.js 16.2.12 dependency installation, and production build all pass.

Generated recovery source is pinned at `1d15d8d2a19a5a641e5239270892ab82458a3a10`. Settle run `33549162028` attempt 2 reran the generator/QA against that generated head successfully and left the branch head unchanged, closing the deterministic settle checkpoint.

Two production static image binaries, `/pocketstomp-icon.png` and `/pocketstomp-boar.jpg`, are still referenced by the verified production contract but have not been pinned into the recovered editable source. They remain a source-canonicalization blocker rather than grounds to invent replacement art.

**Gate status:** code/CI + deterministic settle complete, but not cutover-ready. Resolve or deliberately approve replacements for the two production static assets and complete an isolated interactive browser/Android export → restore runtime round trip before uninstall/cutover.

### GhostLane™

Canonical source is `Brett81Ross/ghostlane-app`. Current GitHub `main` is `6c60ffaf43a981c30d4a2e1e793353877996b92c`; the latest verified Vercel production deployment is `dpl_5BZVwAY5cYQPaxqGGSbCyRygABpE` from production commit `0616baac5fd5e6972b6e759334a126717a5554c7`. The production→main delta does not change `app.js`, so the local-storage lineage is stable. The Android wrapper surface `/radar.html` embeds same-origin `/index.html?v=1.7.4`, so the staged recovery UI mounted in `index.html` is reachable from the wrapper.

The durable privacy state is `ghostlane_ledger`, capped at 50 intercept records containing time, hardware, and four-decimal coordinates. `ghostlane_nodes` is a regeneratable camera-mesh cache and is intentionally excluded. Supabase remains intentionally paused because of the two-project constraint; this recovery path neither depends on nor changes Supabase.

Isolated branch `android-signing-cutover-data-recovery` adds opt-in encrypted migration only. Envelope schema `ghostlane-encrypted-backup-v1` encrypts payload schema `ghostlane-ledger-v1` using AES-256-GCM with a random 12-byte IV and PBKDF2-SHA256 (210,000 iterations) with a random 16-byte salt. The user supplies a minimum 10-character passphrase that is never stored or transmitted. Recovery enforces 5 MB/500-input limits, strict record reconstruction, current-device-first dedupe, 50-record retention, encrypted pre-import backup, and localStorage rollback. Starting fresh remains an explicit valid choice.

Actions run `33569797954` passed encrypted round-trip, wrong-passphrase rejection, ciphertext privacy assertions, input/retention limits, prototype stripping, rollback, source/syntax checks, and explicit no-Vercel/no-Supabase-change guards. Attempt 1 generated only the `index.html` script mount at `1ad46ad6df12e5843e8f76581a8ac472b7d2553f`. Attempt 2 checked out that generated head, printed `index.html: already deterministic`, reran all QA green, and reported `Generated GhostLane recovery source already settled.`

**Gate status:** code/CI + deterministic settle complete. Still blocked from uninstall/cutover until an isolated encrypted export → restore/merge round trip is verified on the intended wrapper, or the user explicitly chooses to start fresh. Supabase stays paused and is not a cutover dependency.

### First Bearing™

First Bearing carries the highest-consequence local-only dataset in the portfolio: recovery check-ins/history, sponsor/support relationships, meeting records, step work, family plans/boundaries, reminders and related recovery state. The isolated Phase 7 branch now adds validated merge-only restore/import for the existing backup with automatic pre-import backup, duplicate-safe arrays, non-destructive object merge, schema/version validation, safety limits, prototype sanitization, and transactional rollback. Legacy v2.6.0 backups, including legitimate null optional fields, remain supported.

Actions run `33536545004` passed source-contract and functional recovery QA, including simulated mid-import storage failure and rollback.

**Gate status:** code/CI complete. Still blocked from uninstall/cutover until a representative interactive browser/Android export → restore round trip passes on the exact release source.

### Fantasy Football Matrix™

Fast Draft persists active draft selections, the user's roster and gap state locally. Feed/cache data is disposable.

**Gate status:** blocked only if an active draft must be preserved. Add a simple draft backup/restore or enforce a no-active-draft cutover condition with a clear warning.

### Acelynn’s ScoutTrace™

Canonical Vercel project is `acelynn-scoutrace`. Its current production deployment is `dpl_BYVPu6i8Xrbcts697rRCc1Mfpp7Q` from Git commit `9dc845690b865d5694a26166a908450b865e41c2`. Repository `Brett81Ross/acelynn_scoutrace` current `main` is `c4f5eac6190cb9c2d6908d73b50db3483a683d6c`, five commits ahead; that delta is limited to demo-shell/config, native-install, and Vercel metadata rather than the raw app/history implementation.

The durable browser contract is `st-h-v2` for scan history and `st-s-v2` for settings. History is stored newest-first and production code caps it at 75 records. Settings are simple/recreatable. The existing Share Summary emits human-readable text only and cannot reconstruct storage.

The isolated branch `android-signing-cutover-data-recovery` now adds schema `scouttrace-backup-v1`: 5 MB file cap, 1000-input safety cap, strict field allowlisting, prototype-key stripping by reconstruction, current-device-first dedupe merge, 75-record retention, pre-import backup download, and rollback across history/settings writes. Backup settings only fill a clean install when no current settings record exists. It never calls `localStorage.clear()`.

Actions run `33569169237` passed functional/source QA, JavaScript syntax checks, and the no-deployment guard. Attempt 1 generated only `index.html` + `raw-index.html` at commit `afad881ab2f78903a55b787c3d738bcee8ef8ae3`. Attempt 2 checked out that generated head, reported both files already deterministic, passed every gate, and printed `Generated ScoutTrace recovery source already settled.`

Version/release truth remains a separate blocker. A read-only fetch of `https://acelynn-scoutrace.vercel.app/` on 2026-09-01 rendered v1.2.0. The repository shell contains a v1.2.0→v1.2.1 rewrite and CactusByte lists v1.2.1. This recovery patch does not silently change that release state. The exact raw recovery source also still registers `sw.js`, so service-worker cleanup must be reconciled separately rather than falsely marked complete.

**Gate status:** code/CI + deterministic settle complete. Still blocked from uninstall/cutover until an isolated export → clean/isolated restore round trip passes and version/service-worker source truth is explicitly reconciled on the intended release source.

### OrbitGather™

OrbitGather’s cloud identity is `orbitgather:cloud-installation-id` + `orbitgather:cloud-installation-secret`. Read-only Supabase audit showed the installation UUID is already the foreign-key owner of saved searches, scan runs, and opportunities, so migrating/re-parenting rows would be unnecessary and riskier. No Supabase schema migration is required.

The staged design binds the existing installation UUID to an authenticated CactusByte ID in server-side Firestore. The legacy secret is verified only inside a new isolated `orbitgather-recovery` Supabase Edge Function. Protect uses a short-lived CactusByte claim token plus server-only HMAC attestation. Restore acquires a CactusByte processing lease, rotates `og_installations.secret_hash` on the same UUID, and finalizes the lease. Retry safety preserves a pending new secret client-side and makes restore acknowledgement idempotent so a lost response cannot strand the device after a successful server rotation. The old destructive `unauthorized_device` path no longer silently deletes the local identity and registers a replacement.

CactusByte authority branch `orbitgather-identity-recovery-authority` passed recovery security QA, all existing CactusByte QA/regressions, production build, and no-deployment guard in Actions run `33563934200` at head `1dc0e4a2fffe8934e01faff20a92e1653719bb01`. OrbitGather branch `android-signing-cutover-identity-recovery` passed recovery contract QA, Next.js production build, scoped Deno 2 type-check, and no-deployment guard in run `33563971968`. The generated UI commit is `5702fa7db0b8183743ab029e857e8b1071edd087`; attempt 2 checked out that head and reported `Generated OrbitGather identity recovery UI already settled.`

No real `ORBITGATHER_RECOVERY_BRIDGE_SECRET` has been generated or configured, no Edge Function has been deployed, and live Supabase rows/schema are unchanged. Automatic recovery of an already-uninstalled, never-protected installation is intentionally unsupported because no cryptographic account↔installation binding exists; any future owner-assisted exception must be separately audited.

**Gate status:** code/CI + deterministic settle complete. Still blocked from uninstall/cutover until approved runtime configuration/deployment exists, the legacy app completes Protect Cloud Identity, an isolated clean install restores the exact same UUID with a different secret, and existing saved-search/opportunity metadata is verified.

### ShadowNex Prime™

Normal UI preferences are Category C. User-entered provider/API keys are sensitive local values and should not silently appear in an ordinary plaintext migration file.

**Gate status:** require manual re-entry readiness or an explicitly protected secret-transfer mechanism. Normal preference loss alone does not block cutover.

### TerraFlow Matrix™

TerraFlow is local-first but already supports owner-scoped Supabase upload and merge for its primary business record sets. Therefore a synchronized device can be treated as Category A only after the cloud copy is actually verified; an unsynchronized device remains Category B.

**Gate status:** requires an end-to-end sync/restore proof using representative records and count/content verification before phone uninstall.

### OrbitGather™

OrbitGather's cloud backend authenticates device-scoped records using a locally stored installation ID + secret. Missing credentials cause a clean install to register a new installation. That is not a normal cache reset; it can detach the new install from the old installation's cloud records.

**Gate status:** critical blocker. Build an installation transfer/recovery mechanism before cutover. Do not solve this by encouraging users to paste long-lived device secrets into insecure logs, issues, screenshots, or ordinary plaintext backups.

## Phase 7 recovery-tooling order

1. First Bearing — **code/CI complete; interactive runtime round trip pending**.
2. PocketStomp — **code/CI + deterministic settle complete; static-image source parity + interactive runtime round trip pending**.
3. No Problem Matrix — **code/CI + deterministic settle complete; isolated runtime/entitlement proof pending**.
4. Rapid Takeoff — lifetime Pro clean-install recovery bridge.
5. OrbitGather — installation identity/account recovery or transfer.
6. Acelynn Pro — snapshot import/restore.
7. ScoutTrace — history export/import.
8. GhostLane — protected ledger migration or explicit start-fresh path.
9. Fantasy Football Matrix — active-draft preservation.
10. TerraFlow — verified cloud upload/clean-install merge proof.
11. MachZero — Recovery Key pre-cutover verification.
12. ShadowNex Prime — safe API-key re-entry/transfer path.
13. CactusByte hub — clean-install recovery CI is already green; device execution still waits for explicit approval.

## Hard release rule

**NO UNINSTALL / NO CUTOVER for a brand until that brand's recovery gate above has passed on the exact source intended for release.**

No item in this audit authorizes a Vercel deployment, PR merge, Play publishing action, APK installation, or phone uninstall. The final device sequence remains controlled by `SIGNING_CUTOVER_RUNBOOK.md` and requires explicit user approval before the first uninstall.
