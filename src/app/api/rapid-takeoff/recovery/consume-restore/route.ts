import {consumeRapidRestoreToken,validRapidRecoveryToken} from "../../../../../lib/rapid-takeoff-recovery";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(request:Request){
 try{
  const body=await request.json().catch(()=>({}));
  const token=typeof body?.token==="string"?body.token.trim():"";
  if(!validRapidRecoveryToken(token))return Response.json({ok:false,error:"Invalid Rapid Takeoff restore token."},{status:400});
  await consumeRapidRestoreToken(token);
  return Response.json({ok:true,status:"lifetime",appId:"rapid-takeoff"},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  if(["TOKEN_NOT_FOUND","TOKEN_SCOPE_MISMATCH","TOKEN_USED","TOKEN_EXPIRED","TOKEN_IDENTITY_MISSING","NO_LIFETIME_ENTITLEMENT"].includes(message))return Response.json({ok:false,error:"Rapid Takeoff restore link expired, was already used, or access is no longer active."},{status:403});
  console.error("Rapid Takeoff restore-token consume failed",error);
  return Response.json({ok:false,error:"Rapid Takeoff restore verification failed."},{status:500});
 }
}
