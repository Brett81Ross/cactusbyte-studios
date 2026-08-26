import {ownerIdentity} from "../../../../lib/owner-access";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(request:Request){
 const owner=await ownerIdentity(request);
 if(!owner)return Response.json({owner:false},{status:403,headers:{"Cache-Control":"no-store"}});
 return Response.json({owner:true,source:owner.source},{headers:{"Cache-Control":"no-store"}});
}
