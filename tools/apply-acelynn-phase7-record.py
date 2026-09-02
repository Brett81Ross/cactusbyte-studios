from pathlib import Path

path=Path('ATOMIC_BUILD_LIST.md')
text=path.read_text(encoding='utf-8')
old='- [ ] Complete an isolated browser/Android legacy export → restore/merge round trip and verify all expected snapshots before authorizing uninstall/cutover.'
new='''- [x] Harden Acelynn Pro recovery chronology on canonical branch `android-signing-cutover-data-recovery`: commit `591ae98737a30d7682c1ed70490b8202f0861390` keeps the newest 12 snapshots in oldest→newest storage order so the next normal save evicts the oldest recovered snapshot instead of the newest.\n- [x] Pass real Chromium clean-install legacy restore/merge QA, automatic pre-import safety backup, invalid-backup preservation, 48px mobile recovery target, and deterministic settle; canonical browser recovery remained green and the no-service-worker canonical browser gate passed in Actions run `33579219696`.\n- [x] Remove the Acelynn Pro service worker before cutover in canonical recovery commit `6363059183cebe650830cc240d275936dc802d34`; prove stale worker registration and `acelynn-pro-*` caches are retired while localStorage snapshots and unrelated caches remain intact. Canonical source/recovery QA passed in Actions run `33579219674`, and the isolated no-service-worker deterministic settle passed run `33579130485`.\n- [ ] Complete the physical Android legacy export → clean-install restore/merge round trip on the intended Acelynn Pro release source and verify every expected snapshot before authorizing uninstall or permanent-signing cutover.'''
if new in text:
    print('Acelynn Phase 7 recovery record already settled.')
elif old in text:
    path.write_text(text.replace(old,new,1),encoding='utf-8')
    print('Acelynn Phase 7 recovery record patched deterministically.')
else:
    raise SystemExit('Expected Acelynn Phase 7 pending runtime gate was not found.')
