import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const ideaRadarWorker = process.env.OPENAI_API_KEY ? "connected" : "configuration-required";
  return NextResponse.json(
    {
      service: "CactusByte Core™",
      version: "0.3-development",
      studioVersion: "1.6.0",
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
      note: "CactusByte ID, cloud persistence, community and the Stripe storefront are connected. CactusByte v1.6 adds Release Truth, Native Launch, responsive tablet/multi-window support, Owner Health, and a read-only Android Migration Center. Permanent-signing cutover remains a separate owner-approved operation.",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
