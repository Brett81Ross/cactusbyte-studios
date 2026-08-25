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
        ideaVoting: "connected",
        byteLinkTransport: "development",
        ideaRadarWorker: "development",
      },
      note: "Firebase identity, persistence, community data and Idea Forge voting are connected. Privileged Core services remain Development until server credentials and signed ByteLink identities are enabled.",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
