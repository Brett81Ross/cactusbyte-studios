import {testerIdentity,testerPassActive} from "../../../../lib/tester-pass";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(request:Request){
 try{
  const identity=await testerIdentity(request);
  const active=await testerPassActive(identity.uid);
  return Response.json({tester:active,status:active?"lifetime":"none"});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  if(message==="AUTH_REQUIRED")return Response.json({tester:false,status:"none"},{status:401});
  return Response.json({tester:false,status:"none"},{status:403});
 }
}
