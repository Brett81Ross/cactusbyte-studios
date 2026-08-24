import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({service:"CactusByte Core™",version:"1.0-draft",state:"development",connected:false,capabilities:["registry","future-auth","future-entitlements","future-ai-routing","future-feature-flags"]},{headers:{"Cache-Control":"no-store"}})}
