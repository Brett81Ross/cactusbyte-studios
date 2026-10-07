import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const ideaRadarWorker = process.env.OPENAI_API_KEY ? "connected" : "configuration-required";
  return NextResponse.json(
    {
      service: "CactusByte Core™",
      version: "0.3-development",
      studioVersion: "1.7.0",
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
        ideaRadarWorker,
      },
      note: "CactusByte ID, cloud persistence, community and the Stripe storefront are connected. CactusByte v1.7.0 makes the premium storefront launchpad the public home while preserving the legacy command center at /studio, verified app branding, identity, entitlement, Native Launch, Owner Health, and Android migration safeguards. Permanent-signing cutover remains a separate owner-approved operation.",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
