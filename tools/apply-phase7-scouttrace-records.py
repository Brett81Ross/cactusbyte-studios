from pathlib import Path

ABL=Path('ATOMIC_BUILD_LIST.md')
AUDIT=Path('android-packager/SIGNING_CUTOVER_DATA_AUDIT.md')
RUNBOOK=Path('android-packager/SIGNING_CUTOVER_RUNBOOK.md')

# ABL
text=ABL.read_text(encoding='utf-8')
anchor='## Acelynn’s ScoutTrace™ v1.2.1\n'
block=(
    '- [x] Re-audit canonical production/source truth for signing cutover: Vercel project `acelynn-scoutrace` production deployment `dpl_BYVPu6i8Xrbcts697rRCc1Mfpp7Q` is from commit `9dc845690b865d5694a26166a908450b865e41c2`; current `main` is `c4f5eac6190cb9c2d6908d73b50db3483a683d6c`, five commits ahead only in demo/native-installer/Vercel metadata.\n'
    '- [x] Verify durable browser state keys `st-h-v2` (scan history, newest-first, max 75) and `st-s-v2` (recreatable settings). The existing Share Summary is human-readable only and is not a restorable backup.\n'
    '- [x] Stage `scouttrace-backup-v1` on isolated branch `android-signing-cutover-data-recovery` with 5 MB/1000-input safety limits, strict history/settings allowlisting, current-device-first history dedupe, 75-record retention, automatic pre-import backup, clean-install-only settings fill, and transactional rollback.\n'
    '- [x] Pass recovery functional/source QA, JavaScript syntax checks, and no-deployment guard in Actions run `33569169237`; generated recovery source is pinned at `afad881ab2f78903a55b787c3d738bcee8ef8ae3`.\n'
    '- [x] Prove deterministic settle in run `33569169237` attempt 2: generated head reran green and reported `Generated ScoutTrace recovery source already settled.` with no additional commit.\n'
    '- [ ] Reconcile release/version truth before deployment: a read-only production-domain fetch currently renders v1.2.0, while the repository demo shell rewrites raw v1.2.0 source to v1.2.1 and the CactusByte registry lists v1.2.1. Do not silently bump or downgrade during recovery.\n'
    '- [ ] Complete isolated browser/Android export → restore/merge round trip and verify representative scan-history records before authorizing uninstall/cutover.\n'
    '- [ ] Reconcile service-worker truth separately before release; the exact recovery source still contains `navigator.serviceWorker.register(\'sw.js\')`, so do not claim worker removal until the canonical release source actually proves it.\n'
)
if 'Generated ScoutTrace recovery source already settled.' not in text:
    if anchor not in text: raise SystemExit('Missing ScoutTrace ABL anchor')
    text=text.replace(anchor,anchor+block,1)
ABL.write_text(text,encoding='utf-8')

# Audit
text=AUDIT.read_text(encoding='utf-8')
old='| Acelynn’s ScoutTrace™ | B | Scan history is local (up to 75 entries); settings are recreatable. Existing share text is not a restorable backup. | Add JSON history export/import and prove round trip; verify current v1.2.1 source/version truth before cutover. |'
new='| Acelynn’s ScoutTrace™ | B | Scan history is local under `st-h-v2` (up to 75 entries); settings under `st-s-v2` are recreatable. | Recovery code/CI + deterministic settle are complete. Still require isolated history round trip plus explicit v1.2.0-live / v1.2.1-source-registry reconciliation before uninstall/cutover. |'
if old in text:text=text.replace(old,new,1)
old_detail='''### Acelynn’s ScoutTrace™\n\nScan history is stored locally and can represent records the user wants to retain. Settings are recreatable. The existing human-readable share output is not a machine-restorable backup.\n\n**Gate status:** blocked until versioned JSON history export/import is available and source/version drift is reconciled.\n'''
new_detail='''### Acelynn’s ScoutTrace™\n\nCanonical Vercel project is `acelynn-scoutrace`. Its current production deployment is `dpl_BYVPu6i8Xrbcts697rRCc1Mfpp7Q` from Git commit `9dc845690b865d5694a26166a908450b865e41c2`. Repository `Brett81Ross/acelynn_scoutrace` current `main` is `c4f5eac6190cb9c2d6908d73b50db3483a683d6c`, five commits ahead; that delta is limited to demo-shell/config, native-install, and Vercel metadata rather than the raw app/history implementation.\n\nThe durable browser contract is `st-h-v2` for scan history and `st-s-v2` for settings. History is stored newest-first and production code caps it at 75 records. Settings are simple/recreatable. The existing Share Summary emits human-readable text only and cannot reconstruct storage.\n\nThe isolated branch `android-signing-cutover-data-recovery` now adds schema `scouttrace-backup-v1`: 5 MB file cap, 1000-input safety cap, strict field allowlisting, prototype-key stripping by reconstruction, current-device-first dedupe merge, 75-record retention, pre-import backup download, and rollback across history/settings writes. Backup settings only fill a clean install when no current settings record exists. It never calls `localStorage.clear()`.\n\nActions run `33569169237` passed functional/source QA, JavaScript syntax checks, and the no-deployment guard. Attempt 1 generated only `index.html` + `raw-index.html` at commit `afad881ab2f78903a55b787c3d738bcee8ef8ae3`. Attempt 2 checked out that generated head, reported both files already deterministic, passed every gate, and printed `Generated ScoutTrace recovery source already settled.`\n\nVersion/release truth remains a separate blocker. A read-only fetch of `https://acelynn-scoutrace.vercel.app/` on 2026-09-01 rendered v1.2.0. The repository shell contains a v1.2.0→v1.2.1 rewrite and CactusByte lists v1.2.1. This recovery patch does not silently change that release state. The exact raw recovery source also still registers `sw.js`, so service-worker cleanup must be reconciled separately rather than falsely marked complete.\n\n**Gate status:** code/CI + deterministic settle complete. Still blocked from uninstall/cutover until an isolated export → clean/isolated restore round trip passes and version/service-worker source truth is explicitly reconciled on the intended release source.\n'''
if old_detail in text:text=text.replace(old_detail,new_detail,1)
AUDIT.write_text(text,encoding='utf-8')

# Runbook
text=RUNBOOK.read_text(encoding='utf-8')
if '### Acelynn’s ScoutTrace™ — preserve scan history' not in text:
    anchor='### Other wrappers\n'
    block='''### Acelynn’s ScoutTrace™ — preserve scan history\n\nBefore uninstall:\n\n1. Open **Scan History** and choose **Export Backup**.\n2. Keep the JSON backup private; it can include file hashes, suspicious-link notes, QR destinations, and scan details.\n3. Do not rely on **Share Summary** as a backup; it is not machine-restorable.\n4. Do not uninstall until the isolated round-trip gate has proven the backup can be restored on the intended release source.\n\nAfter the permanent-signed install:\n\n1. Open **Scan History → Restore / Merge Backup** and choose the saved JSON file.\n2. Verify a pre-import backup is created before storage is changed.\n3. Confirm representative history records, timestamps, levels, and details survived.\n4. Run one new scan and confirm history retention remains capped at 75.\n5. Verify the intended visible version and service-worker state match the reconciled release source before marking ScoutTrace complete.\n\n'''
    if anchor not in text: raise SystemExit('Missing runbook Other wrappers anchor')
    text=text.replace(anchor,block+anchor,1)
if '- [ ] ScoutTrace history export/import runtime round trip is proven before ScoutTrace uninstall.' not in text:
    anchor='- [ ] Acelynn Pro snapshot export/import runtime round trip is proven before Acelynn Pro uninstall.\n'
    addition=anchor+'- [ ] ScoutTrace history export/import runtime round trip is proven before ScoutTrace uninstall, and its intended v1.2.x/service-worker release truth is reconciled.\n'
    if anchor not in text: raise SystemExit('Missing Acelynn pre-cutover anchor')
    text=text.replace(anchor,addition,1)
RUNBOOK.write_text(text,encoding='utf-8')

print('ScoutTrace Phase 7 central records patched deterministically.')
