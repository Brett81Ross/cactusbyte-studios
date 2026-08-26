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
        checkoutIdentityBinding: "signed-staged",
        entitlementProvisioning: "webhook-ready",
        byteLinkTransport: "development",
        ideaRadarWorker: "development",
      },
      note: "Firebase identity, persistence, community, Idea Forge voting and the Stripe storefront catalog are connected. Storefront checkout launches are staged to bind a verified CactusByte ID to the selected Stripe Payment Link with a server-signed reference, and the Stripe webhook accepts only that signed identity before provisioning entitlements. Production activation still requires the server-only Stripe/Firebase Admin credentials, checkout-signing secret and deployed webhook endpoint. ByteLink signing and other privileged Core services remain Development.",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
