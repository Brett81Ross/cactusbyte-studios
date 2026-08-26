import {createHash,timingSafeEqual} from "node:crypto";
import {adminAuth,adminDb} from "./firebase-admin";

const TESTER_CODE_HASHES=[
 "9823b6c5f34ba093abe75041ab6b48b774232c569d647c7f8a8060da97075994",
 "e76bcb19aed193e3a1d964e141aefc4048abf5c8aa6fb8eabf3e755b1d66b11f",
 "31b4eee59ebdf8b2e2ba5e64d10c6a38edaad4744dc97f77682a187096fcf62d"
] as const;

export type TesterIdentity={uid:string;email:string};

export function normalizeTesterCode(value:string){return value.trim().toUpperCase().replace(/[^A-Z0-9]/g,"")}
export function testerCodeHash(value:string){return createHash("sha256").update(normalizeTesterCode(value)).digest("hex")}
export function validTesterCodeHash(hash:string){
 if(!/^[a-f0-9]{64}$/.test(hash))return false;
 const candidate=Buffer.from(hash,"hex");
 return TESTER_CODE_HASHES.some(expected=>timingSafeEqual(candidate,Buffer.from(expected,"hex")));
}

export async function testerIdentity(request:Request):Promise<TesterIdentity>{
 const auth=request.headers.get("authorization")||"";
 const token=auth.startsWith("Bearer ")?auth.slice(7).trim():"";
 if(!token)throw new Error("AUTH_REQUIRED");
 const decoded=await adminAuth().verifyIdToken(token);
 return{uid:decoded.uid,email:String(decoded.email||"")};
}

export async function testerPassActive(uid:string){
 const snap=await adminDb().collection("testerPasses").doc(uid).get();
 return snap.exists&&snap.data()?.active===true&&snap.data()?.status==="lifetime";
}
