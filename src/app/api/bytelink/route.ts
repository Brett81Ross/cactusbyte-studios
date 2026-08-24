import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({service:"ByteLink™",protocolVersion:"1.0-draft",state:"development",connected:false,signing:false,fields:["messageId","sourceAppId","destinationAppId","payloadType","permissions","timestamp","nonce","signature"]},{headers:{"Cache-Control":"no-store"}})}
