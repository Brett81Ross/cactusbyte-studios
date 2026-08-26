import {adminAuth,adminDb} from "./firebase-admin";
import {ownerDeviceTrusted} from "./owner-device";

function bearer(request:Request){
 const header=request.headers.get("authorization")||"";
 return header.toLowerCase().startsWith("bearer ")?header.slice(7).trim():"";
}

export async function ownerUid(){
 const configured=(process.env.OWNER_FIREBASE_UID||"").trim();
 if(configured){
  await adminDb().collection("profiles").doc(configured).set({uid:configured,role:"owner"},{merge:true});
  return configured;
 }
 const snap=await adminDb().collection("profiles").where("role","==","owner").limit(1).get();
 if(snap.empty)throw new Error("No owner profile is configured. Set OWNER_FIREBASE_UID once for the owner account.");
 return snap.docs[0].id;
}

export async function ownerIdentity(request:Request){
 if(ownerDeviceTrusted(request))return{uid:await ownerUid(),source:"trusted-device" as const};
 const token=bearer(request);
 if(!token)return null;
 let decoded;
 try{decoded=await adminAuth().verifyIdToken(token)}catch{return null}
 const profile=await adminDb().collection("profiles").doc(decoded.uid).get();
 if(profile.data()?.role!=="owner")return null;
 return{uid:decoded.uid,source:"cactusbyte-id" as const};
}
