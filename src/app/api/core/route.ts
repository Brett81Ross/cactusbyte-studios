import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      service: "CactusByte Core™",
      version: "0.2-development",
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
        entitlementProvisioning: "webhook-ready",
        byteLinkTransport: "development",
        ideaRadarWorker: "development",
      },
      note: "Firebase identity, persistence, community, Idea Forge voting and the Stripe storefront catalog are connected. Signed-in CactusByte IDs can read server-managed entitlements, and a signature-verified Stripe webhook is staged to provision and revoke access once the server-only Stripe and Firebase Admin credentials plus production webhook endpoint are configured. ByteLink signing and other privileged Core services remain Development.",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
