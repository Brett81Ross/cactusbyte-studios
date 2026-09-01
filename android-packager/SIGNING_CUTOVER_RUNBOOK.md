# Cactus🌵Byte Studios™ Android Permanent-Signing Cutover Runbook

Status: **staged only — do not uninstall or replace any currently installed app until this runbook's pre-cutover gate is explicitly approved.**

## Why the cutover requires care

The August 31 `android-latest` APKs were `release` builds signed with the Android debug certificate. A release build is non-debuggable unless explicitly configured otherwise. The permanent Android v2 APKs use a different, permanent signing identity per brand.

Android accepts an in-place update only when the installed app and update use a compatible signing certificate. Because the legacy debug certificate and the new permanent certificate differ, the one-time transition requires uninstalling the legacy package before installing the permanent package. Uninstalling removes that package's private app/WebView data.

After this one-time transition, Direct and Play variants for the same brand share the same permanent signing identity, so the signing-key mismatch does not recur between those two distribution channels.

## Hard safety rules

1. **Never bulk-uninstall the 13 legacy apps.** Cut over one brand at a time.
2. **Do not uninstall any legacy app until its app-specific recovery/export check is complete.**
3. **Do not export or copy WebView cookies.** Re-authenticate after the permanent install instead.
4. **Do not weaken the normal release APK with `android:debuggable=true`.** Permanent releases must remain non-debuggable.
5. **Do not publish or deploy web changes as part of this Android signing cutover unless separately approved.**
6. Keep the August 31 legacy APK bundle and the permanent-signed QA artifact bundle as rollback/reference artifacts. A legacy APK cannot be installed over a permanent-signed package without another uninstall because the certificates differ.
7. Do not advance to the next app until launch, access, core action, back navigation, native share, and app-specific permissions pass on the current app.

## ADB storage helper limitation

`scripts/android_debug_to_permanent_migration.py` is a fallback diagnostic for an installed package that actually permits `adb shell run-as`.

The August 31 legacy APK source used the `release` build type with the debug signing config; it did **not** make the release build debuggable. Therefore the helper must not be treated as the primary migration path for the legacy release APKs. Run its `audit` command first if a device-side check is desired. A `BLOCKED` result is expected for a normal legacy release install and must not be bypassed by rooting the device or weakening Android security.

## Portfolio data policy for the cutover

### MachZero™ — preserve paid access first

MachZero stores a generated `machzero.installId` in browser local storage. That install ID participates in scan sessions, rate limiting, checkout/billing status, and other device-scoped server operations.

MachZero already includes an accountless recovery mechanism designed for replacement/reset devices:

1. Before uninstall, open MachZero billing/access controls.
2. If the install has a paid plan, CactusByte VIP entitlement, or unused paid scan-pack balance, create a **Recovery Key**.
3. Save the key privately outside the app. Do not put it in a public issue, repo, screenshot, or chat.
4. Record any customized MachZero settings that matter to the user; those local preferences are not the durable paid-access record.
5. After installing the permanent-signed MachZero APK, choose **Restore Access** and enter the recovery key.
6. Verify plan/access state and scan balance before deleting the recovery copy.

A new install ID after cutover is acceptable when paid access is restored through the recovery mechanism. We should not weaken the Android release solely to preserve the old install ID.

### Cactus🌵Byte Studios™ hub

Before uninstall:

- Verify the user knows the current CactusByte ID/authentication recovery path.
- Confirm owner/tester/lifetime entitlements are server-authoritative or otherwise recoverable.
- Do not rely on the current WebView cookie surviving uninstall.

After install:

- Re-authenticate if required.
- Verify owner-only surfaces and CactusByte ID restoration.
- Verify launch links for the portfolio before continuing to the next brand.

### Rapid Takeoff™ — claim legacy lifetime Pro before uninstall

Rapid Takeoff has a two-phase recovery requirement. A legacy lifetime-Pro cookie is not itself account-bound and will be erased by uninstall.

Before uninstall:

1. Confirm Rapid Takeoff currently reports lifetime Pro active on the legacy install.
2. Use **Protect Pro Access** from that same Rapid Takeoff WebView.
3. Sign in to the CactusByte ID that should permanently own the lifetime entitlement.
4. Complete the short-lived claim handoff back to Rapid Takeoff while the existing Pro cookie is still present.
5. Verify the claim succeeds and the CactusByte lifetime Rapid entitlement exists. Do **not** uninstall on a failed, expired, or unverified claim.

After the permanent-signed install:

1. Sign in to the same CactusByte ID.
2. Use **Restore Pro Access**.
3. Verify Rapid Takeoff reports lifetime Pro active from the freshly issued HttpOnly cookie.
4. Run the normal app smoke test before marking Rapid Takeoff complete.

The claim/restore bridge also requires the exact same server-only `RAPID_RECOVERY_BRIDGE_SECRET` in CactusByte and Rapid Takeoff. Configuration and deployment require separate explicit approval. Never copy the old Pro cookie, reuse a redeemed coupon, expose the bridge secret to browser code, or skip the pre-uninstall claim for a legacy cookie-only Pro install.

### Other wrappers

For every other brand, treat WebView cookies and app-private browser storage as disposable unless an app-specific audit proves otherwise. Before uninstall:

- Finish/export any unsaved quote, takeoff, report, draft, snapshot, route, lead, or session that matters.
- Confirm any paid access has a server-side recovery, login, coupon, or entitlement path.
- Record custom local-only settings if they cannot be recreated easily.

After the permanent install, re-login rather than migrating cookies.

## Pre-cutover gate

All of the following must be true before the first uninstall:

- [ ] Android v2 signing gate is green on the exact cutover commit.
- [ ] All 26 Direct/Play release APKs build successfully.
- [ ] All 26 APK signatures match the 13 permanent brand identities.
- [ ] Direct variants contain `REQUEST_INSTALL_PACKAGES`; Play variants do not.
- [ ] All 26 normal release APKs are proven non-debuggable from the compiled manifest.
- [ ] UA remains `CactusByteNative/1.0` until the separately approved UA cutover.
- [ ] Permanent keystores remain secret-backed and absent from Git.
- [ ] August 31 legacy APK artifact bundle is retained for reference.
- [ ] MachZero recovery-key path is verified before MachZero uninstall if durable paid access exists.
- [ ] CactusByte ID/owner restoration path is verified before hub uninstall.
- [ ] Rapid Takeoff legacy lifetime-Pro claim is verified before Rapid uninstall, and same-ID clean-install restore is proven after approved bridge-secret configuration.
- [ ] The user explicitly approves beginning the device cutover.

## One-brand cutover sequence

For each brand, one at a time:

1. Record the installed app name/package and current visible version.
2. Complete its recovery/export checklist above.
3. Force-close the legacy app.
4. Uninstall only that one legacy package.
5. Install the permanent-signed **Direct** APK for that same brand.
6. Launch and verify the correct production URL/brand loads.
7. Restore login/entitlement or recovery key when applicable.
8. Smoke test the app's primary action.
9. Test Android back navigation.
10. Test native share and QR flow where implemented.
11. Test any required camera, microphone, file, or location permission.
12. Verify no unexpected service-worker/cache regression is controlling the app.
13. Mark that brand complete only after its state/access is confirmed.
14. Continue to the next brand.

## Post-cutover rule

Once a brand is successfully moved to its permanent identity, every future Direct build for that brand must use that same permanent key. The corresponding Play variant must also retain that same brand identity. Key continuity becomes a release-blocking invariant.
