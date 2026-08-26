import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      service: "CactusByte Core™",
      version: "0.3-development",
      studioVersion: "1.4.0",
      state: "development",
      infrastructure: {
        registry: "connected",
        firebaseIdentity: "connected",
        firestorePersistence: "connected",
        community: "connected",
        portfolioChannels: "connected",
        ideaVoting: "connected",
        stripeCatalog: "connected",
        entitlementLedger: "read-only",
        checkoutIdentityBinding: "signed-staged",
        entitlementProvisioning: "webhook-ready",
        subscriptionManagement: "portal-ready",
        ownerTrustedDevice: "staged",
        ownerAnalytics: "staged",
        authEventTracking: "staged",
        byteLinkTransport: "development",
        ideaRadarWorker: "development",
      },
      note: "CactusByte ID, cloud persistence, community and the Stripe storefront are connected. The atomic build now includes signed checkout attribution, Stripe entitlement provisioning, customer-portal subscription management, a trusted-owner-device session path, and owner-only user analytics. Production secrets and final deployment activation remain release-time configuration.",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
