import {beginOrbitRestore,verifyOrbitBridgeAttestation,validOrbitRecoveryToken} from "../../../../../lib/orbitgather-recovery";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(request:Request){
 try{
  const body=await request.json().catch(()=>({}));
  const token=String(body?.token||"");
  const attestation=String(body?.attestation||"");
  if(!validOrbitRecoveryToken(token))return Response.json({ok:false,code:"INVALID_RECOVERY_INPUT",error:"Invalid OrbitGather restore token."},{status:400});
  if(!verifyOrbitBridgeAttestation("begin-restore",[token],attestation))return Response.json({ok:false,code:"ATTESTATION_REJECTED",error:"OrbitGather restore attestation rejected."},{status:401});
  const result=await beginOrbitRestore(token);
  return Response.json({ok:true,installationId:result.installationId,operationId:result.operationId,state:result.state,leaseExpiresAtMs:result.leaseExpiresAtMs},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  if(message.includes("TOKEN_")||message==="BINDING_MISMATCH"||message==="RESTORE_OPERATION_MISMATCH")return Response.json({ok:false,code:message,error:"This OrbitGather restore link is invalid, expired, revoked, or already used."},{status:409});
  console.error("OrbitGather restore begin failed",error);
  return Response.json({ok:false,code:"RESTORE_BEGIN_FAILED",error:"OrbitGather restore could not be started."},{status:500});
 }
}
