import { NextResponse } from "next/server";
import { infrastructure } from "../../../data/ecosystem";
export const dynamic = "force-dynamic";
export async function GET(){return NextResponse.json({service:"CactusByte Core™",version:"0.2-development",studioVersion:"1.3.0",state:"development",infrastructure,note:"Firebase identity and persistence are connected. Privileged Core services remain Development until server credentials and signed ByteLink identities are enabled."},{headers:{"Cache-Control":"no-store"}})}
