import {FieldValue} from "firebase-admin/firestore";
import {studioApps} from "../../../data/apps";
import {adminDb} from "../../../lib/firebase-admin";
import {testerCodeHash,testerIdentity,validTesterCodeHash} from "../../../lib/tester-pass";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(request:Request){
 try{
  const identity=await testerIdentity(request);
  const body=await request.json().catch(()=>({}));
  const code=typeof body?.code==="string"?body.code:"";
  const codeHash=testerCodeHash(code);
  if(!validTesterCodeHash(codeHash))return Response.json({ok:false,error:"Invalid tester coupon code."},{status:400});

  const db=adminDb();
  const couponRef=db.collection("testerCoupons").doc(codeHash);
  const passRef=db.collection("testerPasses").doc(identity.uid);
  const profileRef=db.collection("profiles").doc(identity.uid);

  await db.runTransaction(async tx=>{
   const[couponSnap,profileSnap]=await Promise.all([tx.get(couponRef),tx.get(profileRef)]);
   if(couponSnap.exists){
    const redeemedBy=String(couponSnap.data()?.redeemedBy||"");
    if(redeemedBy&&redeemedBy!==identity.uid)throw new Error("COUPON_ALREADY_REDEEMED");
   }

   if(!couponSnap.exists)tx.create(couponRef,{redeemedBy:identity.uid,redeemedEmail:identity.email,redeemedAt:FieldValue.serverTimestamp(),kind:"tester-lifetime"});
   tx.set(passRef,{userId:identity.uid,email:identity.email,active:true,status:"lifetime",source:"tester_coupon",codeHash,updatedAt:FieldValue.serverTimestamp(),createdAt:FieldValue.serverTimestamp()},{merge:true});

   const currentRole=String(profileSnap.data()?.role||"user");
   if(currentRole==="user"||currentRole==="tester")tx.set(profileRef,{uid:identity.uid,email:identity.email,role:"tester"},{merge:true});

   for(const app of studioApps){
    const entitlementRef=db.collection("entitlements").doc(`${identity.uid}__tester__${app.id}`);
    tx.set(entitlementRef,{userId:identity.uid,appId:app.id,plan:"tester-lifetime",source:"tester_coupon",status:"lifetime",active:true,expiresAt:null,codeHash,updatedAt:FieldValue.serverTimestamp(),createdAt:FieldValue.serverTimestamp()},{merge:true});
   }
  });

  return Response.json({ok:true,tester:true,status:"lifetime",apps:studioApps.length});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  if(message==="AUTH_REQUIRED")return Response.json({ok:false,error:"Sign in with CactusByte ID first."},{status:401});
  if(message==="COUPON_ALREADY_REDEEMED")return Response.json({ok:false,error:"That tester coupon has already been redeemed."},{status:409});
  console.error("Tester coupon redemption failed",error);
  return Response.json({ok:false,error:"Tester coupon redemption failed."},{status:500});
 }
}
