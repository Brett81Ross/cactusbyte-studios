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
  if(purpose!=="claim"&&purpose!=="restore")return Response.json({ok:false,error:"Invalid OrbitGather recovery purpose."},{status:400});
  const issued=await issueOrbitRecoveryToken(identity.uid,identity.email,purpose);
  const launch=new URL(ORBITGATHER_ORIGIN);
  launch.searchParams.set("orbitRecovery",purpose);
  launch.searchParams.set("token",issued.token);
  return Response.json({ok:true,purpose,launchUrl:launch.toString(),expiresAtMs:issued.expiresAtMs},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  if(message==="AUTH_REQUIRED")return Response.json({ok:false,error:"Sign in with CactusByte ID first."},{status:401});
  if(message==="RATE_LIMITED")return Response.json({ok:false,error:"Wait a few seconds before requesting another recovery link."},{status:429});
  if(message==="NO_BOUND_INSTALLATION"||message==="BINDING_MISMATCH")return Response.json({ok:false,error:"No protected OrbitGather installation is linked to this CactusByte ID yet."},{status:403});
  console.error("OrbitGather recovery issue failed",error);
  return Response.json({ok:false,error:"OrbitGather recovery is temporarily unavailable."},{status:500});
 }
}
