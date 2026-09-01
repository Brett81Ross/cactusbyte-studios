import {createHash,randomBytes} from "node:crypto";
import {FieldValue} from "firebase-admin/firestore";
import {adminDb} from "../../../../../lib/firebase-admin";
import {rapidTakeoffCouponHash,validRapidTakeoffCouponHash} from "../../../../../lib/rapid-takeoff-coupon";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const APP_ID="rapid-takeoff";
function tokenHash(token:string){return createHash("sha256").update(token).digest("hex")}

export async function POST(request:Request){
 try{
  const body=await request.json().catch(()=>({}));
  const code=typeof body?.code==="string"?body.code:"";
  const codeHash=rapidTakeoffCouponHash(code);
  if(!validRapidTakeoffCouponHash(codeHash))return Response.json({ok:false,error:"Invalid Rapid Takeoff coupon code."},{status:400});

  const token=randomBytes(32).toString("base64url");
  const hash=tokenHash(token);
  const expiresAtMs=Date.now()+10*60*1000;
  const db=adminDb();
  const couponRef=db.collection("appCoupons").doc(`${APP_ID}__${codeHash}`);
  const tokenRef=db.collection("testerAppTokens").doc(hash);

  await db.runTransaction(async tx=>{
   const coupon=await tx.get(couponRef);
   if(coupon.exists)throw new Error("COUPON_ALREADY_REDEEMED");
   tx.create(couponRef,{appId:APP_ID,codeHash,status:"redeemed",redeemedAt:FieldValue.serverTimestamp()});
   tx.create(tokenRef,{appId:APP_ID,status:"active",source:"rapid_takeoff_coupon",expiresAtMs,createdAt:FieldValue.serverTimestamp()});
  });

  return Response.json({ok:true,appId:APP_ID,token,expiresAtMs},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  if(message==="COUPON_ALREADY_REDEEMED")return Response.json({ok:false,error:"That Rapid Takeoff coupon has already been redeemed."},{status:409});
  console.error("Rapid Takeoff coupon issue failed",error);
  return Response.json({ok:false,error:"Rapid Takeoff coupon redemption is temporarily unavailable."},{status:500});
 }
}
