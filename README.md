# Cactus🌵Byte Studios™

Cactus🌵Byte Studios™ is the mobile-first command center for the CactusByte app ecosystem.

## Version

**1.4.0**

## Current foundation

- CactusByte App Registry™ with verified live links and repository-backed project records
- Concrete version records across the current portfolio, including repository-backed sync sources for release tracking
- CactusByte ID™ with Firebase Authentication and Firestore-backed profile roles
- Server-managed entitlement ledger readable by the signed-in CactusByte ID™ while client entitlement writes remain blocked
- Entitlement-aware CactusByte Storefront™ that shows **Pro Active** for paid apps and requires sign-in before linked upgrades
- Stripe Payment Links remain the live checkout surfaces; normal Storefront upgrade clicks are intercepted by a secure bridge and routed through an authenticated server launcher
- The checkout launcher verifies the Firebase ID token and replaces raw user attribution with an HMAC-signed CactusByte user/app reference before opening Stripe
- The Stripe webhook validates both Stripe's webhook signature and the CactusByte checkout reference before any entitlement can be provisioned
- Stripe Customer Portal route for linked subscribers to update payment methods, view invoices and cancel at period end
- Trusted owner-device flow that can silently restore the owner CactusByte ID after one private device-enrollment step
- Owner-only CactusByte User Monitor™ with Firebase registered-user counts, Pro-user counts and recent CactusByte sign-in activity
- Persistent Feedback Hub™, Idea Forge™ voting, Community Chat™ and ByteLink™ queue
- Portfolio-wide Community Chat channels for the current CactusByte app registry
- My CactusByte™ personalization with accent color, grid/list layouts, compact mode, pin/hide, category filtering and app reordering
- Native share support with app-branded QR sharing
- Install control with Android and iPhone/iPad fallback instructions while service workers remain disabled
- CactusByte Pulse™ ecosystem health dashboard and Release Center™
- Mobile-first Android and iOS-friendly UI
- TerraFlow Matrix™ v1.13.1 and OrbitGather™ v0.3.1 included as repository-backed records until their production links are verified

## User sign-in and owner mode

Normal users are not blocked by a sign-in wall at launch. The first screen remains the CactusByte command center and the **Sign In** button is available in the top header. CactusByte ID™ is required when a user needs cloud features such as persistent feedback, community tools or linked Pro access.

The studio owner can use `/owner-device` once on a trusted device. After the private setup code is accepted, the server stores a long-lived HttpOnly, SameSite=Strict signed owner credential. On future launches, `/api/owner/session` can mint a Firebase custom token for the configured owner profile and CactusByte silently restores the owner session without asking for the password again. Rotating `OWNER_DEVICE_SIGNING_SECRET` revokes previously trusted devices.

## Owner-only user monitoring

Successful email/password logins, new-account registrations and trusted-owner automatic restores are recorded through `/api/auth/track` only after Firebase ID-token verification. Raw `authEvents` records are denied to Firestore clients. `/api/owner/stats` is protected by either the trusted owner-device cookie or a Firestore profile with role `owner` and returns only owner-facing summary data: total Firebase users, new users in the last seven days, sign-ins in the last 24 hours/seven days, active Pro users/plans and recent sign-in entries. The global Account Dock only exposes **Owner Stats** after owner access is verified.

## Stripe entitlement provisioning and subscription management

The storefront can read entitlement records and suppress duplicate upgrade prompts for entitled users. `/api/stripe/checkout-link` verifies the signed-in Firebase ID token, creates a server-signed `client_reference_id` bound to both the CactusByte user and selected app, and opens the existing Stripe Payment Link. `/api/stripe/webhook` validates Stripe signatures, rejects unsigned or app-mismatched checkout references, and handles completed Checkout sessions plus subscription update/delete lifecycle events. It writes entitlements only through Firebase Admin on the server.

`/api/stripe/portal` verifies the signed-in CactusByte ID, resolves the Stripe customer from the server-managed entitlement record and opens Stripe Customer Portal. If `STRIPE_PORTAL_CONFIGURATION_ID` is not configured, CactusByte reuses an existing active CactusByte portal configuration or creates a restricted configuration that enables payment-method updates, invoice history, customer email updates and cancel-at-period-end.

Before production activation, configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CHECKOUT_SIGNING_SECRET`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`, `FIREBASE_ADMIN_PROJECT_ID`, `OWNER_DEVICE_SETUP_SECRET`, `OWNER_DEVICE_SIGNING_SECRET`, and optionally `OWNER_FIREBASE_UID` / `STRIPE_PORTAL_CONFIGURATION_ID` in the production environment. These values are intentionally not stored in GitHub.

## Atomic QA

Run `npm run qa` for release checks or `npm run preflight` for QA plus the full Next.js production build. The main preflight verifies version consistency, app-registry integrity, live launch URLs, local logo assets, Stripe checkout records, Firebase environment-key hygiene, `.env` protection, the no-service-worker rule, entitlement client-write protection, server-only Stripe/Firebase Admin configuration, authenticated checkout launching, HMAC checkout-reference verification, subscription lifecycle handling and entitlement-aware Storefront behavior.

A second owner/billing preflight verifies the trusted-device cookie protections, silent custom-token owner restoration, auth-event server verification, client denial for raw auth events, Firebase user counting, Stripe Customer Portal source, owner-only analytics controls and production-secret separation.

The GitHub Actions workflow at `.github/workflows/atomic-qa.yml` runs the same QA and production build without consuming a Vercel deployment.

## Deployment workflow

GitHub is the active atomic-build workspace. Vercel Git deployment can remain disconnected while a release is being assembled, then be reconnected for one deliberate production deployment after review. Stripe webhook, customer portal and trusted-owner-device activation should happen only after the production server routes are live and the server-only credentials are installed.

## Architecture direction

Sensitive logic for CactusByte Core™, ByteLink™, authentication, entitlements, owner access, analytics, Stripe provisioning, AI routing and proprietary algorithms should remain server-side and outside public client bundles.

## Proprietary notice

Copyright © 2026 Cactus🌵Byte Studios™. All Rights Reserved.

This repository contains proprietary Cactus🌵Byte Studios™ application code. No license is granted to copy, modify, redistribute, sublicense, or create derivative works except with explicit written permission from the rights holder. Third-party dependencies remain subject to their respective licenses.
