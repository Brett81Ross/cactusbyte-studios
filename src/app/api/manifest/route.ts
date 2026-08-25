import { NextResponse } from "next/server";
import { studioApps } from "../../../data/apps";
export const dynamic="force-dynamic";
export async function GET(){return NextResponse.json({cactusbyte:"1.0",appId:"cactusbyte-studios",name:"Cactus🌵Byte Studios™",version:"1.4.0",channel:"stable",byteLink:{compatible:true,protocol:"1.0-development",state:"development"},capabilities:["registry","firebase-auth","feedback","idea-forge","idea-voting","community","bytelink-queue","device-customization","pin-hide-reorder","qr-sharing","release-center","pulse","support"],apps:studioApps.map(({id,name,version,status,url,logo,channel,capabilities})=>({id,name,version,status,url,logo,channel,capabilities}))},{headers:{"Cache-Control":"no-store"}})}
