import {beginOrbitRestore,verifyOrbitBridgeAttestation,validOrbitRecoveryToken} from "../../../../../lib/orbitgather-recovery";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(request:Request){
 try{
  const body=await request.json().catch(()=>({}));
  const token=String(body?.token||"");
  const attestation=String(body?.attestation||"");
  if(!validOrbitRecoveryToken(token))return Response.json({ok:false,error:"Invalid OrbitGather restore token."},{status:400});
  if(!verifyOrbitBridgeAttestation("begin-restore",[token],attestation))return Response.json({ok:false,error:"OrbitGather restore attestation rejected."},{status:401});
  const result=await beginOrbitRestore(token);
  return Response.json({ok:true,installationId:result.installationId,operationId:result.operationId,leaseExpiresAtMs:result.leaseExpiresAtMs},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  if(message==="TOKEN_BUSY")return Response.json({ok:false,error:"This restore is already being processed. Try again shortly."},{status:409});
  if(message.includes("TOKEN_")||message==="BINDING_MISMATCH")return Response.json({ok:false,error:"This OrbitGather restore link is invalid, expired, or already used."},{status:409});
  console.error("OrbitGather restore begin failed",error);
  return Response.json({ok:false,error:"OrbitGather restore could not be started."},{status:500});
 }
}
