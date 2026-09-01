import {finishOrbitRestore,verifyOrbitBridgeAttestation,validOrbitOperationId,validOrbitRecoveryToken} from "../../../../../../lib/orbitgather-recovery";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(request:Request){
 try{
  const body=await request.json().catch(()=>({}));
  const token=String(body?.token||"");
  const operationId=String(body?.operationId||"");
  const success=body?.success===true;
  const attestation=String(body?.attestation||"");
  if(!validOrbitRecoveryToken(token)||!validOrbitOperationId(operationId))return Response.json({ok:false,error:"Invalid OrbitGather restore completion."},{status:400});
  if(!verifyOrbitBridgeAttestation("finish-restore",[token,operationId,success?"1":"0"],attestation))return Response.json({ok:false,error:"OrbitGather restore completion attestation rejected."},{status:401});
  const result=await finishOrbitRestore(token,operationId,success);
  return Response.json({ok:true,success:result.success},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  if(message.includes("TOKEN_")||message==="RESTORE_OPERATION_MISMATCH")return Response.json({ok:false,error:"This OrbitGather restore operation is no longer valid."},{status:409});
  console.error("OrbitGather restore finish failed",error);
  return Response.json({ok:false,error:"OrbitGather restore completion failed."},{status:500});
 }
}
