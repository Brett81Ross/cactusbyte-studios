import { NextResponse } from "next/server";
export const dynamic="force-dynamic";
export async function POST(){return NextResponse.json({ok:false,state:"development",reason:"Idea Radar server worker is intentionally disabled until provider credentials and owner-only server authentication are configured."},{status:503,headers:{"Cache-Control":"no-store"}})}
