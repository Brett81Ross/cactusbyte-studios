import {confirmRapidLegacyClaim,validRapidRecoveryToken,verifyRapidClaimAttestation} from "../../../../../lib/rapid-takeoff-recovery";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(request:Request){
 try{
  const body=await request.json().catch(()=>({}));
  const token=typeof body?.token==="string"?body.token.trim():"";
  const attestation=typeof body?.attestation==="string"?body.attestation.trim():"";
  if(!validRapidRecoveryToken(token)||!verifyRapidClaimAttestation(token,attestation))return Response.json({ok:false,error:"Invalid Rapid Takeoff claim proof."},{status:403});
  await confirmRapidLegacyClaim(token);
  return Response.json({ok:true,status:"lifetime",appId:"rapid-takeoff"},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  if(["TOKEN_NOT_FOUND","TOKEN_SCOPE_MISMATCH","TOKEN_USED","TOKEN_EXPIRED","TOKEN_IDENTITY_MISSING"].includes(message))return Response.json({ok:false,error:"Rapid Takeoff claim link expired or was already used."},{status:403});
  if(message==="RECOVERY_BRIDGE_NOT_CONFIGURED")return Response.json({ok:false,error:"Rapid Takeoff recovery bridge is not configured."},{status:503});
  console.error("Rapid Takeoff legacy claim confirmation failed",error);
  return Response.json({ok:false,error:"Rapid Takeoff claim could not be completed."},{status:500});
 }
}
