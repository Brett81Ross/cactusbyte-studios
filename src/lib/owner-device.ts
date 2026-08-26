import {createHmac,timingSafeEqual} from "node:crypto";

export const OWNER_DEVICE_COOKIE="cb_owner_device_v1";
export const OWNER_DEVICE_HEADER="x-cactusbyte-owner-device";
export const OWNER_DEVICE_MAX_AGE=60*60*24*365*5;
const PAYLOAD="cactusbyte-owner-device-v1";

function signingSecret(){
 const value=(process.env.OWNER_DEVICE_SIGNING_SECRET||"").trim();
 if(!value)throw new Error("Owner device signing secret is not configured.");
 return value;
}

function digest(value:string){return createHmac("sha256",signingSecret()).update(value).digest("base64url")}
function safeEqual(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)}

export function createOwnerDeviceToken(){return `${PAYLOAD}.${digest(PAYLOAD)}`}
export function verifyOwnerDeviceToken(token:string){
 const dot=token.lastIndexOf(".");
 if(dot<1)return false;
 const payload=token.slice(0,dot),signature=token.slice(dot+1);
 return payload===PAYLOAD&&safeEqual(signature,digest(payload));
}

export function verifyOwnerSetupSecret(supplied:string){
 const expected=(process.env.OWNER_DEVICE_SETUP_SECRET||"").trim();
 if(!expected||!supplied)return false;
 return safeEqual(supplied,expected);
}

export function requestCookie(request:Request,name:string){
 const raw=request.headers.get("cookie")||"";
 for(const part of raw.split(";")){
  const [key,...rest]=part.trim().split("=");
  if(key===name)return decodeURIComponent(rest.join("="));
 }
 return"";
}

export function ownerDeviceTrusted(request:Request){
 const cookie=requestCookie(request,OWNER_DEVICE_COOKIE);
 try{if(cookie&&verifyOwnerDeviceToken(cookie))return true}catch{}
 const backup=(request.headers.get(OWNER_DEVICE_HEADER)||"").trim();
 try{return Boolean(backup)&&verifyOwnerDeviceToken(backup)}catch{return false}
}

export function ownerCookieHeader(token:string){
 const secure=process.env.NODE_ENV==="production"?"; Secure":"";
 return `${OWNER_DEVICE_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${OWNER_DEVICE_MAX_AGE}${secure}`;
}
