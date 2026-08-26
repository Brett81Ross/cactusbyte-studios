import {createHash,timingSafeEqual} from "node:crypto";
import {adminAuth,adminDb} from "./firebase-admin";

const TESTER_CODE_HASHES=[
 "9823b6c5f34ba093abe75041ab6b48b774232c569d647c7f8a8060da97075994",
 "e76bcb19aed193e3a1d964e141aefc4048abf5c8aa6fb8eabf3e755b1d66b11f",
 "31b4eee59ebdf8b2e2ba5e64d10c6a38edaad4744dc97f77682a187096fcf62d",
 "9cc1f182381b86e45f81297fec627a1923b60192f99ca62ba6abff004bc53a2e",
 "69cca7527187747353cf5355376716b76f5bedf66261140648e8ac85bb701aab",
 "18ba4b1b5d4a9983f4c8ac29cbeec6d4142b08e4cf4838b54e4c1e50cca130b9",
 "e6523334ac302d18c0d1505484b7ca022e5c19d913edf432cc03b01a77dc2403",
 "2a2199a98c40cdf537f18c8b7ea83da2cbfa6f277882ee235b0c536bd31bb02e"
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
