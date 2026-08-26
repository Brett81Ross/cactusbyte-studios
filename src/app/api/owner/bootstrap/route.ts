import {createOwnerDeviceToken,ownerCookieHeader,verifyOwnerSetupSecret} from "../../../../lib/owner-device";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(request:Request){
 let body:{setupCode?:string};
 try{body=await request.json()}catch{return new Response("Invalid owner-device request.",{status:400})}
 if(!verifyOwnerSetupSecret((body.setupCode||"").trim()))return new Response("Owner setup code was not accepted.",{status:403});
 const token=createOwnerDeviceToken();
 return Response.json({trusted:true,deviceToken:token},{headers:{"Cache-Control":"no-store","Set-Cookie":ownerCookieHeader(token)}});
}
