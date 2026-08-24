import { NextResponse } from "next/server";
import { firebaseAdminConfigured, getAdminDb } from "../../../lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const expected = process.env.CACTUSBYTE_RADAR_SECRET;
  if (!expected || request.headers.get("x-cactusbyte-radar-secret") !== expected) {
    return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  }

  if (!firebaseAdminConfigured()) {
    return NextResponse.json({ ok:false, reason:"Idea Radar server credentials are not configured yet." }, { status:503 });
  }

  const adminDb = getAdminDb();
  const started = await adminDb.collection("ideaRadarRuns").add({
    status:"running", startedAt:new Date(), sourcesChecked:0, ideasCreated:0,
  });

  try {
    const searchEndpoint = process.env.IDEA_RADAR_SEARCH_ENDPOINT;
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!searchEndpoint || !openaiKey) {
      await started.update({ status:"waiting_for_providers", completedAt:new Date() });
      return NextResponse.json({ ok:false, reason:"Idea Radar providers are not configured." }, { status:503 });
    }

    return NextResponse.json({ ok:false, reason:"Provider adapter is staged but intentionally not enabled yet." }, { status:503 });
  } catch (error) {
    await started.update({ status:"failed", completedAt:new Date(), notes:String(error) });
    return NextResponse.json({ ok:false, error:String(error) }, { status:500 });
  }
}
