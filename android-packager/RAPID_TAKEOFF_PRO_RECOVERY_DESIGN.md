# Rapid Takeoff™ lifetime-Pro recovery bridge

Status: staged only. This design does not authorize deployment, merge, uninstall, APK publication, or signing cutover.

## Problem

Rapid Takeoff currently treats the `rapid_takeoff_pro` HttpOnly cookie as the local lifetime-Pro credential. Android uninstall removes the wrapper's WebView cookies. The original single-use coupon cannot be reused, and the historical coupon redemption record does not identify which CactusByte ID owned the redeemed Pro grant.

## Required two-phase bridge

### Phase A — claim current Pro before uninstall

1. User still has a valid Rapid Takeoff Pro cookie on the legacy install.
2. User signs in to the same CactusByte ID they want to own the entitlement.
3. CactusByte issues a short-lived, one-time Rapid Takeoff `claim` challenge tied to that CactusByte ID.
4. Rapid Takeoff receives the challenge while the existing Pro cookie is present.
5. Rapid Takeoff verifies the Pro cookie locally, then produces a server HMAC attestation using `RAPID_RECOVERY_BRIDGE_SECRET`.
6. CactusByte verifies both the one-time challenge and the HMAC attestation, then writes a lifetime entitlement at `entitlements/{uid}__rapid-takeoff` and an audit event.
7. The challenge is consumed atomically.

This step converts otherwise device-only legacy Pro ownership into account-backed ownership without reusing the coupon.

### Phase B — restore after clean install

1. User signs in to CactusByte ID after reinstall.
2. CactusByte verifies an active lifetime Rapid Takeoff entitlement.
3. CactusByte issues a short-lived, one-time `restore` token.
4. Rapid Takeoff consumes that token with CactusByte.
5. Rapid Takeoff issues a fresh HttpOnly `rapid_takeoff_pro` cookie.
6. CactusByte records the restore event.

## Security boundaries

- Never accept the old coupon as proof of ownership after it has been redeemed.
- Never export or copy the HttpOnly Pro cookie.
- Claim requires both a currently valid Pro cookie and an authenticated CactusByte ID challenge.
- Claim confirmation additionally requires a server-only HMAC attestation from Rapid Takeoff.
- Restore tokens are random, single-use, short-lived, app-scoped, purpose-scoped, and rate-limited per CactusByte ID.
- Recovery events are audit logged without storing the raw recovery token or cookie.
- The shared `RAPID_RECOVERY_BRIDGE_SECRET` must be configured server-side in both Vercel projects before any deployment. It must never be exposed to browser code.
- Only lifetime entitlements may mint the 10-year lifetime Pro cookie. Subscription entitlements must not be converted into lifetime access.

## Legacy-user cutover gate

A Rapid Takeoff install that currently relies only on the legacy cookie is **not cutover-ready** until the Phase A account-claim round trip succeeds. Once the entitlement exists, Phase B clean-install restore must also pass before uninstall is authorized.
