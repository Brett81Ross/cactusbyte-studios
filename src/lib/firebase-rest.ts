import {AUTH_BASE,FIREBASE_API_KEY,FIRESTORE_BASE} from"./firebase";
export type Session={idToken:string;refreshToken:string;expiresIn:string;uid:string;email:string};
const SK="cb-firebase-session-v13";
const REFRESH_BASE="https://securetoken.googleapis.com/v1/token";
let refreshInFlight:Promise<Session|null>|null=null;

export const getSession=():Session|null=>{if(typeof window==="undefined")return null;try{const v=localStorage.getItem(SK);return v?JSON.parse(v):null}catch{return null}};
export const saveSession=(s:Session|null)=>{if(typeof window==="undefined")return;s?localStorage.setItem(SK,JSON.stringify(s)):localStorage.removeItem(SK)};

function tokenExpiry(idToken:string){
 try{
  const part=idToken.split(".")[1];
  if(!part)return 0;
  const normalized=part.replace(/-/g,"+").replace(/_/g,"/");
  const padded=normalized+"=".repeat((4-normalized.length%4)%4);
  const payload=JSON.parse(atob(padded));
  return Number(payload?.exp||0)*1000;
 }catch{return 0}
}

async function authPost(path:string,body:unknown){const r=await fetch(`${AUTH_BASE}/${path}?key=${FIREBASE_API_KEY}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const j=await r.json();if(!r.ok)throw new Error(j?.error?.message||"Authentication failed");return j}
export async function emailLogin(email:string,password:string):Promise<Session>{const j=await authPost("accounts:signInWithPassword",{email,password,returnSecureToken:true});const s={idToken:j.idToken,refreshToken:j.refreshToken,expiresIn:j.expiresIn,uid:j.localId,email:j.email};saveSession(s);return s}
export async function emailRegister(email:string,password:string):Promise<Session>{const j=await authPost("accounts:signUp",{email,password,returnSecureToken:true});const s={idToken:j.idToken,refreshToken:j.refreshToken,expiresIn:j.expiresIn,uid:j.localId,email:j.email};saveSession(s);return s}
export async function emailPasswordReset(email:string){await authPost("accounts:sendOobCode",{requestType:"PASSWORD_RESET",email});return true}
export async function customTokenLogin(customToken:string):Promise<Session>{const j=await authPost("accounts:signInWithCustomToken",{token:customToken,returnSecureToken:true});let email=String(j.email||"");if(!email){try{const lookup=await authPost("accounts:lookup",{idToken:j.idToken});email=String(lookup?.users?.[0]?.email||"")}catch{}}const s={idToken:j.idToken,refreshToken:j.refreshToken,expiresIn:j.expiresIn,uid:j.localId,email};saveSession(s);return s}

export async function getFreshSession():Promise<Session|null>{
 const current=getSession();
 if(!current)return null;
 const expiresAt=tokenExpiry(current.idToken);
 if(expiresAt>Date.now()+5*60_000)return current;
 if(!current.refreshToken)return expiresAt>Date.now()+30_000?current:null;
 if(refreshInFlight)return refreshInFlight;
 refreshInFlight=(async()=>{
  try{
   const body=new URLSearchParams({grant_type:"refresh_token",refresh_token:current.refreshToken});
   const r=await fetch(`${REFRESH_BASE}?key=${FIREBASE_API_KEY}`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});
   const j=await r.json();
   if(!r.ok||!j?.id_token)throw new Error(j?.error?.message||"Session refresh failed");
   const next:Session={idToken:String(j.id_token),refreshToken:String(j.refresh_token||current.refreshToken),expiresIn:String(j.expires_in||current.expiresIn||"3600"),uid:String(j.user_id||current.uid),email:current.email};
   saveSession(next);
   return next;
  }catch{
   const fallbackExpiry=tokenExpiry(current.idToken);
   return fallbackExpiry>Date.now()+30_000?current:null;
  }finally{refreshInFlight=null}
 })();
 return refreshInFlight;
}

export function logoutRest(){saveSession(null)}
const enc=(v:any):any=>v===null||v===undefined?{nullValue:null}:typeof v==="string"?{stringValue:v}:typeof v==="boolean"?{booleanValue:v}:typeof v==="number"?(Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v}):Array.isArray(v)?{arrayValue:{values:v.map(enc)}}:{mapValue:{fields:Object.fromEntries(Object.entries(v).map(([k,x])=>[k,enc(x)]))}};
const dec=(v:any):any=>v?.stringValue??(v?.integerValue!==undefined?Number(v.integerValue):v?.doubleValue??v?.booleanValue??v?.timestampValue??(v?.nullValue!==undefined?null:v?.arrayValue?.values?.map(dec)??(v?.mapValue?.fields?Object.fromEntries(Object.entries(v.mapValue.fields).map(([k,x])=>[k,dec(x)])):undefined)));
const fields=(o:Record<string,any>)=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,enc(v)]));
const decodeDoc=(d:any)=>({id:String(d.name||"").split("/").pop(),...Object.fromEntries(Object.entries(d.fields||{}).map(([k,v])=>[k,dec(v)]))});
const h=async()=>{const s=await getFreshSession();if(!s)throw new Error("Sign in with CactusByte ID™ first.");return{Authorization:`Bearer ${s.idToken}`,"Content-Type":"application/json"}};
export async function getDocument(collection:string,id:string){const r=await fetch(`${FIRESTORE_BASE}/${collection}/${encodeURIComponent(id)}`,{headers:await h(),cache:"no-store"});if(r.status===404)return null;const j=await r.json();if(!r.ok)throw new Error(j?.error?.message||"Firestore read failed");return decodeDoc(j)}
export async function setDocument(collection:string,id:string,data:Record<string,any>){const r=await fetch(`${FIRESTORE_BASE}/${collection}/${encodeURIComponent(id)}`,{method:"PATCH",headers:await h(),body:JSON.stringify({fields:fields(data)})});const j=await r.json();if(!r.ok)throw new Error(j?.error?.message||"Firestore write failed");return decodeDoc(j)}
export async function addDocument(collection:string,data:Record<string,any>){const r=await fetch(`${FIRESTORE_BASE}/${collection}`,{method:"POST",headers:await h(),body:JSON.stringify({fields:fields({...data,createdAt:new Date().toISOString()})})});const j=await r.json();if(!r.ok)throw new Error(j?.error?.message||"Firestore write failed");return decodeDoc(j)}
export async function patchDocument(collection:string,id:string,data:Record<string,any>){return setDocument(collection,id,data)}
export async function runQuery(collectionId:string,field?:string,value?:string,orderField?:string,direction:"ASCENDING"|"DESCENDING"="DESCENDING",limit=100){const sq:any={from:[{collectionId}],limit};if(field!==undefined&&value!==undefined)sq.where={fieldFilter:{field:{fieldPath:field},op:"EQUAL",value:{stringValue:value}}};if(orderField)sq.orderBy=[{field:{fieldPath:orderField},direction}];const r=await fetch(`${FIRESTORE_BASE}:runQuery`,{method:"POST",headers:await h(),body:JSON.stringify({structuredQuery:sq})});const j=await r.json();if(!r.ok)throw new Error(j?.error?.message||"Firestore query failed");return j.filter((x:any)=>x.document).map((x:any)=>decodeDoc(x.document))}
