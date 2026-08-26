import {createHmac,timingSafeEqual} from "node:crypto";

const PREFIX="cb1";

function signingSecret(){
 const value=(process.env.STRIPE_CHECKOUT_SIGNING_SECRET||"").trim();
 if(!value)throw new Error("Stripe checkout signing secret is not configured.");
 return value;
}

const encode=(value:string)=>Buffer.from(value,"utf8").toString("base64url");
const decode=(value:string)=>Buffer.from(value,"base64url").toString("utf8");

function signature(payload:string){
 return createHmac("sha256",signingSecret()).update(payload).digest("base64url");
}

export function createCheckoutReference(uid:string,appId:string){
 const uidPart=encode(uid);
 const appPart=encode(appId);
 const payload=`${uidPart}.${appPart}`;
 return `${PREFIX}.${payload}.${signature(payload)}`;
}

export function verifyCheckoutReference(reference:string){
 const [prefix,uidPart,appPart,supplied,...extra]=reference.split(".");
 if(prefix!==PREFIX||!uidPart||!appPart||!supplied||extra.length)return null;
 const payload=`${uidPart}.${appPart}`;
 const expected=signature(payload);
 const a=Buffer.from(supplied);
 const b=Buffer.from(expected);
 if(a.length!==b.length||!timingSafeEqual(a,b))return null;
 try{
  const uid=decode(uidPart).trim();
  const appId=decode(appPart).trim();
  if(!uid||!appId)return null;
  return{uid,appId};
 }catch{return null}
}
