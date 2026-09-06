# Acelynn Pro™ Permanent-Signing Transition Evidence

Status: **technical transition gate proven in non-production Android QA. This record does not authorize a physical-device uninstall or cutover.**

## Proven transition

GitHub Actions run `33869737869` (`Acelynn Synthetic Transition (Manual)`) completed successfully on September 4, 2026 from branch `phase7-acelynn-synthetic-transition`, commit `de8c0750af257d305020cf0f372273ee00b87dea`.

The run used a literal historical Acelynn APK from the August 31 distribution plus the certified permanent-signed Acelynn Direct APK. It did not substitute a newly rebuilt legacy APK for the installed-side signer boundary.

### Historical legacy input

- Legacy source baseline: `69600ed3561aacb7d415ee0dd4cbec43abf0e477`
- Literal distributed APK: `Acelynn-Pro.apk`
- APK SHA-256: `a34ce06b7197e078095a5328f7107adafa9616b29aaa5a8bb9bf5a93e4d0d7c5`
- Signer DN: `C=US, O=Android, CN=Android Debug`
- Signer certificate SHA-256: `F62B0F713281125F32CC5053A624E17C0BE4ACCE5C799B86FD03683153BB5FDE`

### Permanent input

- Certified Android foundation: `c2ea2bd182956b1202f33e499cb54019b358a272`
- Certified signing run: `33639746045`
- Certified signed-APK artifact ID consumed by the transition test: `9850425582`
- Artifact name: `cactusbyte-brand-distribution-signed-apks`
- Artifact ZIP SHA-256: `46bae462252c786cc9221bcf0bce012e4a7c87e8bd46f587511f11fbcf314dad`
- Artifact retention expiration recorded by GitHub: September 9, 2026
- **Exact cutover APK path inside the artifact:** `acelynnproDirect/release/app-acelynnpro-direct-release.apk`
- Permanent Acelynn Direct signer DN: `CN=CactusByte Studios, OU=acelynnpro, O=CactusByte Studios, C=US`
- Permanent signer certificate SHA-256: `FA956BB761F59AAD38FAEF4F4F561FBF8EB05C1A7CB6DD0E30C12D52CC153230`

Both APK signatures verified using Android APK Signature Scheme v2 and the certificates were confirmed to be different.

**Cutover authority rule:** use the exact certified Direct APK above for the first real-device Acelynn signing cutover. Do not silently substitute a newer Acelynn APK or a different artifact merely because it also carries the permanent signer. Any substitute must first be proven equivalent to this certified package/recovery path and signer before it can become cutover authority.

## Real recovery-flow proof

The API 36 emulator test used an external UiAutomator harness and generated four deterministic WAV files to create distinct real Acelynn snapshots:

| Fixture | Frequency | SHA-256 |
| --- | ---: | --- |
| `01-sub.wav` | 45 Hz | `b28dac7c25b6b9ffc6057f476e28decc4fef700ab0dc9fb1dc803647dd29ada9` |
| `02-bass.wav` | 120 Hz | `a50657605421b7ee06ca29d04fb7c11f997f593b12b9ef0d60fad62bf6b462f6` |
| `03-mids.wav` | 1000 Hz | `69e648b9e816d5d706c8b98efc7129787eac174007f71de5be2ce9187e57b416` |
| `04-presence.wav` | 4000 Hz | `d8a2bd2faf69c85dd712e80fe64068c015c11d50d3b23a53c42f45d390235327` |

The successful transition proved all of the following:

1. The literal legacy APK installed and produced four saved snapshots through the real user flow.
2. The legacy app exported `/sdcard/Download/acelynn-session-report.json`.
3. The exported backup contained four retained snapshots in exact `Sub → Bass → Mids → Presence` insertion order.
4. The legacy package was uninstalled only inside the disposable emulator.
5. The exported backup survived the uninstall boundary outside app-private storage.
6. The certified permanent-signed Acelynn Direct APK installed successfully.
7. The permanent install restored the four snapshots successfully.
8. The workflow finished with `ACELYNN MULTI-SNAPSHOT TRANSITION GATE GREEN.`

## Evidence artifact

- Transition evidence artifact: `acelynn-multisnapshot-transition-evidence`
- Artifact ID: `9935674326`
- Artifact SHA-256: `303166515938eb686b9dde017103a7d8688b0855b0a8a9d7d22787e116852dec`
- Retention expiration recorded by GitHub: September 18, 2026

The artifact contains transition diagnostics, fixture manifest, legacy and permanent signature reports, and APK badging evidence.

## Superseded duplicate emulator workflow

The later workflow `Acelynn Pro Phase 8 Emulator Gate v2` / run `34041321737` was a redundant harness, not the cutover authority. Its historical red result came after the authoritative transition had already passed and does not invalidate run `33869737869`. That redundant workflow has now been retired to manual-only explanatory status so it cannot keep generating misleading automatic red checks.

Future engineers and QA must use run `33869737869`, this evidence record, artifact `9935674326`, and certified signed artifact `9850425582` as the Acelynn transition authority unless a later gate explicitly supersedes them with equal or stronger evidence.

## Safety boundary

This proof removes Acelynn Pro's technical blocker for the signing-certificate transition. It does **not** authorize the physical Samsung Z Fold cutover. Before a real uninstall, the user must still explicitly approve beginning the device cutover and must export the current real Acelynn backup to storage outside the app. The one-brand-at-a-time runbook remains controlling authority.

No Vercel deployment, preview deployment, Supabase change, Google Play publication, `main` merge, or physical-device uninstall was performed by this proof.
