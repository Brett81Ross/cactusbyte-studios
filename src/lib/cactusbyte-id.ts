import {useEffect,useState}from"react";
import {customTokenLogin,emailLogin,emailRegister,getDocument,setDocument,getSession,logoutRest,type Session}from"./firebase-rest";
import {entitlementIsActive,myEntitlements,type EntitlementRecord}from"./entitlements-cloud";

export type CactusByteRole="user"|"tester"|"moderator"|"owner";
export type CactusByteProfile={uid:string;email?:string|null;displayName?:string|null;role:CactusByteRole};
export type CactusByteUser={uid:string;email:string};

const OWNER_BACKUP_KEY="cb_owner_device_backup_v1";
let ownerSessionActive=false;

function hasOwnerBackup(){
 try{return Boolean(localStorage.getItem(OWNER_BACKUP_KEY))}catch{return false}
}

function ownerDeviceHeaders(){
 try{
  const token=localStorage.getItem(OWNER_BACKUP_KEY);
  return token?{"X-CactusByte-Owner-Device":token}:{};
 }catch{return {}}
}

function asOwner(p:CactusByteProfile){return {...p,role:"owner" as const}}

async function ownerVerified(s:Session){
 try{
  const r=await fetch("/api/owner/status",{
   headers:{Authorization:`Bearer ${s.idToken}`,...ownerDeviceHeaders()},
   cache:"no-store",
   credentials:"include"
  });
  if(r.ok)ownerSessionActive=true;
  return r.ok;
 }catch{return false}
}

async function profileFor(s:Session){
 const existing=await getDocument("profiles",s.uid);
 if(existing){
  const p=existing as unknown as CactusByteProfile;
  return ownerSessionActive||hasOwnerBackup()?asOwner(p):p;
 }
 const p:CactusByteProfile={uid:s.uid,email:s.email,displayName:(s.email||"CactusByte User").split("@")[0],role:ownerSessionActive||hasOwnerBackup()?"owner":"user"};
 if(p.role!=="owner")await setDocument("profiles",s.uid,p);
 return p;
}

async function track(s:Session,event:"login"|"register"|"owner_auto"){
 try{await fetch("/api/auth/track",{method:"POST",headers:{Authorization:`Bearer ${s.idToken}`,"Content-Type":"application/json"},body:JSON.stringify({event})})}catch{}
}

async function ownerAutoSession(){
 try{
  const r=await fetch("/api/owner/session",{cache:"no-store",credentials:"include",headers:ownerDeviceHeaders()});
  if(!r.ok)return null;
  const j=await r.json();
  if(typeof j.customToken!=="string")return null;
  const s=await customTokenLogin(j.customToken);
  ownerSessionActive=true;
  await track(s,"owner_auto");
  return s;
 }catch{return null}
}

function announceSession(){if(typeof window!=="undefined")window.dispatchEvent(new Event("cactusbyte:session"))}

export function useCactusByteId(){
 const[user,setUser]=useState<CactusByteUser|null>(null),[profile,setProfile]=useState<CactusByteProfile|null>(null),[entitlements,setEntitlements]=useState<EntitlementRecord[]>([]),[busy,setBusy]=useState(true);

 async function refreshEntitlements(){
  try{const rows=await myEntitlements();setEntitlements(rows);return rows}catch{setEntitlements([]);return[]}
 }

 async function syncOwnerRole(){
  let s=getSession();
  if(s&&(ownerSessionActive||hasOwnerBackup())){
   ownerSessionActive=true;
   setProfile(p=>p?asOwner(p):p);
   return true;
  }
  if(!s){
   s=await ownerAutoSession();
   if(!s)return false;
   setUser({uid:s.uid,email:s.email});
   const loaded=await profileFor(s);
   setProfile(asOwner(loaded));
   await refreshEntitlements();
   announceSession();
   return true;
  }
  const owner=await ownerVerified(s);
  if(owner)setProfile(p=>p?asOwner(p):p);
  return owner;
 }

 useEffect(()=>{
  let alive=true;
  void(async()=>{
   const ownerSession=await ownerAutoSession();
   let s=ownerSession;
   if(!s)s=getSession();
   if(!alive)return;
   if(!s){setBusy(false);return}
   setUser({uid:s.uid,email:s.email});
   try{
    const loaded=await profileFor(s);
    const owner=Boolean(ownerSession)||ownerSessionActive||hasOwnerBackup()||await ownerVerified(s);
    if(!alive)return;
    setProfile(owner?asOwner(loaded):loaded);
    await refreshEntitlements();
    announceSession();
   }finally{if(alive)setBusy(false)}
  })();
  return()=>{alive=false}
 },[]);

 useEffect(()=>{
  const refresh=()=>void syncOwnerRole();
  window.addEventListener("focus",refresh);
  window.addEventListener("pageshow",refresh);
  document.addEventListener("visibilitychange",refresh);
  const t=window.setTimeout(refresh,350);
  return()=>{
   window.clearTimeout(t);
   window.removeEventListener("focus",refresh);
   window.removeEventListener("pageshow",refresh);
   document.removeEventListener("visibilitychange",refresh);
  }
 },[]);

 async function login(email:string,password:string){
  setBusy(true);
  try{
   const s=await emailLogin(email,password);await track(s,"login");setUser({uid:s.uid,email:s.email});
   const loaded=await profileFor(s);const owner=hasOwnerBackup()||await ownerVerified(s);if(owner)ownerSessionActive=true;setProfile(owner?asOwner(loaded):loaded);
   await refreshEntitlements();announceSession();return{uid:s.uid,email:s.email}
  }finally{setBusy(false)}
 }

 async function register(email:string,password:string){
  setBusy(true);
  try{
   const s=await emailRegister(email,password);await track(s,"register");setUser({uid:s.uid,email:s.email});
   const loaded=await profileFor(s);const owner=hasOwnerBackup()||await ownerVerified(s);if(owner)ownerSessionActive=true;setProfile(owner?asOwner(loaded):loaded);
   await refreshEntitlements();announceSession();return{uid:s.uid,email:s.email}
  }finally{setBusy(false)}
 }

 async function loginWithGoogle(){throw new Error("Google sign-in is configured in Firebase and will be enabled after the email/password security test.")}
 async function logout(){logoutRest();ownerSessionActive=false;setUser(null);setProfile(null);setEntitlements([]);announceSession()}
 function hasEntitlement(appId:string){return entitlements.some(x=>x.appId===appId&&entitlementIsActive(x))}

 return{configured:true,user,profile,entitlements,busy,isOwner:ownerSessionActive||hasOwnerBackup()||profile?.role==="owner",hasEntitlement,refreshEntitlements,login,register,loginWithGoogle,logout}
}
