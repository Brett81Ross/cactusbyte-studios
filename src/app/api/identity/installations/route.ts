import {adminDb} from "../../../../lib/firebase-admin";
import {testerIdentity} from "../../../../lib/tester-pass";
import {ORBITGATHER_APP_ID,revokeOrbitInstallation,validOrbitInstallationId} from "../../../../lib/orbitgather-recovery";

export const runtime="nodejs";
export const dynamic="force-dynamic";

function asNumber(value:unknown){const n=Number(value||0);return Number.isFinite(n)?n:0}

export async function GET(request:Request){
 try{
  const identity=await testerIdentity(request);
  const filterAppId=new URL(request.url).searchParams.get("appId")?.trim()||"";
  const snap=await adminDb().collection("profiles").doc(identity.uid).collection("installations").get();
  const installations=snap.docs.map(doc=>doc.data()).filter(data=>!filterAppId||String(data.appId||"")===filterAppId).map(data=>({
   appId:String(data.appId||""),installationId:String(data.installationId||""),deviceLabel:String(data.deviceLabel||"Installation").slice(0,160),
   active:data.active===true,createdAtMs:asNumber(data.createdAtMs),updatedAtMs:asNumber(data.updatedAtMs),lastSeenAtMs:asNumber(data.lastSeenAtMs),lastRestoredAtMs:asNumber(data.lastRestoredAtMs),revokedAtMs:asNumber(data.revokedAtMs)
  })).filter(row=>row.appId&&row.installationId).sort((a,b)=>Number(b.active)-Number(a.active)||b.updatedAtMs-a.updatedAtMs);
  return Response.json({ok:true,installations},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  if(message==="AUTH_REQUIRED")return Response.json({ok:false,code:message,error:"Sign in with CactusByte ID first."},{status:401});
  console.error("Linked installations list failed",error);
  return Response.json({ok:false,code:"INSTALLATIONS_UNAVAILABLE",error:"Linked devices are temporarily unavailable."},{status:500});
 }
}

export async function DELETE(request:Request){
 try{
  const identity=await testerIdentity(request);
  const body=await request.json().catch(()=>({}));
  const appId=String(body?.appId||"");
  const installationId=String(body?.installationId||"");
  if(appId!==ORBITGATHER_APP_ID||!validOrbitInstallationId(installationId))return Response.json({ok:false,code:"INVALID_RECOVERY_INPUT",error:"This installation cannot be revoked here."},{status:400});
  await revokeOrbitInstallation(identity.uid,installationId);
  return Response.json({ok:true,appId,installationId,active:false},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  if(message==="AUTH_REQUIRED")return Response.json({ok:false,code:message,error:"Sign in with CactusByte ID first."},{status:401});
  if(message==="BINDING_MISMATCH")return Response.json({ok:false,code:message,error:"That recovery binding is already revoked or is not owned by this CactusByte ID."},{status:409});
  console.error("Linked installation revoke failed",error);
  return Response.json({ok:false,code:"REVOCATION_FAILED",error:"The recovery binding could not be revoked."},{status:500});
 }
}
