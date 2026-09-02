from pathlib import Path


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one match, found {count}: {old[:120]!r}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


abl = Path("ATOMIC_BUILD_LIST.md")
audit = Path("android-packager/SIGNING_CUTOVER_DATA_AUDIT.md")
runbook = Path("android-packager/SIGNING_CUTOVER_RUNBOOK.md")

replace_once(
    abl,
    "- [x] Complete the physical Android recovery gate on the Samsung Z Fold using isolated package `com.cactusbyte.acelynnpro.qa` with the exact pinned recovery assets from `6363059183cebe650830cc240d275936dc802d34`: live microphone analysis worked after the QA-only native bridge fix; a real JSON backup survived app-data clearing; clean-state restore returned the saved snapshot; re-importing the same backup did not duplicate it; a new post-restore snapshot saved in correct chronological order; and a deliberately wrong-app JSON backup was blocked natively with the persistent message `Backup rejected — This backup belongs to a different app. Your saved checks were not changed.` Foundation QA build `33624538021`, 26-APK signing gate `33624537920`, Atomic QA, and Chromium/WebKit viewport QA passed on foundation commit `60b2d82a25c6631aa250a0930d5127964dc34750`.\n- [x] Confirm Acelynn Pro service-worker removal is already part of the certified recovery source; no separate worker-removal gate remains for Phase 7.\n",
    "- [x] Complete the physical Android recovery-engine gate on the Samsung Z Fold using isolated package `com.cactusbyte.acelynnpro.qa` with the exact pinned recovery assets from `6363059183cebe650830cc240d275936dc802d34`: live microphone analysis worked after the QA-only native bridge fix; a real JSON backup survived app-data clearing; clean-state restore returned the saved snapshot; re-importing the same backup did not duplicate it; a new post-restore snapshot saved in correct chronological order; and a deliberately wrong-app JSON backup was blocked natively with the persistent message `Backup rejected — This backup belongs to a different app. Your saved checks were not changed.` Foundation QA build `33624538021`, 26-APK signing gate `33624537920`, Atomic QA, and Chromium/WebKit viewport QA passed on foundation commit `60b2d82a25c6631aa250a0930d5127964dc34750`. This certifies the recovery engine and QA wrapper, not yet the production Direct cutover path.\n- [x] Confirm Acelynn Pro service-worker removal is already part of the certified recovery source; no separate worker-removal gate remains for Phase 7.\n- [ ] **Acelynn Pro production-cutover equivalence gate:** verify the exact permanent-signed Direct APK has guaranteed access to the certified recovery implementation, then pass a synthetic legacy-signature → export → uninstall → permanent-signature → restore round trip on a non-production Android environment before authorizing any real Acelynn uninstall.\n",
)

replace_once(
    abl,
    "- [x] Phase 7 — Acelynn Pro: validated snapshot import/restore, isolated Android QA package, microphone bridge, clean-state backup/restore, duplicate suppression, post-restore chronological save, invalid-backup preservation, and native persistent rejection feedback all passed on the physical Samsung Z Fold. Exact foundation commit `60b2d82a25c6631aa250a0930d5127964dc34750` passed Acelynn QA run `33624538021` and 26-APK signing gate `33624537920`. Acelynn Pro is recovery-ready; uninstall/permanent-signing cutover still requires explicit user approval.\n",
    "- [x] Phase 7 — Acelynn Pro recovery engine/device gate: validated snapshot import/restore, isolated Android QA package, microphone bridge, clean-state backup/restore, duplicate suppression, post-restore chronological save, invalid-backup preservation, and native persistent rejection feedback all passed on the physical Samsung Z Fold. Exact foundation commit `60b2d82a25c6631aa250a0930d5127964dc34750` passed Acelynn QA run `33624538021` and 26-APK signing gate `33624537920`.\n- [ ] Phase 7 — Acelynn Pro production-cutover equivalence gate: verify the exact permanent-signed Direct APK exposes or embeds the certified recovery implementation and pass a synthetic legacy-signed → backup → uninstall → permanent-signed Direct → restore transition on a non-production Android environment. No real Acelynn uninstall is authorized until this gate passes and the user explicitly approves cutover.\n",
)

replace_once(
    audit,
    "| Acelynn Pro™ | B | Saved analysis snapshots are local under `acelynn-snapshots` with 12-record retention. | Recovery code/CI + deterministic settle are complete. Still require isolated legacy-export → restore/merge runtime proof before uninstall/cutover. |",
    "| Acelynn Pro™ | B | Saved analysis snapshots are local under `acelynn-snapshots` with 12-record retention. | Recovery code/CI, deterministic settle, service-worker retirement, and physical Z Fold recovery-engine QA are complete. Still require production-cutover equivalence: the exact permanent-signed Direct APK must have guaranteed access to the certified recovery implementation and pass a synthetic legacy-signature → uninstall → permanent-signature restore transition before any real uninstall. |",
)

replace_once(
    audit,
    "The current source still registers `sw.js`. Service-worker removal is intentionally not mixed into this recovery patch and remains a separate release-quality task.\n\n**Gate status:** code/CI + deterministic settle complete. Still blocked from uninstall/cutover until an isolated browser/Android legacy export → restore/merge round trip proves the expected snapshots survive.",
    "Service-worker retirement is now part of the certified recovery source at `6363059183cebe650830cc240d275936dc802d34`: stale Acelynn worker registrations and `acelynn-pro-*` caches are retired while localStorage snapshots and unrelated caches are preserved. Physical Android recovery-engine QA then passed on a Samsung Z Fold using the isolated `com.cactusbyte.acelynnpro.qa` package with those exact pinned assets. The test proved live microphone operation, backup survival across QA app-data clearing, clean-state restore, duplicate suppression, chronological post-restore saving, pre-import safety backup creation, and native rejection of a deliberately wrong-app backup. Foundation commit `60b2d82a25c6631aa250a0930d5127964dc34750` passed Acelynn QA run `33624538021` and the 26-APK signing gate `33624537920`.\n\nThe normal permanent Acelynn Direct/Play wrappers still load the production web URL rather than the QA-only pinned local recovery entry point. Therefore the physical QA result certifies the recovery engine and Android integration, but it does not by itself prove production-cutover equivalence.\n\n**Gate status:** recovery code/CI + deterministic settle + service-worker retirement + physical Z Fold recovery-engine QA complete. Still blocked from real uninstall/cutover until the exact permanent-signed Direct APK has guaranteed access to the certified recovery implementation and passes a synthetic legacy-signature → export → uninstall → permanent-signature → restore round trip on a non-production Android environment. Explicit user approval remains required after that gate passes.",
)

replace_once(
    runbook,
    "3. Verify the restored snapshot count/content and run one new live/file mix check.\n4. Do not treat service-worker cleanup as part of this recovery step; that behavior change is a separate release-quality batch.",
    "3. Verify the restored snapshot count/content and run one new live/file mix check.\n4. Confirm the exact permanent-signed Direct APK is using a recovery path that is equivalent to the certified recovery implementation. The QA-only pinned local package proves the recovery engine, but does not replace the production-cutover equivalence gate.\n5. Service-worker retirement is already part of the certified recovery source; do not reintroduce the old Acelynn worker during cutover.",
)

replace_once(
    runbook,
    "- [ ] Acelynn Pro snapshot export/import runtime round trip is proven before Acelynn Pro uninstall.",
    "- [ ] Acelynn Pro recovery-engine/device QA is proven **and** the exact permanent-signed Direct APK passes the production-cutover equivalence gate: guaranteed certified recovery access plus a synthetic legacy-signature → export → uninstall → permanent-signature → restore transition on a non-production Android environment.",
)

# Contract assertions: all three sources must tell the same truth.
abl_text = abl.read_text(encoding="utf-8")
audit_text = audit.read_text(encoding="utf-8")
runbook_text = runbook.read_text(encoding="utf-8")

required = [
    (abl_text, "production-cutover equivalence gate"),
    (audit_text, "production-cutover equivalence"),
    (runbook_text, "production-cutover equivalence gate"),
    (audit_text, "service-worker retirement + physical Z Fold recovery-engine QA complete"),
]
for text, needle in required:
    if needle not in text:
        raise SystemExit(f"missing reconciled contract text: {needle}")

stale = [
    "The current source still registers `sw.js`",
    "Do not treat service-worker cleanup as part of this recovery step",
    "Acelynn Pro: add validated snapshot import/restore",
]
for needle in stale:
    if needle in abl_text or needle in audit_text or needle in runbook_text:
        raise SystemExit(f"stale Acelynn cutover language remains: {needle}")

print("Acelynn production-cutover equivalence documentation reconciled.")
