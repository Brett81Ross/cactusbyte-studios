import {confirmOrbitLegacyClaim,verifyOrbitBridgeAttestation,validOrbitInstallationId,validOrbitRecoveryToken} from "../../../../../../lib/orbitgather-recovery";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(request:Request){
 try{
  const body=await request.json().catch(()=>({}));
  const token=String(body?.token||"");
  const installationId=String(body?.installationId||"");
  const deviceLabel=String(body?.deviceLabel||"").slice(0,160);
  const attestation=String(body?.attestation||"");
  if(!validOrbitRecoveryToken(token)||!validOrbitInstallationId(installationId))return Response.json({ok:false,error:"Invalid OrbitGather claim."},{status:400});
  if(!verifyOrbitBridgeAttestation("claim",[token,installationId],attestation))return Response.json({ok:false,error:"OrbitGather claim attestation rejected."},{status:401});
  const result=await confirmOrbitLegacyClaim(token,installationId,deviceLabel);
  return Response.json({ok:true,installationId:result.installationId},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  if(message==="INSTALLATION_ALREADY_BOUND")return Response.json({ok:false,error:"This OrbitGather installation is already protected by a different CactusByte ID."},{status:409});
  if(message.includes("TOKEN_"))return Response.json({ok:false,error:"This OrbitGather protection link is invalid, expired, or already used."},{status:409});
  console.error("OrbitGather claim confirmation failed",error);
  return Response.json({ok:false,error:"OrbitGather protection could not be completed."},{status:500});
 }
}
