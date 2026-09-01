from pathlib import Path

FILES = {
    "abl": Path("ATOMIC_BUILD_LIST.md"),
    "audit": Path("android-packager/SIGNING_CUTOVER_DATA_AUDIT.md"),
    "runbook": Path("android-packager/SIGNING_CUTOVER_RUNBOOK.md"),
}


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    if old not in text:
        raise SystemExit(f"Missing expected anchor: {label}")
    return text.replace(old, new, 1)


# Atomic Build List
path = FILES["abl"]
text = path.read_text(encoding="utf-8")
old = """## Rapid Takeoff™ v0.2.0

- [ ] Audit blueprint upload, analysis, estimate output, print/PDF, and mobile layout
- [ ] Expand trade coverage only after validating the current takeoff path
"""
new = """## Rapid Takeoff™ v0.3.0

- [x] Pin canonical production to Vercel project `blueprint-estimator`, repo `Brett81Ross/blueprint_estimator-`, production release commit `e1122d785b116ba6b571d43a5ba2fd1efa106a40`, and current staged `main` lineage.
- [x] Audit lifetime-Pro authority and prove that historical single-use coupon redemption is not account-bound; the 10-year HttpOnly `rapid_takeoff_pro` cookie cannot by itself survive an Android uninstall.
- [x] Stage the two-phase recovery bridge: **Protect Pro Access** claims the still-valid legacy cookie into a verified CactusByte ID lifetime entitlement before uninstall; **Restore Pro Access** consumes a short-lived account-authorized restore token after clean install and issues a fresh HttpOnly cookie.
- [x] Enforce recovery security: authenticated CactusByte ID issuance, app/purpose-scoped 5-minute random one-time tokens, per-ID throttling, SHA-256 token storage, HMAC legacy-cookie claim attestation, timing-safe comparison, lifetime-only entitlement checks, and claim/restore audit events.
- [x] Pass Rapid Takeoff source-contract QA and Next.js production build in Actions run `33559959159`; attempt 3 checked out exact staged head `8436145666e97436da973ad45e8a86e7e5b74e5d` and reported `Generated Rapid Takeoff Pro recovery UI already settled.`
- [x] Pass CactusByte recovery-authority QA, existing 185 core + 37 owner/billing checks, owner/auth regressions, full Next.js production build, and no-deployment guard in Actions run `33560234902` attempt 2 against exact authority head `362c89a401acc3523b0ce9743771a5c55bbc764e`.
- [x] Document the server-only `RAPID_RECOVERY_BRIDGE_SECRET` requirement in both repos; the exact same long random value must be configured in both projects before an approved deployment, and it must never use a `NEXT_PUBLIC_` name.
- [ ] Before any Rapid Takeoff uninstall, deploy/configure only with explicit approval, then complete a real legacy-device **Protect Pro Access** claim while the old Pro cookie still exists and verify the CactusByte lifetime entitlement was created.
- [ ] On an isolated clean install, sign into the same CactusByte ID, run **Restore Pro Access**, verify a fresh Pro cookie/access state, and complete the normal Rapid Takeoff smoke test before authorizing device cutover.
- [ ] Upgrade the existing Next.js `14.2.4` dependency to a currently patched supported release before the next production deployment; keep that framework/security update separate from the signing-recovery bridge.
- [ ] Audit blueprint upload, analysis, estimate output, print/PDF, and mobile layout
- [ ] Expand trade coverage only after validating the current takeoff path
"""
text = replace_once(text, old, new, "ABL Rapid section")
old_phase = "- [ ] Phase 7 — Rapid Takeoff: add clean-install lifetime-Pro recovery independent of the device cookie/single-use coupon."
new_phase = """- [x] Phase 7 — Rapid Takeoff code/CI + settle gate: two-phase legacy-cookie claim + CactusByte ID restore bridge is staged; Rapid run `33559959159` attempt 3 and CactusByte authority run `33560234902` attempt 2 are green on the exact staged heads.
- [ ] Phase 7 — Rapid Takeoff runtime/config gate: configure the shared server-only bridge secret only with deployment approval, successfully claim existing legacy Pro before uninstall, then prove same-ID clean-install restore and smoke test. No uninstall is authorized before both runtime halves pass."""
text = replace_once(text, old_phase, new_phase, "ABL Rapid Phase 7 line")
path.write_text(text, encoding="utf-8")

# Data/access audit
path = FILES["audit"]
text = path.read_text(encoding="utf-8")
old_row = "| Rapid Takeoff™ | C data + access blocker | Blueprint/report work is transient/output-oriented, but lifetime Pro is represented by a long-lived HttpOnly device cookie after single-use coupon redemption. | Add account/recovery bridge for lifetime Pro and prove clean-install restoration before uninstall. |"
new_row = "| Rapid Takeoff™ | C data + account-recovery gate | Blueprint/report work is transient/output-oriented. Legacy lifetime Pro lives in a 10-year HttpOnly cookie, while historical coupon redemption did not bind that grant to a CactusByte ID. | Recovery code/CI + deterministic settle are complete. Before uninstall, current legacy Pro must be claimed into the intended CactusByte ID while the old cookie still exists; then same-ID clean-install restore must be proven after bridge-secret configuration on an approved deployment. |"
text = replace_once(text, old_row, new_row, "audit Rapid table row")
old_detail = """### Rapid Takeoff™

Current takeoff inputs/results are not durable project storage; outputs can be printed/downloaded/shared. The cutover blocker is access: lifetime Pro is granted using a long-lived HttpOnly cookie after single-use coupon redemption. Uninstall erases that cookie while the original single-use coupon cannot be assumed reusable.

**Gate status:** blocked until lifetime Pro is restorable through CactusByte ID, a server entitlement, or a purpose-built recovery credential.
"""
new_detail = """### Rapid Takeoff™

Current takeoff inputs/results are not durable project storage; outputs can be printed/downloaded/shared. The cutover blocker is lifetime access. Rapid Takeoff currently validates the server-signed, 10-year HttpOnly `rapid_takeoff_pro` cookie. Android uninstall removes that WebView cookie. The original single-use coupon cannot safely be reused.

Authority audit found an additional constraint: the historical Rapid coupon record proves only that a hashed coupon was redeemed and that its short-lived app token was consumed; it does **not** record which CactusByte ID owned that legacy Pro grant. Therefore a clean install cannot safely infer ownership from historical coupon data alone.

A two-phase account bridge is now staged. Before uninstall, **Protect Pro Access** sends the user through CactusByte ID authentication, obtains a short-lived one-time `claim` challenge, returns to the same Rapid Takeoff WebView, verifies the existing Pro cookie, and sends a server-only HMAC attestation to CactusByte. CactusByte then atomically consumes the challenge, creates `entitlements/{uid}__rapid-takeoff` as explicit lifetime access with source `legacy_cookie_claim`, and writes an audit event. No cookie or coupon is exported.

After clean install, **Restore Pro Access** authenticates the CactusByte ID, requires an active lifetime Rapid entitlement (or active lifetime tester pass), issues a short-lived one-time `restore` token, and lets Rapid Takeoff consume that server authority before minting a fresh secure HttpOnly lifetime cookie. Recovery tokens are random, purpose/app scoped, five-minute, SHA-256 stored, per-ID throttled, single-use, and audited. Legacy claim attestation uses server-only `RAPID_RECOVERY_BRIDGE_SECRET` with timing-safe comparison.

Rapid Takeoff recovery source is staged on `Brett81Ross/blueprint_estimator-:android-signing-cutover-pro-recovery`. Actions run `33559959159` attempt 3 checked out exact staged head `8436145666e97436da973ad45e8a86e7e5b74e5d`, passed source-contract QA and the Next.js production build, preserved Git deployment-disable policy, and reported `Generated Rapid Takeoff Pro recovery UI already settled.`

The CactusByte authority half is staged on `Brett81Ross/cactusbyte-studios:rapid-takeoff-pro-recovery-authority`. Actions run `33560234902` attempt 2 checked out exact authority head `362c89a401acc3523b0ce9743771a5c55bbc764e` and passed recovery security QA, 185 core checks, 37 owner/billing checks, owner-authority/auth-persistence regressions, full production build, and the no-deployment guard.

The shared bridge secret is documented only as a placeholder in both `.env.example` files. No real secret has been generated or configured in live Vercel environments. The exact same long random server-only value must be configured in both projects as `RAPID_RECOVERY_BRIDGE_SECRET` before any approved runtime test/deployment.

CI also surfaced an existing Rapid Takeoff dependency warning: Next.js `14.2.4` is flagged as vulnerable by npm. That framework upgrade is a separate release-quality blocker and must be remediated before the next production deployment rather than mixed into this recovery patch.

**Gate status:** code/CI + deterministic settle complete. Still blocked from uninstall/cutover until an approved deployment/configuration provides the shared server-only bridge secret, the legacy install successfully completes **Protect Pro Access** while its old Pro cookie still exists, and an isolated clean install proves same-CactusByte-ID **Restore Pro Access** plus the normal app smoke test.
"""
text = replace_once(text, old_detail, new_detail, "audit Rapid detail")
path.write_text(text, encoding="utf-8")

# Runbook
path = FILES["runbook"]
text = path.read_text(encoding="utf-8")
anchor = """After install:

- Re-authenticate if required.
- Verify owner-only surfaces and CactusByte ID restoration.
- Verify launch links for the portfolio before continuing to the next brand.

### Other wrappers
"""
insert = """After install:

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
"""
text = replace_once(text, anchor, insert, "runbook Rapid section insertion")
old_gate = "- [ ] CactusByte ID/owner restoration path is verified before hub uninstall."
new_gate = """- [ ] CactusByte ID/owner restoration path is verified before hub uninstall.
- [ ] Rapid Takeoff legacy lifetime-Pro claim is verified before Rapid uninstall, and same-ID clean-install restore is proven after approved bridge-secret configuration."""
text = replace_once(text, old_gate, new_gate, "runbook Rapid pre-cutover gate")
path.write_text(text, encoding="utf-8")

print("Rapid Takeoff Phase 7 central records patched deterministically.")
