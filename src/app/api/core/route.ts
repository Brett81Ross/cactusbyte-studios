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
        entitlementProvisioning: "development",
        byteLinkTransport: "development",
        ideaRadarWorker: "development",
      },
      note: "Firebase identity, persistence, portfolio community channels, Idea Forge voting and Stripe storefront catalog are connected. Signed-in CactusByte IDs can read server-managed entitlement records, while payment-to-entitlement provisioning remains Development until a privileged server webhook is enabled. ByteLink signing and other privileged Core services remain Development.",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
