import {createHash,createHmac,randomBytes,timingSafeEqual} from "node:crypto";
import {FieldValue} from "firebase-admin/firestore";
import {adminDb} from "./firebase-admin";

export const RAPID_TAKEOFF_APP_ID="rapid-takeoff";
export const RAPID_RECOVERY_TOKEN_TTL_MS=5*60*1000;
const RATE_LIMIT_MS=15*1000;
const TOKEN_COLLECTION="rapidTakeoffRecoveryTokens";
const RATE_COLLECTION="rapidTakeoffRecoveryRate";
const AUDIT_COLLECTION="rapidTakeoffRecoveryEvents";

export type RapidRecoveryPurpose="claim"|"restore";

function bridgeSecret(){
 const value=(process.env.RAPID_RECOVERY_BRIDGE_SECRET||"").trim();
 if(!value)throw new Error("RECOVERY_BRIDGE_NOT_CONFIGURED");
 return value;
}

export function rapidRecoveryTokenHash(token:string){return createHash("sha256").update(token).digest("hex")}
export function validRapidRecoveryToken(token:string){return /^[A-Za-z0-9_-]{40,128}$/.test(token)}
export function rapidClaimAttestation(token:string){
 return createHmac("sha256",bridgeSecret()).update(`${RAPID_TAKEOFF_APP_ID}:claim:${token}`).digest("base64url");
}
export function verifyRapidClaimAttestation(token:string,supplied:string){
 if(!validRapidRecoveryToken(token)||!/^[A-Za-z0-9_-]{20,128}$/.test(supplied))return false;
 const expected=Buffer.from(rapidClaimAttestation(token));
 const actual=Buffer.from(supplied);
 return expected.length===actual.length&&timingSafeEqual(expected,actual);
}

function lifetimeEntitlement(data:FirebaseFirestore.DocumentData|undefined){
 if(!data||data.active===false)return false;
 const status=String(data.status||"").toLowerCase();
 const plan=String(data.plan||"").toLowerCase();
 return data.active===true&&(status==="lifetime"||plan==="lifetime");
}
function lifetimeTester(data:FirebaseFirestore.DocumentData|undefined){
 return Boolean(data?.active===true&&String(data?.status||"").toLowerCase()==="lifetime");
}

export async function issueRapidRecoveryToken(uid:string,email:string,purpose:RapidRecoveryPurpose){
 const db=adminDb();
 const token=randomBytes(32).toString("base64url");
 const hash=rapidRecoveryTokenHash(token);
 const now=Date.now();
 const expiresAtMs=now+RAPID_RECOVERY_TOKEN_TTL_MS;
 const tokenRef=db.collection(TOKEN_COLLECTION).doc(hash);
 const rateRef=db.collection(RATE_COLLECTION).doc(uid);
 const entitlementRef=db.collection("entitlements").doc(`${uid}__${RAPID_TAKEOFF_APP_ID}`);
 const testerRef=db.collection("testerPasses").doc(uid);

 await db.runTransaction(async tx=>{
  const rate=await tx.get(rateRef);
  if(rate.exists&&now-Number(rate.data()?.lastIssuedAtMs||0)<RATE_LIMIT_MS)throw new Error("RATE_LIMITED");

  if(purpose==="restore"){
   const entitlement=await tx.get(entitlementRef);
   const tester=await tx.get(testerRef);
   const hasEntitlement=lifetimeEntitlement(entitlement.data());
   const hasTester=lifetimeTester(tester.data());
   if(!hasEntitlement&&!hasTester)throw new Error("NO_LIFETIME_ENTITLEMENT");
   if(!hasEntitlement&&hasTester){
    tx.set(entitlementRef,{
     userId:uid,appId:RAPID_TAKEOFF_APP_ID,status:"lifetime",plan:"lifetime",active:true,
     source:"tester_pass",updatedAt:FieldValue.serverTimestamp(),createdAt:FieldValue.serverTimestamp()
    },{merge:true});
   }
  }

  tx.set(rateRef,{lastIssuedAtMs:now,updatedAt:FieldValue.serverTimestamp()},{merge:true});
  tx.create(tokenRef,{
   userId:uid,email,appId:RAPID_TAKEOFF_APP_ID,purpose,status:"active",expiresAtMs,
   createdAt:FieldValue.serverTimestamp()
  });
 });
 return{token,expiresAtMs};
}

function assertTokenRecord(data:FirebaseFirestore.DocumentData|undefined,purpose:RapidRecoveryPurpose){
 if(!data)throw new Error("TOKEN_NOT_FOUND");
 if(String(data.appId||"")!==RAPID_TAKEOFF_APP_ID||String(data.purpose||"")!==purpose)throw new Error("TOKEN_SCOPE_MISMATCH");
 if(String(data.status||"")!=="active")throw new Error("TOKEN_USED");
 if(Number(data.expiresAtMs||0)<=Date.now())throw new Error("TOKEN_EXPIRED");
 const uid=String(data.userId||"");
 if(!uid)throw new Error("TOKEN_IDENTITY_MISSING");
 return uid;
}

export async function confirmRapidLegacyClaim(token:string){
 const db=adminDb();
 const tokenRef=db.collection(TOKEN_COLLECTION).doc(rapidRecoveryTokenHash(token));
 let claimedUid="";
 await db.runTransaction(async tx=>{
  const snap=await tx.get(tokenRef);
  const uid=assertTokenRecord(snap.data(),"claim");
  claimedUid=uid;
  const entitlementRef=db.collection("entitlements").doc(`${uid}__${RAPID_TAKEOFF_APP_ID}`);
  const auditRef=db.collection(AUDIT_COLLECTION).doc();
  const entitlement=await tx.get(entitlementRef);
  const base={
   userId:uid,appId:RAPID_TAKEOFF_APP_ID,status:"lifetime",plan:"lifetime",active:true,
   source:"legacy_cookie_claim",updatedAt:FieldValue.serverTimestamp()
  } as Record<string,unknown>;
  if(!entitlement.exists)base.createdAt=FieldValue.serverTimestamp();
  tx.set(entitlementRef,base,{merge:true});
  tx.update(tokenRef,{status:"consumed",consumedAt:FieldValue.serverTimestamp()});
  tx.create(auditRef,{userId:uid,appId:RAPID_TAKEOFF_APP_ID,action:"legacy_cookie_claim",createdAt:FieldValue.serverTimestamp()});
 });
 return{uid:claimedUid};
}

export async function consumeRapidRestoreToken(token:string){
 const db=adminDb();
 const tokenRef=db.collection(TOKEN_COLLECTION).doc(rapidRecoveryTokenHash(token));
 let restoredUid="";
 await db.runTransaction(async tx=>{
  const snap=await tx.get(tokenRef);
  const uid=assertTokenRecord(snap.data(),"restore");
  restoredUid=uid;
  const entitlement=await tx.get(db.collection("entitlements").doc(`${uid}__${RAPID_TAKEOFF_APP_ID}`));
  const tester=await tx.get(db.collection("testerPasses").doc(uid));
  if(!lifetimeEntitlement(entitlement.data())&&!lifetimeTester(tester.data()))throw new Error("NO_LIFETIME_ENTITLEMENT");
  tx.update(tokenRef,{status:"consumed",consumedAt:FieldValue.serverTimestamp()});
  tx.create(db.collection(AUDIT_COLLECTION).doc(),{userId:uid,appId:RAPID_TAKEOFF_APP_ID,action:"restore",createdAt:FieldValue.serverTimestamp()});
 });
 return{uid:restoredUid};
}
