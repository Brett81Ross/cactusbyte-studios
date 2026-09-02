from pathlib import Path

ABL=Path('ATOMIC_BUILD_LIST.md')
AUDIT=Path('android-packager/SIGNING_CUTOVER_DATA_AUDIT.md')
RUNBOOK=Path('android-packager/SIGNING_CUTOVER_RUNBOOK.md')


def insert_before(text, anchor, block, marker, label):
    if marker in text:
        return text
    if anchor not in text:
        raise SystemExit(f'Missing {label} anchor')
    return text.replace(anchor, block + anchor, 1)

# ABL
text=ABL.read_text(encoding='utf-8')
text=insert_before(
    text,
    '\n## No Problem Pressure Washing Matrix™ v1.0.0',
    '\n- [x] Pin the Android signing-cutover identity design to the existing OrbitGather installation UUID; no Supabase DDL/schema migration or cloud-row re-parenting is required.\n'
    '- [x] Stage CactusByte account↔installation authority plus the isolated `orbitgather-recovery` Edge Function with short-lived tokens, HMAC bridge attestation, restore leases, same-UUID secret rotation, retry-safe pending-secret handling, and no automatic email-only fallback.\n'
    '- [x] Pass CactusByte OrbitGather recovery-authority QA and full existing hub preflight/build in Actions run `33563934200` against authority head `1dc0e4a2fffe8934e01faff20a92e1653719bb01`.\n'
    '- [x] Pass OrbitGather recovery contract QA, Next.js production build, scoped Deno 2 Edge Function type-check, and no-deployment guard in Actions run `33563971968`; generated UI source is pinned at `5702fa7db0b8183743ab029e857e8b1071edd087`.\n'
    '- [x] Prove deterministic settle in Actions run `33563971968` attempt 2: the generated head reran green and reported `Generated OrbitGather identity recovery UI already settled.` with no additional commit.\n'
    '- [ ] After explicit deployment/configuration approval only, configure the same server-only `ORBITGATHER_RECOVERY_BRIDGE_SECRET` in CactusByte and Supabase, protect the legacy installation before uninstall, then prove isolated clean-install restore preserves the exact UUID, rotates the secret, and retains saved searches/opportunity metadata.\n',
    'Generated OrbitGather identity recovery UI already settled.',
    'OrbitGather ABL'
)
acelynn_anchor='## Acelynn Pro™ v1.1.2\n'
acelynn_block=(
    '- [x] Pin canonical Acelynn Pro production to Vercel project `acelynn`, repo `Brett81Ross/Acelynn`, production deployment `dpl_BX4tHTSXgh6XqeCBevbm14EdcJT2`, production commit `302c43d029cf975a98e3db20ca9ec5466a9e0dba`, and current `main` `11e4b59139894a194f1eb0342e6a184dda2296df`; the six commits ahead do not modify `index.html`.\n'
    '- [x] Verify the durable cutover state is the single `acelynn-snapshots` localStorage record, with production retention capped at 12 snapshots; existing JSON export was legacy-compatible but had no import path.\n'
    '- [x] Stage `acelynn-pro-backup-v1` restore on isolated branch `android-signing-cutover-data-recovery` with legacy-report compatibility, 5 MB cap, 1000-input safety cap, field allowlisting/sanitization, current-device-first dedupe merge, 12-snapshot retention, automatic pre-import backup, and storage rollback.\n'
    '- [x] Pass functional/source QA, JavaScript syntax checks, live-shell parity, and no-deployment guard in Actions run `33568622698`; generated recovery source is pinned at `00ea3761cff27771f020c194b454b97daae9c168` and attempt 2 reports `Generated Acelynn Pro recovery source already settled.`\n'
    '- [ ] Complete an isolated browser/Android legacy export → restore/merge round trip and verify all expected snapshots before authorizing uninstall/cutover.\n'
    '- [ ] Remove/disable Acelynn Pro’s existing service worker in a separate release-quality batch; do not mix that behavior change into the signing-recovery patch.\n'
)
if 'Generated Acelynn Pro recovery source already settled.' not in text:
    if acelynn_anchor not in text: raise SystemExit('Missing Acelynn ABL anchor')
    text=text.replace(acelynn_anchor,acelynn_anchor+acelynn_block,1)
ABL.write_text(text,encoding='utf-8')

# Audit table + detailed sections
text=AUDIT.read_text(encoding='utf-8')
old='| Acelynn Pro™ | B | Saved analysis snapshots are local. JSON export exists; matching import/restore was not found. | Add validated snapshot import/restore; prove legacy + current backup compatibility. |'
new='| Acelynn Pro™ | B | Saved analysis snapshots are local under `acelynn-snapshots` with 12-record retention. | Recovery code/CI + deterministic settle are complete. Still require isolated legacy-export → restore/merge runtime proof before uninstall/cutover. |'
if old in text: text=text.replace(old,new,1)
old='| OrbitGather™ | B — critical identity blocker | Cloud records are authenticated by a local installation ID + installation secret. Clean reinstall registers as a new device and can orphan device-scoped saved searches/opportunity metadata. | Add installation identity recovery/transfer, preferably bound to CactusByte ID or a dedicated recovery credential; verify old cloud records are reachable from a clean install. |'
new='| OrbitGather™ | B — critical identity blocker | Cloud records are authenticated by a local installation UUID + secret; the UUID owns saved-search/scan/opportunity foreign-key relationships. | Recovery code/CI + deterministic settle are complete with same-UUID secret rotation and CactusByte binding. Still require approved bridge-secret configuration plus legacy Protect and isolated clean-install Restore runtime proof before uninstall/cutover. |'
if old in text: text=text.replace(old,new,1)
old='''### Acelynn Pro™\n\nSaved snapshots are local. Existing JSON export protects a copy but without an import path it is not a recovery system.\n\n**Gate status:** blocked until validated import/restore supports existing exported data and current schema without destructive replacement.\n'''
new='''### Acelynn Pro™\n\nCanonical production is Vercel project `acelynn` / repo `Brett81Ross/Acelynn`. The current production deployment is `dpl_BX4tHTSXgh6XqeCBevbm14EdcJT2` from commit `302c43d029cf975a98e3db20ca9ec5466a9e0dba`. GitHub `main` is six commits ahead at `11e4b59139894a194f1eb0342e6a184dda2296df`, but that delta does not modify `index.html`, so the snapshot-storage lineage is unchanged.\n\nThe durable state is one localStorage record, `acelynn-snapshots`, retained at a maximum of 12 checks. The live source already exported `{app, created, snapshots}` JSON but provided no import path. The isolated branch `android-signing-cutover-data-recovery` now adds schema `acelynn-pro-backup-v1` while accepting the legacy report format. Restore enforces a 5 MB file limit, at most 1000 input snapshots, strict field normalization, current-device-first dedupe merge, 12-snapshot retention, automatic pre-import backup download, and rollback if the localStorage write fails. `index.html` and `app-base.html` remain byte-identical so the Vercel demo shell uses the same recovery surface.\n\nActions run `33568622698` passed functional/source QA, JavaScript syntax validation, demo-shell parity, and the no-deployment guard. Attempt 1 generated only `index.html` + `app-base.html` at commit `00ea3761cff27771f020c194b454b97daae9c168`. Attempt 2 checked out that generated head, reported both files already deterministic, passed every gate again, and printed `Generated Acelynn Pro recovery source already settled.`\n\nThe current source still registers `sw.js`. Service-worker removal is intentionally not mixed into this recovery patch and remains a separate release-quality task.\n\n**Gate status:** code/CI + deterministic settle complete. Still blocked from uninstall/cutover until an isolated browser/Android legacy export → restore/merge round trip proves the expected snapshots survive.\n'''
if old in text: text=text.replace(old,new,1)
old='''### OrbitGather™\n'''
if 'Generated OrbitGather identity recovery UI already settled.' not in text:
    # Insert a detailed OrbitGather section before ShadowNex if the existing section is later in the file.
    anchor='### ShadowNex Prime™\n'
    block='''### OrbitGather™\n\nOrbitGather’s cloud identity is `orbitgather:cloud-installation-id` + `orbitgather:cloud-installation-secret`. Read-only Supabase audit showed the installation UUID is already the foreign-key owner of saved searches, scan runs, and opportunities, so migrating/re-parenting rows would be unnecessary and riskier. No Supabase schema migration is required.\n\nThe staged design binds the existing installation UUID to an authenticated CactusByte ID in server-side Firestore. The legacy secret is verified only inside a new isolated `orbitgather-recovery` Supabase Edge Function. Protect uses a short-lived CactusByte claim token plus server-only HMAC attestation. Restore acquires a CactusByte processing lease, rotates `og_installations.secret_hash` on the same UUID, and finalizes the lease. Retry safety preserves a pending new secret client-side and makes restore acknowledgement idempotent so a lost response cannot strand the device after a successful server rotation. The old destructive `unauthorized_device` path no longer silently deletes the local identity and registers a replacement.\n\nCactusByte authority branch `orbitgather-identity-recovery-authority` passed recovery security QA, all existing CactusByte QA/regressions, production build, and no-deployment guard in Actions run `33563934200` at head `1dc0e4a2fffe8934e01faff20a92e1653719bb01`. OrbitGather branch `android-signing-cutover-identity-recovery` passed recovery contract QA, Next.js production build, scoped Deno 2 type-check, and no-deployment guard in run `33563971968`. The generated UI commit is `5702fa7db0b8183743ab029e857e8b1071edd087`; attempt 2 checked out that head and reported `Generated OrbitGather identity recovery UI already settled.`\n\nNo real `ORBITGATHER_RECOVERY_BRIDGE_SECRET` has been generated or configured, no Edge Function has been deployed, and live Supabase rows/schema are unchanged. Automatic recovery of an already-uninstalled, never-protected installation is intentionally unsupported because no cryptographic account↔installation binding exists; any future owner-assisted exception must be separately audited.\n\n**Gate status:** code/CI + deterministic settle complete. Still blocked from uninstall/cutover until approved runtime configuration/deployment exists, the legacy app completes Protect Cloud Identity, an isolated clean install restores the exact same UUID with a different secret, and existing saved-search/opportunity metadata is verified.\n\n'''
    if anchor not in text: raise SystemExit('Missing OrbitGather detailed audit insertion anchor')
    text=text.replace(anchor,block+anchor,1)
AUDIT.write_text(text,encoding='utf-8')

# Runbook: add app-specific procedures + checklist lines.
text=RUNBOOK.read_text(encoding='utf-8')
if '### OrbitGather™ — protect cloud identity before uninstall' not in text:
    anchor='### Other wrappers\n'
    block='''### OrbitGather™ — protect cloud identity before uninstall\n\nOrbitGather must preserve its existing cloud installation UUID; do not allow a clean install to silently register a replacement identity during signing cutover.\n\nBefore uninstall:\n\n1. Confirm the legacy OrbitGather install can still reach its existing cloud state.\n2. Use **Protect Cloud Identity** while the existing installation UUID + secret are still present.\n3. Authenticate the CactusByte ID that should own that installation.\n4. Verify protection succeeds for the exact legacy installation UUID.\n5. Do **not** uninstall on an expired/failed claim or if the UUID cannot be verified.\n\nAfter the permanent-signed install:\n\n1. Authenticate the same CactusByte ID.\n2. Use **Restore Cloud Identity**.\n3. Verify the restored UUID exactly matches the protected legacy UUID.\n4. Verify the new device secret is rotated rather than reused.\n5. Confirm saved searches, scan history, and opportunity metadata remain reachable before marking OrbitGather complete.\n\nThe bridge requires the same server-only `ORBITGATHER_RECOVERY_BRIDGE_SECRET` in CactusByte and the Supabase recovery Edge Function, configured only after separate explicit deployment approval. Do not copy the old installation secret into CactusByte or ordinary backup files.\n\n### Acelynn Pro™ — preserve saved mix snapshots\n\nBefore uninstall:\n\n1. Export the Acelynn Pro backup from the legacy install.\n2. Keep the JSON file private; it contains saved analysis snapshots.\n3. Do not uninstall until the isolated recovery round-trip gate has already proven the current recovery build can consume both legacy reports and the versioned backup format.\n\nAfter the permanent-signed install:\n\n1. Open **Restore / merge backup** and choose the saved JSON file.\n2. Confirm Acelynn downloads a pre-import backup before writing.\n3. Verify the restored snapshot count/content and run one new live/file mix check.\n4. Do not treat service-worker cleanup as part of this recovery step; that behavior change is a separate release-quality batch.\n\n'''
    if anchor not in text: raise SystemExit('Missing runbook Other wrappers anchor')
    text=text.replace(anchor,block+anchor,1)
if '- [ ] OrbitGather legacy cloud identity is protected before OrbitGather uninstall' not in text:
    anchor='- [ ] Rapid Takeoff legacy lifetime-Pro claim is verified before Rapid uninstall, and same-ID clean-install restore is proven after approved bridge-secret configuration.\n'
    addition=anchor+'- [ ] OrbitGather legacy cloud identity is protected before OrbitGather uninstall, and same-UUID clean-install restore is proven after approved bridge-secret configuration.\n- [ ] Acelynn Pro snapshot export/import runtime round trip is proven before Acelynn Pro uninstall.\n'
    if anchor not in text: raise SystemExit('Missing runbook pre-cutover Rapid anchor')
    text=text.replace(anchor,addition,1)
RUNBOOK.write_text(text,encoding='utf-8')

print('Phase 7 OrbitGather + Acelynn central records patched deterministically.')
