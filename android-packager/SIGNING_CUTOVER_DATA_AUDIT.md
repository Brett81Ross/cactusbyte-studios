# Cactus🌵Byte Studios™ Android Signing-Cutover Data / Access Audit

Status: **Phase 6 complete — staged only. NO UNINSTALL / NO CUTOVER is authorized by this document.**

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
| No Problem Pressure Washing Matrix™ | B | Saved project and Matrix settings are browser-local. Staged photos are transient memory. | Add and QA JSON export/import for saved project + settings; verify round trip before uninstall. |
| MachZero™ | A/C conditional | Install ID/settings are local; paid plan / unused scan-pack access is transferable through Recovery Key. | If durable paid access exists, create and verify Recovery Key before uninstall; settings may be recreated. |
| Rapid Takeoff™ | C data + access blocker | Blueprint/report work is transient/output-oriented, but lifetime Pro is represented by a long-lived HttpOnly device cookie after single-use coupon redemption. | Add account/recovery bridge for lifetime Pro and prove clean-install restoration before uninstall. |
| Acelynn Pro™ | B | Saved analysis snapshots are local. JSON export exists; matching import/restore was not found. | Add validated snapshot import/restore; prove legacy + current backup compatibility. |
| PocketStomp™ | B — high priority | Production stores calibration profile, session archive, settings, learned corrections locally. Production/source mismatch must be reconciled first. | Locate/reconcile the advanced V2 canonical source, then add archive export/import and prove round trip. |
| GhostLane™ | B — sensitive | Privacy/intercept ledger is local; camera-node cache is recreatable. | Provide privacy-preserving migration choice: opt-in protected export/import or explicit start-fresh acknowledgement. No plaintext secret/cookie dump. |
| First Bearing™ | B — highest consequence | Recovery history, check-ins, sponsor/support contacts, meetings, step work, family plans/boundaries, reminders and related recovery records are local. Comprehensive JSON export exists; restore/import was not found. | Add validated, merge-only import with automatic pre-import backup and duplicate-safe behavior; prove round trip before uninstall. |
| Fantasy Football Matrix™ | B-light | Active draft state/roster/gap state are local; data feed cache is disposable. | Add lightweight active-draft export/import or require no active draft at cutover and clearly warn what resets. |
| Acelynn’s ScoutTrace™ | B | Scan history is local (up to 75 entries); settings are recreatable. Existing share text is not a restorable backup. | Add JSON history export/import and prove round trip; verify current v1.2.1 source/version truth before cutover. |
| ShadowNex Prime™ | B-sensitive/C | Preferences are recreatable; user-entered API keys are local secrets. | Require keys to be available for manual re-entry or implement an explicit protected secret transfer. Do not include secrets in ordinary plaintext migration JSON. |
| TerraFlow Matrix™ | Hybrid A/B | Core business records are local-first but can be uploaded/merged through owner-scoped Supabase sync. | Sign in → Upload This Device → verify cloud record counts/copy → uninstall → fresh sign-in → Merge From Cloud → verify restored records. Unsynced installs remain Category B. |
| OrbitGather™ | B — critical identity blocker | Cloud records are authenticated by a local installation ID + installation secret. Clean reinstall registers as a new device and can orphan device-scoped saved searches/opportunity metadata. | Add installation identity recovery/transfer, preferably bound to CactusByte ID or a dedicated recovery credential; verify old cloud records are reachable from a clean install. |

## Detailed evidence and policy

### Cactus🌵Byte Studios™

The hub stores the Firebase session and trusted-device backup locally, so uninstall erases the current device session. Recovery is nevertheless Category A because clean-install CI proves a fresh email/password session can be created, password reset exists, a verified Firebase owner can be recognized server-side, and a fresh trusted-device credential can be minted. The private `/owner-device` bootstrap is an independent re-trust path.

**Gate status:** recovery architecture and CI complete. Actual phone cutover still requires explicit user approval under the runbook.

### No Problem Pressure Washing Matrix™

Source uses browser-local persistence for Matrix settings and the most recent saved project. These can represent real estimate/project work and cannot be treated as cache. Staged photos are not durable storage.

**Gate status:** blocked until export/import exists and a representative saved project + settings round-trip passes.

### MachZero™

`machzero.installId` and settings are local. The install ID participates in device-scoped server behavior, but the app already provides Recovery Key creation and Restore Access for paid plan / unused paid scan-pack state on a replacement or reset device.

**Gate status:** architecture exists. Before the actual MachZero uninstall, a user with durable paid access must create/save/test a Recovery Key. Never publish the key in source, issues, screenshots, or migration documentation.

### Rapid Takeoff™

Current takeoff inputs/results are not durable project storage; outputs can be printed/downloaded/shared. The cutover blocker is access: lifetime Pro is granted using a long-lived HttpOnly cookie after single-use coupon redemption. Uninstall erases that cookie while the original single-use coupon cannot be assumed reusable.

**Gate status:** blocked until lifetime Pro is restorable through CactusByte ID, a server entitlement, or a purpose-built recovery credential.

### Acelynn Pro™

Saved snapshots are local. Existing JSON export protects a copy but without an import path it is not a recovery system.

**Gate status:** blocked until validated import/restore supports existing exported data and current schema without destructive replacement.

### PocketStomp™

The verified production app stores profile/calibration data, session history, learned correction/settings state locally. The connected Vercel project points at a GitHub repository whose `main` surface did not match the advanced production bundle during this audit.

**Gate status:** blocked. First reconcile the advanced V2 source; then add versioned archive export/import. Do not edit an older/basic source under the assumption that it is the production code.

### GhostLane™

The privacy/intercept ledger is durable local state. Because GhostLane is privacy-sensitive, normal plaintext export of sensitive navigation/privacy records is not an acceptable default migration mechanism.

**Gate status:** blocked until the user can either perform a protected/explicit local export+restore or intentionally choose to start fresh. Supabase remains intentionally paused and is not part of this cutover gate.

### First Bearing™

First Bearing carries the highest-consequence local-only dataset in the portfolio: recovery check-ins/history, sponsor/support relationships, meeting records, step work, family plans/boundaries, reminders and related recovery state. A comprehensive JSON backup download already exists, but no matching restore/import path was found.

**Gate status:** blocked until restore exists. Phase 7 begins here. Requirements: versioned validation, automatic pre-import backup, merge-only default, duplicate-safe arrays, object/settings merge without deleting unknown existing fields, clear failure/success reporting, and no silent data loss.

### Fantasy Football Matrix™

Fast Draft persists active draft selections, the user's roster and gap state locally. Feed/cache data is disposable.

**Gate status:** blocked only if an active draft must be preserved. Add a simple draft backup/restore or enforce a no-active-draft cutover condition with a clear warning.

### Acelynn’s ScoutTrace™

Scan history is stored locally and can represent records the user wants to retain. Settings are recreatable. The existing human-readable share output is not a machine-restorable backup.

**Gate status:** blocked until versioned JSON history export/import is available and source/version drift is reconciled.

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

1. First Bearing — validated restore/import for the existing comprehensive backup.
2. PocketStomp — reconcile canonical advanced V2 source, then archive export/import.
3. No Problem Matrix — saved project + settings export/import.
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
