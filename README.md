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
- Stripe Payment Links remain the live customer checkout surfaces; signed-in storefront launches attach the CactusByte user reference and email for provisioning
- Signature-verified Stripe subscription webhook staged to grant, update, and revoke Firestore entitlements using server-only Firebase Admin credentials
- Persistent Feedback Hub™, Idea Forge™ voting, Community Chat™ and ByteLink™ queue
- Portfolio-wide Community Chat channels for the current CactusByte app registry
- My CactusByte™ personalization with accent color, grid/list layouts, compact mode, pin/hide, category filtering and app reordering
- Native share support with app-branded QR sharing
- Install control with Android and iPhone/iPad fallback instructions while service workers remain disabled
- CactusByte Storefront™ with free-tier visibility and live per-app Stripe Pro upgrade paths
- CactusByte Pulse™ ecosystem health dashboard and Release Center™
- Owner Console™ gated by Firestore owner role
- Mobile-first Android and iOS-friendly UI
- TerraFlow Matrix™ v1.13.1 and OrbitGather™ v0.3.1 included as repository-backed records until their production links are verified

## Stripe entitlement provisioning

The storefront can already read entitlement records and suppress duplicate upgrade prompts for entitled users. The privileged webhook route at `/api/stripe/webhook` validates Stripe signatures and handles completed Checkout sessions plus subscription update/delete lifecycle events. It writes entitlements only through Firebase Admin on the server.

Before production activation, configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`, and `FIREBASE_ADMIN_PROJECT_ID` in the production environment, then register the deployed `/api/stripe/webhook` endpoint in Stripe. These values are intentionally not stored in GitHub.

## Registry verification

The current registry tracks explicit versions for every app. MachZero™, Rapid Takeoff™, and PocketStomp™ now sync from their repository package records; GhostLane™ syncs from its production radar wrapper; TerraFlow Matrix™ syncs from its v1.13.1 release surface. PocketStomp’s registry repository has also been corrected to the active `Brett81Ross/pocketstomp-` app source.

## Atomic QA

Run `npm run qa` for fast release checks or `npm run preflight` for the full QA + production build gate. The preflight verifies version consistency, app-registry integrity, live launch URLs, local logo assets, Stripe checkout records, Firebase environment-key hygiene, `.env` protection, the no-service-worker rule, entitlement client-write protection, server-only Stripe/Firebase Admin configuration, webhook signature verification, subscription lifecycle handling, and entitlement-aware Storefront behavior.

The release gate also requires every registry app to have exactly one matching Release Center™ record, rejects placeholder versions such as `Version not exposed`, verifies PocketStomp’s current repository source, and locks TerraFlow to the approved Concept 2 branding and v1.13.1 release source.

A GitHub Actions workflow at `.github/workflows/atomic-qa.yml` runs the same preflight and Next.js production build without consuming a Vercel deployment.

## Deployment workflow

GitHub is the active atomic-build workspace. Vercel Git deployment can remain disconnected while a release is being assembled, then be reconnected for one deliberate production deployment after review. Stripe webhook activation should happen only after that production route is live and the server-only credentials are installed.

## Architecture direction

Sensitive future logic for CactusByte Core™, ByteLink™, authentication, entitlements, AI routing, and proprietary algorithms should remain server-side and outside public client bundles.

## Proprietary notice

Copyright © 2026 Cactus🌵Byte Studios™. All Rights Reserved.

This repository contains proprietary Cactus🌵Byte Studios™ application code. No license is granted to copy, modify, redistribute, sublicense, or create derivative works except with explicit written permission from the rights holder. Third-party dependencies remain subject to their respective licenses.
