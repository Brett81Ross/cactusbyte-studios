# Fuel the Next Update — Cactus🌵Byte Studios™ Portfolio Standard

Status: Approved for staged implementation. This document does **not** authorize deployment, store publication, PR merge, or production payment activation.

## Scope

Add a voluntary **Fuel the Next Update** support feature to every current Cactus🌵Byte Studios app **except First Bearing™**.

Included current brands:
- Cactus🌵Byte Studios™ hub
- No Problem Pressure Washing Matrix™
- MachZero™
- Rapid Takeoff™
- Acelynn Pro™
- PocketStomp™
- GhostLane™
- Fantasy Football Matrix™
- Acelynn’s ScoutTrace™
- ShadowNex Prime™
- TerraFlow Matrix™
- OrbitGather™

Explicit exclusion:
- **First Bearing™** — do not add this feature now or by inheritance from shared components.

## Product intent

Fuel the Next Update is a voluntary way for users to financially support continued development of the app they are using.

It is **not**:
- a subscription;
- a Pro/lifetime entitlement;
- a required payment;
- a donation to a charity;
- a crowdfunding investment or security;
- a vote that guarantees a feature;
- a way to skip the roadmap or buy development priority;
- a replacement for an app’s normal paid plan, scan pack, coupon, or entitlement system.

A user who never contributes must retain exactly the access they would otherwise have.

## Standard user-facing copy

Primary CTA:

**Fuel the Next Update**

Supporting text:

> Like this app? You can help fund future Cactus🌵Byte development. Support is optional and does not unlock features or guarantee a specific update.

Post-purchase acknowledgement:

> Thanks for fueling future Cactus🌵Byte development. Your support does not change your plan or entitlements.

Do not use language such as “donate,” “invest,” “back this project,” “buy a vote,” or “guaranteed next feature.”

## Placement

Default placement is a compact card in **Settings / About / Support**, not an interruptive launch modal.

Secondary placement may appear near the footer only when it does not compete with the app’s primary workflow.

Requirements:
- never block launch;
- never show during an emergency/safety workflow;
- never interrupt a scan, estimate, route, analysis, checkout, report, or other primary action;
- never use countdowns, guilt language, fake scarcity, or repeated nagging;
- allow dismissal where the card is promoted outside Settings.

## App attribution

Every funding transaction must include the originating app identifier so CactusByte can measure which products users are choosing to support.

Suggested metadata:
- `purpose=fuel_next_update`
- `app_id=<canonical app id>`
- `app_version=<visible version>`
- `distribution=web|direct|play|ios`

Do not include sensitive user content, scans, location, photos, recovery information, reports, API keys, or lead/contact information in payment metadata.

## Payment routing

The visual feature stays consistent, but the payment implementation must be distribution-aware.

### Web and Android Direct

Use the centralized CactusByte commerce system / Stripe flow once the correct live CactusByte Stripe account is connected and the flow passes billing QA.

Do not wire production support payments to an unrelated app-specific or sandbox Stripe account.

### Google Play distribution

Use the payment mechanism required for the applicable Play distribution/region and current Google Play policy. Do not hard-code an external Stripe checkout into the Play build merely because it exists in Direct/web.

The `distribution` flavor already exists and must control this behavior.

### iOS distribution

Use Apple’s permitted in-app purchase/tipping mechanism for native App Store distribution. Do not assume the web/Direct Stripe path is valid inside the App Store build.

## Amounts

Recommended initial one-time support choices:
- $2
- $5
- $10
- optional custom amount only where the payment platform supports it cleanly and policy permits it

No recurring contribution by default. Recurring support requires a separate product decision and billing review.

## Entitlement isolation

Fuel purchases must never mutate:
- Pro/lifetime access;
- subscriptions;
- coupons;
- scan packs or credits;
- owner/tester access;
- feature flags;
- release priority.

Payment success records support only.

## Failure behavior

If checkout is unavailable or fails:
- keep the app fully usable;
- show a concise non-blocking error;
- do not retry-charge automatically;
- do not treat support-payment failure as an app health failure;
- do not alter existing paid entitlements.

## Accessibility and UX QA

Each implementation must verify:
- readable copy;
- 48px minimum touch target;
- keyboard/focus accessibility where applicable;
- Android phone layout;
- Samsung Z Fold cover layout;
- Samsung Z Fold open layout;
- iOS-sized layout;
- success/cancel/error paths;
- no accidental double-submit;
- no regression to native sharing, QR, primary workflow, or app startup.

## Release gate

Before production activation for any app:
1. confirm the canonical repo and exact release source;
2. confirm the correct distribution-specific payment provider;
3. test in sandbox/test mode;
4. verify support does not alter entitlements;
5. verify cancellation and failed payment paths;
6. verify app attribution metadata contains no sensitive information;
7. obtain explicit deployment approval under the existing CactusByte ABL process.

## Current infrastructure note — September 1, 2026

The Stripe connection currently exposed in the active tooling session is **GhostLane sandbox only**. It is not sufficient authority to create a live centralized CactusByte Fuel the Next Update checkout. Therefore production Stripe products/payment links must not be created from that account for this portfolio feature.

## Android signing migration interaction

This feature is independent of the permanent-signing cutover. It must not delay data-recovery work, and adding it does not make any app safe to uninstall.

The existing hard gate remains authoritative:

> NO UNINSTALL / NO CUTOVER for any brand until that brand’s recovery gate has passed on the exact source intended for release.

## First Bearing exception

First Bearing™ remains explicitly excluded. Shared components, portfolio scripts, registries, and future mass updates must preserve this exclusion unless the product owner explicitly reverses it.
