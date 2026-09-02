# OrbitGather™ Installation Identity Recovery Design

Status: **staged only — no Supabase schema change, Edge Function deployment, Vercel deployment, merge into `android-release-v2-foundation`, APK install, or phone uninstall is authorized by this document.**

## Proven current-state risk
OrbitGather Cloud authenticates a device with `orbitgather:cloud-installation-id` and `orbitgather:cloud-installation-secret`. Uninstalling the Android wrapper deletes both local values, while cloud records remain installation-UUID scoped. Recovery therefore preserves the UUID and rotates only the secret.

## Shared CactusByte recovery schema
The authority uses one ecosystem-scale schema instead of app-specific Firestore roots:
- `profiles/{uid}/installations/{appId__installationId}` — user-visible installation metadata and status.
- `installationOwners/{appId__installationId}` — server-authoritative uniqueness/ownership record.
- `identityRecoveryTokens/{sha256(token)}` — short-lived one-time recovery leases.
- `identityRecoveryRate/{appId__uid}` — issuance rate limiting.
- `identityRecoveryEvents/{eventId}` — server-only audit trail.

The `appId` field scopes every binding/token/event, allowing future CactusByte apps to reuse the same model without creating per-app collection families. Client writes are not required; recovery authority uses Firebase Admin on the server.

## Protect before uninstall
1. Legacy OrbitGather retains a valid UUID + secret.
2. User chooses **Protect Cloud Identity**.
3. CactusByte ID authenticates the intended account and issues a five-minute one-time `claim` token.
4. OrbitGather validates its current secret in the recovery Edge Function.
5. The Edge Function HMAC-attests token + UUID to CactusByte.
6. CactusByte atomically binds that UUID under the signed-in profile, enforces global ownership, consumes the token, and writes an audit event.

## Restore after clean install
1. User authenticates the same CactusByte ID.
2. CactusByte lists every active protected OrbitGather installation under that account.
3. If more than one exists, the user must choose the exact installation to recover; there is no implicit `primaryInstallationId` fallback.
4. CactusByte issues a five-minute restore token scoped to that chosen UUID.
5. The clean OrbitGather app generates a new random device secret locally.
6. The recovery Edge Function HMAC-authenticates to CactusByte and acquires a short processing lease.
7. CactusByte returns the selected existing UUID + operation ID.
8. The Edge Function rotates only `og_installations.secret_hash` for that UUID.
9. Finalization is idempotent; only after server success does the browser store the preserved UUID + new secret.

## Linked Devices and revocation
The hub exposes **Linked Devices** for the signed-in CactusByte ID. Users can see app, installation UUID, label, last-seen/restore metadata, and active/revoked status. Revocation invalidates the CactusByte recovery binding but does not delete app data or the app's current cloud secret. A revoked installation cannot obtain a restore lease unless it is legitimately protected again from a currently authorized legacy installation.

## Security invariants
- Recovery tokens are random, stored only as SHA-256, and expire after five minutes.
- Token purpose and `appId` scope are explicit.
- Issuance is per-account/per-app rate limited.
- One active `{appId, installationId}` cannot belong to two CactusByte IDs.
- Bridge calls use HMAC-SHA-256 with timing-safe verification.
- Restore processing leases prevent concurrent secret-rotation races.
- Same-operation retry is idempotent; consumed-token completion can be acknowledged safely.
- The new device secret is generated in OrbitGather and never stored in CactusByte.
- No cloud rows are copied or re-parented.
- Revocation blocks future recovery but does not silently delete remote data.
- `ORBITGATHER_RECOVERY_BRIDGE_SECRET` is server-only and must never use a `NEXT_PUBLIC_` prefix.

## Runtime gate
Before OrbitGather uninstall/cutover can be authorized:
1. Authority integration QA and the deterministic OrbitGather settle run are green on exact staged sources.
2. The same long random bridge secret is configured in CactusByte and OrbitGather recovery Edge Function only after explicit deployment approval.
3. A real legacy install successfully completes protection and appears in Linked Devices.
4. A clean install restores the selected UUID, rotates the secret, and reloads pre-existing records.
5. Network retry, token expiry, cross-account rejection, multi-install selection, and revocation all pass device QA.
6. Standard OrbitGather smoke tests pass.

Until all six pass: **NO UNINSTALL / NO CUTOVER.**
