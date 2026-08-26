import {createHash} from "node:crypto";
import {FieldValue} from "firebase-admin/firestore";
import {adminDb} from "../../../../lib/firebase-admin";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const ALLOWED_APPS=new Set(["noproblem","machzero"]);
function tokenHash(token:string){return createHash("sha256").update(token).digest("hex")}

export async function POST(request:Request){
 try{
  const body=await request.json().catch(()=>({}));
  const token=typeof body?.token==="string"?body.token.trim():"";
  const appId=typeof body?.appId==="string"?body.appId:"";
  if(!ALLOWED_APPS.has(appId)||!/^[A-Za-z0-9_-]{32,128}$/.test(token))return Response.json({ok:false,error:"Invalid VIP activation request."},{status:400});

  const ref=adminDb().collection("testerAppTokens").doc(tokenHash(token));
  await adminDb().runTransaction(async tx=>{
   const snap=await tx.get(ref);
   if(!snap.exists)throw new Error("TOKEN_NOT_FOUND");
   const data=snap.data()||{};
   if(String(data.appId||"")!==appId)throw new Error("APP_MISMATCH");
   if(String(data.status||"")!=="active")throw new Error("TOKEN_USED");
   if(Number(data.expiresAtMs||0)<=Date.now())throw new Error("TOKEN_EXPIRED");
   tx.update(ref,{status:"consumed",consumedAt:FieldValue.serverTimestamp()});
  });

  return Response.json({ok:true,status:"lifetime",appId},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  if(["TOKEN_NOT_FOUND","APP_MISMATCH","TOKEN_USED","TOKEN_EXPIRED"].includes(message))return Response.json({ok:false,error:"VIP activation expired or already used."},{status:403});
  console.error("Tester app-token consume failed",error);
  return Response.json({ok:false,error:"VIP activation verification failed."},{status:500});
 }
}
