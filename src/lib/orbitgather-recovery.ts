import {createHash,createHmac,randomBytes,timingSafeEqual} from "node:crypto";
import {FieldValue,type Firestore} from "firebase-admin/firestore";
import {adminDb} from "./firebase-admin";

export const ORBITGATHER_APP_ID="orbitgather";
export const ORBIT_RECOVERY_TOKEN_TTL_MS=5*60*1000;
const RESTORE_LEASE_MS=2*60*1000;
const RATE_LIMIT_MS=15*1000;
const TOKEN_COLLECTION="identityRecoveryTokens";
const RATE_COLLECTION="identityRecoveryRate";
const OWNER_COLLECTION="installationOwners";
const AUDIT_COLLECTION="identityRecoveryEvents";
const INSTALLATIONS_SUBCOLLECTION="installations";
const RECOVERY_NAMESPACE=(process.env.CACTUSBYTE_IDENTITY_RECOVERY_NAMESPACE||"").trim();
if(RECOVERY_NAMESPACE&&!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(RECOVERY_NAMESPACE))throw new Error("INVALID_IDENTITY_RECOVERY_NAMESPACE");

export type OrbitRecoveryPurpose="claim"|"restore";
export type OrbitRestoreLeaseState="processing"|"consumed";
export type OrbitLinkedInstallation={appId:string;installationId:string;deviceLabel:string;active:boolean;createdAtMs:number;updatedAtMs:number;lastSeenAtMs:number;lastRestoredAtMs:number;revokedAtMs:number};

function bridgeSecret(){
 const value=(process.env.ORBITGATHER_RECOVERY_BRIDGE_SECRET||"").trim();
 if(value.length<32)throw new Error("RECOVERY_BRIDGE_NOT_CONFIGURED");
 return value;
}
function scopedCollection(db:Firestore,name:string){return RECOVERY_NAMESPACE?db.collection("identityRecoveryNamespaces").doc(RECOVERY_NAMESPACE).collection(name):db.collection(name)}
function profileRef(db:Firestore,uid:string){return scopedCollection(db,"profiles").doc(uid)}
function ownerDocId(installationId:string){return `${ORBITGATHER_APP_ID}__${installationId}`}
function num(value:unknown){const n=Number(value||0);return Number.isFinite(n)?n:0}

export function orbitRecoveryTokenHash(token:string){return createHash("sha256").update(token).digest("hex")}
export function validOrbitRecoveryToken(token:string){return /^[A-Za-z0-9_-]{40,128}$/.test(token)}
export function validOrbitInstallationId(value:string){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)}
export function validOrbitOperationId(value:string){return /^[A-Za-z0-9_-]{20,80}$/.test(value)}
export function orbitBridgeAttestation(action:string,parts:string[]){return createHmac("sha256",bridgeSecret()).update([ORBITGATHER_APP_ID,action,...parts].join(":")).digest("base64url")}
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

export async function listOrbitInstallations(uid:string,activeOnly=false):Promise<OrbitLinkedInstallation[]>{
 const db=adminDb();
 const snap=await profileRef(db,uid).collection(INSTALLATIONS_SUBCOLLECTION).get();
 return snap.docs.map(doc=>doc.data()).filter(data=>String(data.appId||"")===ORBITGATHER_APP_ID&&(!activeOnly||data.active===true)).map(data=>({
  appId:ORBITGATHER_APP_ID,
  installationId:String(data.installationId||""),
  deviceLabel:String(data.deviceLabel||"OrbitGather installation").slice(0,160),
  active:data.active===true,
  createdAtMs:num(data.createdAtMs),updatedAtMs:num(data.updatedAtMs),lastSeenAtMs:num(data.lastSeenAtMs),lastRestoredAtMs:num(data.lastRestoredAtMs),revokedAtMs:num(data.revokedAtMs)
 })).filter(row=>validOrbitInstallationId(row.installationId)).sort((a,b)=>Number(b.active)-Number(a.active)||b.updatedAtMs-a.updatedAtMs);
}

export async function issueOrbitRecoveryToken(uid:string,email:string,purpose:OrbitRecoveryPurpose,requestedInstallationId=""){
 const db=adminDb();
 const token=randomBytes(32).toString("base64url");
 const hash=orbitRecoveryTokenHash(token);
 const now=Date.now();
 const expiresAtMs=now+ORBIT_RECOVERY_TOKEN_TTL_MS;
 const rateRef=scopedCollection(db,RATE_COLLECTION).doc(`${ORBITGATHER_APP_ID}__${uid}`);
 const tokenRef=scopedCollection(db,TOKEN_COLLECTION).doc(hash);
 let installationId="";

 if(purpose==="restore"){
  const active=await listOrbitInstallations(uid,true);
  if(requestedInstallationId){
   if(!validOrbitInstallationId(requestedInstallationId))throw new Error("INVALID_RECOVERY_INPUT");
   const selected=active.find(row=>row.installationId===requestedInstallationId);
   if(!selected)throw new Error("BINDING_MISMATCH");
   installationId=selected.installationId;
  }else if(active.length===1)installationId=active[0].installationId;
  else if(active.length>1)throw new Error("INSTALLATION_SELECTION_REQUIRED");
  else throw new Error("NO_BOUND_INSTALLATION");
 }

 await db.runTransaction(async tx=>{
  const rate=await tx.get(rateRef);
  if(rate.exists&&now-Number(rate.data()?.lastIssuedAtMs||0)<RATE_LIMIT_MS)throw new Error("RATE_LIMITED");
  if(purpose==="restore"){
   const owner=await tx.get(scopedCollection(db,OWNER_COLLECTION).doc(ownerDocId(installationId)));
   if(!owner.exists||owner.data()?.active!==true||String(owner.data()?.userId||"")!==uid)throw new Error("BINDING_MISMATCH");
  }
  tx.set(rateRef,{appId:ORBITGATHER_APP_ID,userId:uid,lastIssuedAtMs:now,updatedAt:FieldValue.serverTimestamp()},{merge:true});
  tx.create(tokenRef,{userId:uid,email,appId:ORBITGATHER_APP_ID,purpose,status:"active",installationId:installationId||null,expiresAtMs,createdAt:FieldValue.serverTimestamp(),createdAtMs:now});
 });
 return{token,expiresAtMs,installationId:installationId||null};
}

export async function confirmOrbitLegacyClaim(token:string,installationId:string,deviceLabel:string){
 if(!validOrbitRecoveryToken(token)||!validOrbitInstallationId(installationId))throw new Error("INVALID_RECOVERY_INPUT");
 const db=adminDb();
 const tokenRef=scopedCollection(db,TOKEN_COLLECTION).doc(orbitRecoveryTokenHash(token));
 const now=Date.now();
 let claimedUid="";
 await db.runTransaction(async tx=>{
  const tokenSnap=await tx.get(tokenRef);
  const data=tokenSnap.data();
  const uid=tokenUid(data,"claim");
  if(String(data?.status||"")!=="active")throw new Error("TOKEN_USED");
  claimedUid=uid;
  const ownerRef=scopedCollection(db,OWNER_COLLECTION).doc(ownerDocId(installationId));
  const owner=await tx.get(ownerRef);
  if(owner.exists&&owner.data()?.active===true&&String(owner.data()?.userId||"")!==uid)throw new Error("INSTALLATION_ALREADY_BOUND");
  const bindingRef=profileRef(db,uid).collection(INSTALLATIONS_SUBCOLLECTION).doc(ownerDocId(installationId));
  const binding=await tx.get(bindingRef);
  const auditRef=scopedCollection(db,AUDIT_COLLECTION).doc();
  const label=(deviceLabel.trim()||"OrbitGather installation").slice(0,160);
  tx.set(ownerRef,{appId:ORBITGATHER_APP_ID,userId:uid,installationId,active:true,updatedAt:FieldValue.serverTimestamp(),updatedAtMs:now,createdAtMs:owner.exists?num(owner.data()?.createdAtMs)||now:now},{merge:true});
  tx.set(bindingRef,{appId:ORBITGATHER_APP_ID,userId:uid,email:String(data?.email||""),installationId,deviceLabel:label,active:true,source:"legacy_installation_claim",updatedAt:FieldValue.serverTimestamp(),updatedAtMs:now,lastSeenAtMs:now,revokedAtMs:0,createdAtMs:binding.exists?num(binding.data()?.createdAtMs)||now:now},{merge:true});
  tx.update(tokenRef,{status:"consumed",installationId,consumedAt:FieldValue.serverTimestamp(),consumedAtMs:now});
  tx.create(auditRef,{userId:uid,appId:ORBITGATHER_APP_ID,installationId,action:"legacy_installation_claim",createdAt:FieldValue.serverTimestamp(),createdAtMs:now});
 });
 return{uid:claimedUid,installationId};
}

export async function beginOrbitRestore(token:string){
 if(!validOrbitRecoveryToken(token))throw new Error("INVALID_RECOVERY_INPUT");
 const db=adminDb();
 const tokenRef=scopedCollection(db,TOKEN_COLLECTION).doc(orbitRecoveryTokenHash(token));
 const now=Date.now();
 let operationId="",installationId="",uid="";
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
  const owner=await tx.get(scopedCollection(db,OWNER_COLLECTION).doc(ownerDocId(installationId)));
  if(!owner.exists||owner.data()?.active!==true||String(owner.data()?.userId||"")!==uid)throw new Error("BINDING_MISMATCH");
  if(status==="consumed"){
   if(!validOrbitOperationId(existingOperationId))throw new Error("TOKEN_USED");
   operationId=existingOperationId;state="consumed";leaseExpiresAtMs=0;return;
  }
  if(status==="processing"&&existingLeaseExpiresAtMs>now){
   if(!validOrbitOperationId(existingOperationId))throw new Error("RESTORE_OPERATION_MISMATCH");
   operationId=existingOperationId;state="processing";leaseExpiresAtMs=existingLeaseExpiresAtMs;return;
  }
  if(status!=="active"&&status!=="processing")throw new Error("TOKEN_USED");
  operationId=randomBytes(18).toString("base64url");state="processing";leaseExpiresAtMs=now+RESTORE_LEASE_MS;
  tx.update(tokenRef,{status:"processing",operationId,leaseExpiresAtMs,processingAt:FieldValue.serverTimestamp(),processingAtMs:now});
  tx.create(scopedCollection(db,AUDIT_COLLECTION).doc(),{userId:uid,appId:ORBITGATHER_APP_ID,installationId,action:"restore_begin",operationId,createdAt:FieldValue.serverTimestamp(),createdAtMs:now});
 });
 return{uid,installationId,operationId,state,leaseExpiresAtMs};
}

export async function finishOrbitRestore(token:string,operationId:string,success:boolean){
 if(!validOrbitRecoveryToken(token)||!validOrbitOperationId(operationId))throw new Error("INVALID_RECOVERY_INPUT");
 const db=adminDb();
 const tokenRef=scopedCollection(db,TOKEN_COLLECTION).doc(orbitRecoveryTokenHash(token));
 const now=Date.now();
 let uid="",installationId="";let idempotent=false;
 await db.runTransaction(async tx=>{
  const snap=await tx.get(tokenRef);const data=snap.data();uid=tokenUid(data,"restore");installationId=String(data?.installationId||"");
  const status=String(data?.status||"");const storedOperationId=String(data?.operationId||"");
  if(status==="consumed"&&success&&storedOperationId===operationId){idempotent=true;return}
  if(status!=="processing"||storedOperationId!==operationId)throw new Error("RESTORE_OPERATION_MISMATCH");
  const next=success?{status:"consumed",consumedAt:FieldValue.serverTimestamp(),consumedAtMs:now,leaseExpiresAtMs:0}:{status:Number(data?.expiresAtMs||0)>now?"active":"expired",operationId:null,leaseExpiresAtMs:0};
  tx.update(tokenRef,next);
  if(success)tx.set(profileRef(db,uid).collection(INSTALLATIONS_SUBCOLLECTION).doc(ownerDocId(installationId)),{updatedAt:FieldValue.serverTimestamp(),updatedAtMs:now,lastSeenAtMs:now,lastRestoredAtMs:now},{merge:true});
  tx.create(scopedCollection(db,AUDIT_COLLECTION).doc(),{userId:uid,appId:ORBITGATHER_APP_ID,installationId,action:success?"restore_complete":"restore_failed",operationId,createdAt:FieldValue.serverTimestamp(),createdAtMs:now});
 });
 return{uid,installationId,success,idempotent};
}

export async function revokeOrbitInstallation(uid:string,installationId:string){
 if(!validOrbitInstallationId(installationId))throw new Error("INVALID_RECOVERY_INPUT");
 const db=adminDb();const now=Date.now();
 const ownerRef=scopedCollection(db,OWNER_COLLECTION).doc(ownerDocId(installationId));
 const bindingRef=profileRef(db,uid).collection(INSTALLATIONS_SUBCOLLECTION).doc(ownerDocId(installationId));
 await db.runTransaction(async tx=>{
  const owner=await tx.get(ownerRef);
  if(!owner.exists||owner.data()?.active!==true||String(owner.data()?.userId||"")!==uid)throw new Error("BINDING_MISMATCH");
  tx.set(ownerRef,{active:false,updatedAt:FieldValue.serverTimestamp(),updatedAtMs:now,revokedAtMs:now},{merge:true});
  tx.set(bindingRef,{active:false,updatedAt:FieldValue.serverTimestamp(),updatedAtMs:now,revokedAtMs:now},{merge:true});
  tx.create(scopedCollection(db,AUDIT_COLLECTION).doc(),{userId:uid,appId:ORBITGATHER_APP_ID,installationId,action:"binding_revoked",createdAt:FieldValue.serverTimestamp(),createdAtMs:now});
 });
 return{installationId,active:false};
}
