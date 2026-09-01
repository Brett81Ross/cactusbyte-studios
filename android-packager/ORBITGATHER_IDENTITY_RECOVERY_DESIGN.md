# OrbitGather™ Installation Identity Recovery Design

Status: **staged only — no Supabase schema change, Edge Function deployment, Vercel deployment, merge, APK install, or phone uninstall is authorized by this document.**

## Proven current-state risk

OrbitGather Cloud authenticates a device with two browser-local values:

- `orbitgather:cloud-installation-id`
- `orbitgather:cloud-installation-secret`

The live Supabase backend stores the secret only as SHA-256 and uses the installation UUID as the foreign-key owner for saved searches, scan runs, and opportunity metadata. Read-only audit on 2026-09-01 observed 52 installation rows, 1 saved search, 36 scan runs, and 171 opportunity rows. The production Edge Functions were `orbitgather-backend` SHA-256 `89364718bb2e0068d0cd4f70a9d9b0cdf42ede9aba57d25ab12b7115dbaacbde` and `orbitgather-meta` SHA-256 `c37fce21def5ee69074c9eab9e40f7f6367b268579f8c3a57b70d1a28a6e7473` at audit time.

Uninstalling the Android wrapper deletes both local values. The existing client also deletes them after `unauthorized_device` and silently registers a new installation, which can detach a reinstall from the old installation-scoped cloud records.

## Design decision: preserve the UUID; rotate only the secret

No row migration is needed. The existing installation UUID remains the owner of all existing cloud rows. The CactusByte account binding is stored in CactusByte's server-authoritative Firestore, not in OrbitGather's public Supabase schema. Therefore **no Supabase DDL/schema migration is required** for the recovery bridge.

A separate `orbitgather-recovery` Edge Function is staged instead of modifying the production lead-scanning functions. It has one narrow responsibility: validate the current installation during protection and rotate the existing `og_installations.secret_hash` during restore.

## Stage 1 — Protect Installation Identity before uninstall

1. The legacy OrbitGather install must still contain a valid installation UUID + secret.
2. User chooses **Protect Cloud Identity** in OrbitGather.
3. CactusByte ID authenticates the intended account and issues a random five-minute one-time `claim` token.
4. The browser returns to OrbitGather with that token.
5. OrbitGather sends its existing UUID + secret only to the OrbitGather recovery Edge Function.
6. The Edge Function validates the secret against `og_installations.secret_hash`.
7. The Edge Function HMAC-attests `{claim token, installation UUID}` to CactusByte using server-only `ORBITGATHER_RECOVERY_BRIDGE_SECRET`.
8. CactusByte atomically binds that installation UUID to the authenticated CactusByte UID, rejects ownership conflicts, consumes the claim token, and writes an audit event.

The legacy installation secret never goes to CactusByte and is never exported to a file.

## Stage 2 — Restore after clean install

1. User chooses **Restore Cloud Identity** and authenticates the same CactusByte ID.
2. CactusByte resolves the account's protected installation UUID and issues a random five-minute one-time `restore` token.
3. The clean OrbitGather app generates a new 32-byte random device secret locally.
4. OrbitGather sends the restore token + new secret to the recovery Edge Function.
5. The Edge Function HMAC-authenticates to CactusByte and acquires a short processing lease on that restore token. Concurrent reuse is rejected.
6. CactusByte returns the already-bound installation UUID and an operation ID.
7. The Edge Function hashes the new secret and updates **only** that existing `og_installations` row, preserving the UUID and every foreign-key relationship.
8. The Edge Function finalizes the restore lease with CactusByte.
9. Only after server success does the browser store the preserved UUID + new secret locally.
10. OrbitGather reloads cloud state from the original installation.

## Security invariants

- Random recovery tokens are stored only as SHA-256 in Firestore and expire after five minutes.
- Token purpose and app scope are explicit.
- Token issuance is per-UID rate limited.
- One installation UUID cannot be bound to two different CactusByte UIDs.
- Bridge calls use HMAC-SHA-256 and timing-safe verification with a shared server-only secret.
- Restore tokens use a short processing lease to prevent concurrent secret-rotation races.
- The new device secret is generated in OrbitGather and never stored in CactusByte.
- The old device secret is not copied to the new install.
- No opportunity, scan-run, saved-search, or project row is copied or re-parented.
- The existing production lead and metadata Edge Functions remain unchanged by this staged recovery source.
- `ORBITGATHER_RECOVERY_BRIDGE_SECRET` must never use a `NEXT_PUBLIC_` name.

## Already-uninstalled fallback

If an installation was protected before uninstall, normal CactusByte-ID restore works even after the old app is gone.

If the old app is already gone **and the installation was never protected**, the current system has no cryptographic account↔installation link. Email ownership alone is not sufficient to safely guess an installation UUID. Do not add an automatic email-only recovery path.

A future owner-assisted exception may be built only as an owner-authenticated, separately audited operation where support has manually established ownership and identified the exact installation UUID. That is not part of this automatic Phase 7 bridge.

## Runtime gate

Before OrbitGather uninstall/cutover can be authorized:

1. Recovery code/CI + deterministic settle must be green on the exact staged source.
2. The same long random `ORBITGATHER_RECOVERY_BRIDGE_SECRET` must be configured in CactusByte and the OrbitGather recovery Edge Function only after explicit deployment approval.
3. A real legacy install must successfully complete **Protect Cloud Identity** while its old UUID + secret still work.
4. An isolated clean install must complete **Restore Cloud Identity**, prove the UUID is unchanged and secret is rotated, and verify the pre-existing saved searches/opportunity metadata are reachable.
5. Standard OrbitGather smoke tests must pass.

Until all five pass: **NO UNINSTALL / NO CUTOVER.**
