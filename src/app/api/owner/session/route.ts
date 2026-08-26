import {adminAuth} from "../../../../lib/firebase-admin";
import {ownerDeviceTrusted} from "../../../../lib/owner-device";
import {ownerUid} from "../../../../lib/owner-access";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(request:Request){
 if(!ownerDeviceTrusted(request))return new Response("Trusted owner device required.",{status:403});
 const uid=await ownerUid();
 const customToken=await adminAuth().createCustomToken(uid,{role:"owner",ownerDevice:true});
 return Response.json({customToken},{headers:{"Cache-Control":"no-store"}});
}
