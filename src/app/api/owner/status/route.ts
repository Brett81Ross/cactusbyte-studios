import {ownerIdentity} from "../../../../lib/owner-access";
import {createOwnerDeviceToken,ownerCookieHeader} from "../../../../lib/owner-device";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(request:Request){
 const owner=await ownerIdentity(request);
 if(!owner)return Response.json({owner:false},{status:403,headers:{"Cache-Control":"no-store"}});
 if(owner.source==="cactusbyte-id"){
  const deviceToken=createOwnerDeviceToken();
  return Response.json({owner:true,source:owner.source,deviceToken},{headers:{"Cache-Control":"no-store","Set-Cookie":ownerCookieHeader(deviceToken)}});
 }
 return Response.json({owner:true,source:owner.source},{headers:{"Cache-Control":"no-store"}});
}
