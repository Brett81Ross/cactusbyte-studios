import {createHash,createHmac,randomBytes,timingSafeEqual} from "node:crypto";
import {FieldValue} from "firebase-admin/firestore";
import {adminDb} from "./firebase-admin";

export const ORBITGATHER_APP_ID="orbitgather";
export const ORBIT_RECOVERY_TOKEN_TTL_MS=5*60*1000;
const RESTORE_LEASE_MS=2*60*1000;
const RATE_LIMIT_MS=15*1000;
const TOKEN_COLLECTION="orbitGatherRecoveryTokens";
const RATE_COLLECTION="orbitGatherRecoveryRate";
const BINDING_COLLECTION="orbitGatherRecoveryBindings";
const OWNER_COLLECTION="orbitGatherRecoveryInstallationOwners";
const USER_COLLECTION="orbitGatherRecoveryUsers";
const AUDIT_COLLECTION="orbitGatherRecoveryEvents";

export type OrbitRecoveryPurpose="claim"|"restore";
export type OrbitRestoreLeaseState="processing"|"consumed";

function bridgeSecret(){
 const value=(process.env.ORBITGATHER_RECOVERY_BRIDGE_SECRET||"").trim();
 if(value.length<32)throw new Error("RECOVERY_BRIDGE_NOT_CONFIGURED");
 return value;
}

export function orbitRecoveryTokenHash(token:string){return createHash("sha256").update(token).digest("hex")}
export function validOrbitRecoveryToken(token:string){return /^[A-Za-z0-9_-]{40,128}$/.test(token)}
export function validOrbitInstallationId(value:string){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)}
export function validOrbitOperationId(value:string){return /^[A-Za-z0-9_-]{20,80}$/.test(value)}
export function orbitBridgeAttestation(action:string,parts:string[]){
 return createHmac("sha256",bridgeSecret()).update([ORBITGATHER_APP_ID,action,...parts].join(":")).digest("base64url");
}
export function verifyOrbitBridgeAttestation(action:string,parts:string[],supplied:string){
 if(!/^[A-Za-z0-9_-]{20,128}$/.test(supplied))return false;
 const expected=Buffer.from(orbitBridgeAttestation(action,parts));
 const actual=Buffer.from(supplied);
 return expected.length===actual.length&&timingSafeEqual(expected,actual);
}

function tokenUid(data:any,purpose:OrbitRecoveryPurpose){
 if(!data)throw new Error("TOKEN_NOT_FOUND");
 if(String(data.appId||"")!==ORBITGATHER_APP_ID||String(data.purpose||"")!==purpose)throw new Error("TOKEN_SCOPE_MISMATCH");
 if(Number(data.expiresAtMs||0)<=Date.now())throw new Error("TOKEN_EXPIRED");
 const uid=String(data.userId||"");
 if(!uid)throw new Error("TOKEN_IDENTITY_MISSING");
 return uid;
}

export async function issueOrbitRecoveryToken(uid:string,email:string,purpose:OrbitRecoveryPurpose){
 const db=adminDb();
 const token=randomBytes(32).toString("base64url");
 const hash=orbitRecoveryTokenHash(token);
 const now=Date.now();
 const expiresAtMs=now+ORBIT_RECOVERY_TOKEN_TTL_MS;
 const rateRef=db.collection(RATE_COLLECTION).doc(uid);
 const userRef=db.collection(USER_COLLECTION).doc(uid);
 const tokenRef=db.collection(TOKEN_COLLECTION).doc(hash);
 let installationId="";

 await db.runTransaction(async tx=>{
  const rate=await tx.get(rateRef);
  if(rate.exists&&now-Number(rate.data()?.lastIssuedAtMs||0)<RATE_LIMIT_MS)throw new Error("RATE_LIMITED");

  if(purpose==="restore"){
   const user=await tx.get(userRef);
   installationId=String(user.data()?.primaryInstallationId||"");
   if(!validOrbitInstallationId(installationId))throw new Error("NO_BOUND_INSTALLATION");
   const owner=await tx.get(db.collection(OWNER_COLLECTION).doc(installationId));
   if(!owner.exists||String(owner.data()?.userId||"")!==uid)throw new Error("BINDING_MISMATCH");
  }

  tx.set(rateRef,{lastIssuedAtMs:now,updatedAt:FieldValue.serverTimestamp()},{merge:true});
  tx.create(tokenRef,{
   userId:uid,email,appId:ORBITGATHER_APP_ID,purpose,status:"active",installationId:installationId||null,
   expiresAtMs,createdAt:FieldValue.serverTimestamp()
  });
 });
 return{token,expiresAtMs,installationId:installationId||null};
}

export async function confirmOrbitLegacyClaim(token:string,installationId:string,deviceLabel:string){
 if(!validOrbitRecoveryToken(token)||!validOrbitInstallationId(installationId))throw new Error("INVALID_RECOVERY_INPUT");
 const db=adminDb();
 const tokenRef=db.collection(TOKEN_COLLECTION).doc(orbitRecoveryTokenHash(token));
 let claimedUid="";
 await db.runTransaction(async tx=>{
  const tokenSnap=await tx.get(tokenRef);
  const data=tokenSnap.data();
  const uid=tokenUid(data,"claim");
  if(String(data?.status||"")!=="active")throw new Error("TOKEN_USED");
  claimedUid=uid;
  const ownerRef=db.collection(OWNER_COLLECTION).doc(installationId);
  const owner=await tx.get(ownerRef);
  if(owner.exists&&String(owner.data()?.userId||"")!==uid)throw new Error("INSTALLATION_ALREADY_BOUND");
  const bindingId=`${uid}__${installationId}`;
  const bindingRef=db.collection(BINDING_COLLECTION).doc(bindingId);
  const userRef=db.collection(USER_COLLECTION).doc(uid);
  const auditRef=db.collection(AUDIT_COLLECTION).doc();
  tx.set(ownerRef,{userId:uid,installationId,bindingId,active:true,updatedAt:FieldValue.serverTimestamp(),createdAt:owner.exists?owner.data()?.createdAt||FieldValue.serverTimestamp():FieldValue.serverTimestamp()},{merge:true});
  tx.set(bindingRef,{userId:uid,email:String(data?.email||""),installationId,deviceLabel:deviceLabel.slice(0,160),active:true,source:"legacy_installation_claim",updatedAt:FieldValue.serverTimestamp(),createdAt:FieldValue.serverTimestamp()},{merge:true});
  tx.set(userRef,{userId:uid,primaryInstallationId:installationId,installationIds:FieldValue.arrayUnion(installationId),updatedAt:FieldValue.serverTimestamp()},{merge:true});
  tx.update(tokenRef,{status:"consumed",installationId,consumedAt:FieldValue.serverTimestamp()});
  tx.create(auditRef,{userId:uid,appId:ORBITGATHER_APP_ID,installationId,action:"legacy_installation_claim",createdAt:FieldValue.serverTimestamp()});
 });
 return{uid:claimedUid,installationId};
}

export async function beginOrbitRestore(token:string){
 if(!validOrbitRecoveryToken(token))throw new Error("INVALID_RECOVERY_INPUT");
 const db=adminDb();
 const tokenRef=db.collection(TOKEN_COLLECTION).doc(orbitRecoveryTokenHash(token));
 const now=Date.now();
 let operationId="";
 let installationId="";
 let uid="";
 let state:OrbitRestoreLeaseState="processing";
 let leaseExpiresAtMs=0;
 await db.runTransaction(async tx=>{
  const tokenSnap=await tx.get(tokenRef);
  const data=tokenSnap.data();
  uid=tokenUid(data,"restore");
  installationId=String(data?.installationId||"");
  if(!validOrbitInstallationId(installationId))throw new Error("NO_BOUND_INSTALLATION");
  const status=String(data?.status||"");
  const existingOperationId=String(data?.operationId||"");
  const existingLeaseExpiresAtMs=Number(data?.leaseExpiresAtMs||0);
  const owner=await tx.get(db.collection(OWNER_COLLECTION).doc(installationId));
  if(!owner.exists||String(owner.data()?.userId||"")!==uid)throw new Error("BINDING_MISMATCH");

  if(status==="consumed"){
   if(!validOrbitOperationId(existingOperationId))throw new Error("TOKEN_USED");
   operationId=existingOperationId;
   state="consumed";
   leaseExpiresAtMs=0;
   return;
  }

  if(status==="processing"&&existingLeaseExpiresAtMs>now){
   if(!validOrbitOperationId(existingOperationId))throw new Error("RESTORE_OPERATION_MISMATCH");
   operationId=existingOperationId;
   state="processing";
   leaseExpiresAtMs=existingLeaseExpiresAtMs;
   return;
  }

  if(status!=="active"&&status!=="processing")throw new Error("TOKEN_USED");
  operationId=randomBytes(18).toString("base64url");
  state="processing";
  leaseExpiresAtMs=now+RESTORE_LEASE_MS;
  tx.update(tokenRef,{status:"processing",operationId,leaseExpiresAtMs,processingAt:FieldValue.serverTimestamp()});
  tx.create(db.collection(AUDIT_COLLECTION).doc(),{userId:uid,appId:ORBITGATHER_APP_ID,installationId,action:"restore_begin",operationId,createdAt:FieldValue.serverTimestamp()});
 });
 return{uid,installationId,operationId,state,leaseExpiresAtMs};
}

export async function finishOrbitRestore(token:string,operationId:string,success:boolean){
 if(!validOrbitRecoveryToken(token)||!validOrbitOperationId(operationId))throw new Error("INVALID_RECOVERY_INPUT");
 const db=adminDb();
 const tokenRef=db.collection(TOKEN_COLLECTION).doc(orbitRecoveryTokenHash(token));
 let uid="",installationId="";
 let idempotent=false;
 await db.runTransaction(async tx=>{
  const snap=await tx.get(tokenRef);
  const data=snap.data();
  uid=tokenUid(data,"restore");
  installationId=String(data?.installationId||"");
  const status=String(data?.status||"");
  const storedOperationId=String(data?.operationId||"");
  if(status==="consumed"&&success&&storedOperationId===operationId){idempotent=true;return}
  if(status!=="processing"||storedOperationId!==operationId)throw new Error("RESTORE_OPERATION_MISMATCH");
  const next=success?{status:"consumed",consumedAt:FieldValue.serverTimestamp(),leaseExpiresAtMs:0}:{status:Number(data?.expiresAtMs||0)>Date.now()?"active":"expired",operationId:null,leaseExpiresAtMs:0};
  tx.update(tokenRef,next);
  tx.create(db.collection(AUDIT_COLLECTION).doc(),{userId:uid,appId:ORBITGATHER_APP_ID,installationId,action:success?"restore_complete":"restore_failed",operationId,createdAt:FieldValue.serverTimestamp()});
 });
 return{uid,installationId,success,idempotent};
}
