from pathlib import Path

ABL=Path('ATOMIC_BUILD_LIST.md')
AUDIT=Path('android-packager/SIGNING_CUTOVER_DATA_AUDIT.md')
RUNBOOK=Path('android-packager/SIGNING_CUTOVER_RUNBOOK.md')

text=ABL.read_text(encoding='utf-8')
anchor='## GhostLane™ v1.7.4\n'
block=(
    '- [x] Pin GhostLane signing-cutover storage truth on canonical repo `Brett81Ross/ghostlane-app`: `ghostlane_ledger` is durable private intercept history capped at 50 records; `ghostlane_nodes` is a regeneratable camera-mesh cache and is excluded from migration.\n'
    '- [x] Preserve the intentional Supabase pause/two-project constraint. The signing-cutover recovery path has no Supabase dependency and does not unpause, mutate schema, or deploy functions.\n'
    '- [x] Stage opt-in encrypted ledger recovery on isolated branch `android-signing-cutover-data-recovery`: AES-256-GCM payload encryption, PBKDF2-SHA256 with 210,000 iterations, random salt/IV, minimum 10-character user passphrase, 5 MB/500-input safety limits, strict field reconstruction, current-device-first dedupe, 50-record retention, encrypted pre-import backup, and rollback.\n'
    '- [x] Keep passphrases client-only and ephemeral; never store or transmit them, never emit plaintext ledger backups, and allow the user to intentionally start fresh by skipping restore.\n'
    '- [x] Pass encrypted round-trip/wrong-passphrase/rollback/source/privacy/syntax/no-deployment QA in Actions run `33569797954`; generated recovery mount is pinned at `1ad46ad6df12e5843e8f76581a8ac472b7d2553f`.\n'
    '- [x] Prove deterministic settle in run `33569797954` attempt 2: generated head reran green and reported `Generated GhostLane recovery source already settled.` with no additional commit.\n'
    '- [ ] Complete isolated browser/Android encrypted export → restore/merge verification using representative ledger records, confirm the camera-node cache rebuilds independently, or explicitly choose a start-fresh cutover before uninstall authorization.\n'
)
if 'Generated GhostLane recovery source already settled.' not in text:
    if anchor not in text: raise SystemExit('Missing GhostLane ABL anchor')
    text=text.replace(anchor,anchor+block,1)
ABL.write_text(text,encoding='utf-8')

text=AUDIT.read_text(encoding='utf-8')
old='| GhostLane™ | B — privacy-sensitive | Local privacy/intercept ledger is durable state. Normal plaintext export is inappropriate. Supabase is intentionally paused under the two-project constraint. | Add protected/opt-in local migration or allow explicit start-fresh; do not require Supabase for this gate. |'
new='| GhostLane™ | B — privacy-sensitive | `ghostlane_ledger` is private durable intercept history (50 max); `ghostlane_nodes` is a regeneratable cache. Supabase remains intentionally paused. | Encrypted recovery code/CI + deterministic settle are complete. Still require isolated encrypted round trip or explicit start-fresh choice before uninstall/cutover. |'
if old in text:text=text.replace(old,new,1)
old_detail='''### GhostLane™\n\nThe privacy/intercept ledger is durable local state. Because GhostLane is privacy-sensitive, normal plaintext export of sensitive navigation/privacy records is not an acceptable default migration mechanism.\n\n**Gate status:** blocked until the user can either perform a protected/explicit local export+restore or intentionally choose to start fresh. Supabase remains intentionally paused and is not part of this cutover gate.\n'''
new_detail='''### GhostLane™\n\nCanonical source is `Brett81Ross/ghostlane-app`. Current GitHub `main` is `6c60ffaf43a981c30d4a2e1e793353877996b92c`; the latest verified Vercel production deployment is `dpl_5BZVwAY5cYQPaxqGGSbCyRygABpE` from production commit `0616baac5fd5e6972b6e759334a126717a5554c7`. The production→main delta does not change `app.js`, so the local-storage lineage is stable. The Android wrapper surface `/radar.html` embeds same-origin `/index.html?v=1.7.4`, so the staged recovery UI mounted in `index.html` is reachable from the wrapper.\n\nThe durable privacy state is `ghostlane_ledger`, capped at 50 intercept records containing time, hardware, and four-decimal coordinates. `ghostlane_nodes` is a regeneratable camera-mesh cache and is intentionally excluded. Supabase remains intentionally paused because of the two-project constraint; this recovery path neither depends on nor changes Supabase.\n\nIsolated branch `android-signing-cutover-data-recovery` adds opt-in encrypted migration only. Envelope schema `ghostlane-encrypted-backup-v1` encrypts payload schema `ghostlane-ledger-v1` using AES-256-GCM with a random 12-byte IV and PBKDF2-SHA256 (210,000 iterations) with a random 16-byte salt. The user supplies a minimum 10-character passphrase that is never stored or transmitted. Recovery enforces 5 MB/500-input limits, strict record reconstruction, current-device-first dedupe, 50-record retention, encrypted pre-import backup, and localStorage rollback. Starting fresh remains an explicit valid choice.\n\nActions run `33569797954` passed encrypted round-trip, wrong-passphrase rejection, ciphertext privacy assertions, input/retention limits, prototype stripping, rollback, source/syntax checks, and explicit no-Vercel/no-Supabase-change guards. Attempt 1 generated only the `index.html` script mount at `1ad46ad6df12e5843e8f76581a8ac472b7d2553f`. Attempt 2 checked out that generated head, printed `index.html: already deterministic`, reran all QA green, and reported `Generated GhostLane recovery source already settled.`\n\n**Gate status:** code/CI + deterministic settle complete. Still blocked from uninstall/cutover until an isolated encrypted export → restore/merge round trip is verified on the intended wrapper, or the user explicitly chooses to start fresh. Supabase stays paused and is not a cutover dependency.\n'''
if old_detail in text:text=text.replace(old_detail,new_detail,1)
AUDIT.write_text(text,encoding='utf-8')

text=RUNBOOK.read_text(encoding='utf-8')
if '### GhostLane™ — encrypted private-ledger choice' not in text:
    anchor='### Other wrappers\n'
    block='''### GhostLane™ — encrypted private-ledger choice\n\nGhostLane is privacy-sensitive. Its intercept ledger can contain location/time history and must not be copied in plaintext. The camera-node cache is regeneratable and should start fresh. Supabase remains intentionally paused and is not required for this recovery.\n\nBefore uninstall, choose one path:\n\n**Preserve ledger**\n1. Open the Ledger tab and select **Private Backup**.\n2. Enter a recovery passphrase of at least 10 characters and export the encrypted ledger file.\n3. Keep the passphrase separate from the backup file; GhostLane does not store or transmit it.\n4. Do not uninstall until the isolated encrypted round-trip gate has already passed.\n\n**Start fresh**\n1. Explicitly choose not to preserve the ledger.\n2. Accept that intercept history is intentionally discarded.\n3. The camera-node mesh/cache will rebuild independently; do not migrate `ghostlane_nodes`.\n\nAfter a clean install when preserving:\n1. Open **Private Backup → Restore / Merge Encrypted Ledger**.\n2. Select the encrypted JSON and enter the same passphrase.\n3. Verify GhostLane creates an encrypted pre-import backup before changing local storage.\n4. Confirm representative ledger records and the 50-record retention cap.\n5. Confirm radar/camera data can rebuild without relying on migrated node-cache data or an unpaused Supabase project.\n\n'''
    if anchor not in text: raise SystemExit('Missing runbook Other wrappers anchor')
    text=text.replace(anchor,block+anchor,1)
if '- [ ] GhostLane encrypted ledger round trip or explicit start-fresh choice is completed before GhostLane uninstall.' not in text:
    anchor='- [ ] ScoutTrace history export/import runtime round trip is proven before ScoutTrace uninstall, and its intended v1.2.x/service-worker release truth is reconciled.\n'
    addition=anchor+'- [ ] GhostLane encrypted ledger round trip or explicit start-fresh choice is completed before GhostLane uninstall; Supabase remains intentionally paused and outside this gate.\n'
    if anchor not in text: raise SystemExit('Missing ScoutTrace pre-cutover anchor')
    text=text.replace(anchor,addition,1)
RUNBOOK.write_text(text,encoding='utf-8')
print('GhostLane Phase 7 central records patched deterministically.')
