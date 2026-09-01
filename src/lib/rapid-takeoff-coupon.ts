import {createHash,timingSafeEqual} from "node:crypto";

const RAPID_TAKEOFF_COUPON_HASHES=[
 "14497a385fe0e87c97c767680bc543e54373a9cb67c3d35a2cf19badbb214033"
] as const;

export function rapidTakeoffCouponHash(value:string){
 return createHash("sha256").update(value.trim().toUpperCase().replace(/[\s-]+/g,"")).digest("hex");
}

export function validRapidTakeoffCouponHash(value:string){
 const candidate=Buffer.from(value,"hex");
 return RAPID_TAKEOFF_COUPON_HASHES.some(hash=>{
  const expected=Buffer.from(hash,"hex");
  return candidate.length===expected.length&&timingSafeEqual(candidate,expected);
 });
}
