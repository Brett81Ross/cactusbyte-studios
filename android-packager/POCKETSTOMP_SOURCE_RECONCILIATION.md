# PocketStomp™ Advanced V2 Source Reconciliation

Status: **Phase 7 source gate investigated — advanced production source is not yet represented by a verified Git commit. No deployment, merge, APK install, or phone uninstall is authorized by this document.**

Date: 2026-09-01

## Canonical production target

- Vercel project: `pocketstomp-v2-brett81ross`
- Vercel project ID: `prj_E7VyXL58dv6XUC8vr738yrsngYqz`
- Production domain: `https://pocketstomp-v2-brett81ross.vercel.app/`
- Current production deployment inspected: `dpl_9RozD8FT12vvssxbDeVG3AayDyEg`
- Deployment state: `READY`
- Deployment target: `production`
- Deployment created: 2026-08-02 20:50:27 UTC
- Framework: Next.js
- Build log detected Next.js `16.2.12`
- Build log package name/version: `pocketstomp@1.0.0`
- Build log reported 18 deployment files.

The production UI is the advanced V2 application with calibration, Board Fusion, Coach 2.0, local conditions, natural voice selection, trick learning/corrections, session history, simulator, and enhanced trick/landing analytics.

## GitHub repositories inspected

### `Brett81Ross/pocketstomp`

- Private repository.
- Default branch: `main`.
- Only branch found: `main`.
- Repository root contains `js/` and `ts/` Create Next App template trees.
- `js/app/page.js` is the stock Next.js starter page.
- No root `package.json` matching the production project was found.
- Account/repository code search did not find the advanced V2 production strings.

**Conclusion:** this repository is not the advanced V2 production source.

### `Brett81Ross/pocketstomp-`

- Public repository.
- Default branch: `main`.
- Contains a real PocketStomp Next.js app and historical PocketStomp commits.
- Root `package.json` identifies `pocketstomp` v1.0.0 with Next/React dependencies.
- Current `app/page.js` is the older v1.0 tracker: basic motion tracking, speed, trick log, share flow, and v1.0.0 UI.
- It does not contain the production advanced V2 calibration, Board Fusion, Coach 2.0, weather coaching, learned corrections, or local archive implementation.
- Account-wide searches for unique production strings such as `Calibrate your ride`, `Board Fusion`, and `pocketstomp.profile.v2` returned no committed source matches.

**Conclusion:** this repository is historically relevant and closer to PocketStomp, but current committed `main` is still not the advanced V2 production source.

## Vercel evidence

The current production deployment metadata does not expose Git commit/repository metadata. Its build log begins by retrieving a list of deployment files rather than cloning a Git repository. Combined with the 18-file upload and the absence of matching committed GitHub source, this strongly indicates that the advanced V2 build was deployed from a local/uncommitted source snapshot or another direct-upload workflow.

This is evidence, not permission to reconstruct or overwrite Git history.

## Production local durable state — exact verified keys

The current production client bundle defines:

- `pocketstomp.profile.v2`
  - rider calibration profile;
  - learned trick-correction mapping;
  - calculated motion threshold and calibration measurements.
- `pocketstomp.sessions.v2`
  - local session archive;
  - current production code retains up to **100** sessions.
- `pocketstomp.settings.v2`
  - Coach mode;
  - personality;
  - selected voice name;
  - Smart Coaching setting.

The production bundle also registers `/sw.js`. Service-worker removal is a separate release-quality task and must not be silently mixed into the signing-recovery source reconstruction.

## Recovery requirement after source reconciliation

Once an exact editable V2 source is recovered and pinned to a Git commit, PocketStomp needs a versioned archive system covering all three production keys above.

Required behavior:

1. Export calibration/profile + learned corrections, session archive, and settings into one versioned JSON backup.
2. Validate app identity and schema/version before any write.
3. Create an automatic pre-import backup before restoration.
4. Restore/merge without silently deleting valid current-device data.
5. Deduplicate sessions by a stable session identity (prefer stored `id`; use a deterministic fallback only when required for legacy data).
6. Preserve the current-device value on conflicts unless a field has an explicit safe merge rule.
7. Sanitize prototype-pollution keys and reject malformed/oversized backup input.
8. Apply writes transactionally with rollback if localStorage fails mid-import.
9. Prove export → clear representative PocketStomp keys → import → equivalent restored state in automated QA.
10. Prove an interactive browser/Android round trip on the exact release source before uninstall/cutover approval.

## Hard source gate

Do **not** add the recovery implementation to either currently committed PocketStomp repository under the assumption that it is production source.

Before implementation, one of these must happen:

- locate the original advanced V2 editable source and commit it with preserved provenance; or
- perform a controlled source-recovery exercise from the production deployment assets, review the recovered source against production behavior, then deliberately establish a new canonical Git source with an audit trail.

Compiled/minified Vercel assets may be used as evidence or a recovery input, but they are not automatically canonical source.

## Cutover status

**BLOCKED at source reconciliation.**

No PocketStomp uninstall/cutover is allowed until:

1. advanced V2 source is recovered and pinned;
2. archive export/import is implemented and QA-green;
3. interactive exact-release round trip passes;
4. explicit cutover approval is given under `SIGNING_CUTOVER_RUNBOOK.md`.
