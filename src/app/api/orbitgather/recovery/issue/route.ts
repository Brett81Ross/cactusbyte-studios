import {testerIdentity} from "../../../../../lib/tester-pass";
import {issueOrbitRecoveryToken,type OrbitRecoveryPurpose} from "../../../../../lib/orbitgather-recovery";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const ORBITGATHER_ORIGIN="https://orbitgather-wahh.vercel.app";

export async function POST(request:Request){
 try{
  const identity=await testerIdentity(request);
  const body=await request.json().catch(()=>({}));
  const purpose=body?.purpose as OrbitRecoveryPurpose;
  const installationId=String(body?.installationId||"");
  if(purpose!=="claim"&&purpose!=="restore")return Response.json({ok:false,code:"INVALID_PURPOSE",error:"Invalid OrbitGather recovery purpose."},{status:400});
  const issued=await issueOrbitRecoveryToken(identity.uid,identity.email,purpose,installationId);
  const launch=new URL(ORBITGATHER_ORIGIN);
  launch.searchParams.set("orbitRecovery",purpose);
  launch.searchParams.set("token",issued.token);
  return Response.json({ok:true,purpose,installationId:issued.installationId,launchUrl:launch.toString(),expiresAtMs:issued.expiresAtMs},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  if(message==="AUTH_REQUIRED")return Response.json({ok:false,code:message,error:"Sign in with CactusByte ID first."},{status:401});
  if(message==="RATE_LIMITED")return Response.json({ok:false,code:message,error:"Wait a few seconds before requesting another recovery link."},{status:429});
  if(message==="INSTALLATION_SELECTION_REQUIRED")return Response.json({ok:false,code:message,error:"Choose which protected OrbitGather installation you want to restore."},{status:409});
  if(message==="NO_BOUND_INSTALLATION"||message==="BINDING_MISMATCH")return Response.json({ok:false,code:message,error:"No active protected OrbitGather installation matches this CactusByte ID."},{status:403});
  console.error("OrbitGather recovery issue failed",error);
  return Response.json({ok:false,code:"RECOVERY_UNAVAILABLE",error:"OrbitGather recovery is temporarily unavailable."},{status:500});
 }
}
