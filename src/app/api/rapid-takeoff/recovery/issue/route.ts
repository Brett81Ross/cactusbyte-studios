import {testerIdentity} from "../../../../../lib/tester-pass";
import {issueRapidRecoveryToken,type RapidRecoveryPurpose} from "../../../../../lib/rapid-takeoff-recovery";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const RAPID_ORIGIN="https://blueprint-estimator.vercel.app";

export async function POST(request:Request){
 try{
  const identity=await testerIdentity(request);
  const body=await request.json().catch(()=>({}));
  const purpose=body?.purpose as RapidRecoveryPurpose;
  if(purpose!=="claim"&&purpose!=="restore")return Response.json({ok:false,error:"Invalid Rapid Takeoff recovery purpose."},{status:400});
  const issued=await issueRapidRecoveryToken(identity.uid,identity.email,purpose);
  const route=purpose==="claim"?"/api/access/claim":"/api/access/restore";
  const launchUrl=`${RAPID_ORIGIN}${route}?token=${encodeURIComponent(issued.token)}`;
  return Response.json({ok:true,purpose,launchUrl,expiresAtMs:issued.expiresAtMs},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  if(message==="AUTH_REQUIRED")return Response.json({ok:false,error:"Sign in with CactusByte ID first."},{status:401});
  if(message==="RATE_LIMITED")return Response.json({ok:false,error:"Wait a few seconds before requesting another recovery link."},{status:429});
  if(message==="NO_LIFETIME_ENTITLEMENT")return Response.json({ok:false,error:"This CactusByte ID does not have a linked lifetime Rapid Takeoff entitlement yet."},{status:403});
  console.error("Rapid Takeoff recovery issue failed",error);
  return Response.json({ok:false,error:"Rapid Takeoff recovery is temporarily unavailable."},{status:500});
 }
}
