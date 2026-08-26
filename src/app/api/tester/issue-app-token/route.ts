import {createHash,randomBytes} from "node:crypto";
import {FieldValue} from "firebase-admin/firestore";
import {adminDb} from "../../../../lib/firebase-admin";
import {testerIdentity,testerPassActive} from "../../../../lib/tester-pass";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const APP_TARGETS:Record<string,string>={
 noproblem:"https://noproblem-pws.vercel.app/api/cactusbyte-vip",
 machzero:"https://machzero-beta.vercel.app/api/cactusbyte-vip"
};

function tokenHash(token:string){return createHash("sha256").update(token).digest("hex")}

export async function POST(request:Request){
 try{
  const identity=await testerIdentity(request);
  if(!(await testerPassActive(identity.uid)))return Response.json({ok:false,error:"Lifetime tester access is not active on this CactusByte ID."},{status:403});
  const body=await request.json().catch(()=>({}));
  const appId=typeof body?.appId==="string"?body.appId:"";
  const target=APP_TARGETS[appId];
  if(!target)return Response.json({ok:false,error:"This app does not require a CactusByte VIP activation bridge."},{status:400});

  const token=randomBytes(32).toString("base64url");
  const hash=tokenHash(token);
  const now=Date.now();
  const expiresAtMs=now+5*60*1000;
  await adminDb().collection("testerAppTokens").doc(hash).set({
   userId:identity.uid,
   email:identity.email,
   appId,
   status:"active",
   expiresAtMs,
   createdAt:FieldValue.serverTimestamp()
  });

  return Response.json({ok:true,appId,expiresAtMs,launchUrl:`${target}?token=${encodeURIComponent(token)}`},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  if(message==="AUTH_REQUIRED")return Response.json({ok:false,error:"Sign in with CactusByte ID first."},{status:401});
  console.error("Tester app-token issue failed",error);
  return Response.json({ok:false,error:"Could not prepare lifetime VIP app access."},{status:500});
 }
}
