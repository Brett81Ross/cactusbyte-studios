import {useEffect,useState}from"react";
import {customTokenLogin,emailLogin,emailRegister,getDocument,setDocument,getFreshSession,logoutRest,type Session}from"./firebase-rest";
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
function ownerShell(s:Session):CactusByteProfile{return{uid:s.uid,email:s.email,displayName:(s.email||"CactusByte Owner").split("@")[0],role:"owner"}}
const wait=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));

async function ownerVerified(s:Session){
 try{
  const fresh=await getFreshSession();
  const session=fresh?.uid===s.uid?fresh:s;
  const r=await fetch("/api/owner/status",{
   headers:{Authorization:`Bearer ${session.idToken}`,...ownerDeviceHeaders()},
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

async function ownerAutoSessionOnce(){
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

async function restoreTrustedOwner(){
 const attempts=hasOwnerBackup()?3:2;
 for(let i=0;i<attempts;i++){
  const s=await ownerAutoSessionOnce();
  if(s)return s;
  if(i<attempts-1)await wait(i===0?250:650);
 }
 return null;
}

function announceSession(){if(typeof window!=="undefined")window.dispatchEvent(new Event("cactusbyte:session"))}

export function useCactusByteId(){
 const[user,setUser]=useState<CactusByteUser|null>(null),[profile,setProfile]=useState<CactusByteProfile|null>(null),[entitlements,setEntitlements]=useState<EntitlementRecord[]>([]),[busy,setBusy]=useState(true);

 async function refreshEntitlements(){
  try{const rows=await myEntitlements();setEntitlements(rows);return rows}catch{setEntitlements([]);return[]}
 }

 async function applyOwnerSession(s:Session){
  const loaded=await profileFor(s);
  setUser({uid:s.uid,email:s.email});
  setProfile(asOwner(loaded));
  await refreshEntitlements();
  announceSession();
 }

 async function syncOwnerRole(){
  let s=await getFreshSession();
  if(s&&ownerSessionActive){
   setUser({uid:s.uid,email:s.email});
   setProfile(p=>p?asOwner(p):ownerShell(s!));
   return true;
  }
  if(s&&await ownerVerified(s)){
   setUser({uid:s.uid,email:s.email});
   setProfile(p=>p?asOwner(p):ownerShell(s!));
   return true;
  }
  const restored=await restoreTrustedOwner();
  if(!restored)return false;
  await applyOwnerSession(restored);
  return true;
 }

 useEffect(()=>{
  let alive=true;
  void(async()=>{
   try{
    // Trusted-device restoration is the primary owner path. A saved Firebase
    // session is only a fallback for ordinary CactusByte ID continuity.
    const ownerSession=await restoreTrustedOwner();
    let s=ownerSession;
    if(!s)s=await getFreshSession();
    if(!alive||!s)return;
    const loaded=await profileFor(s);
    const owner=Boolean(ownerSession)||await ownerVerified(s);
    if(!alive)return;
    setUser({uid:s.uid,email:s.email});
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
   const s=await emailLogin(email,password);await track(s,"login");
   const loaded=await profileFor(s);const owner=await ownerVerified(s);if(owner)ownerSessionActive=true;
   setUser({uid:s.uid,email:s.email});setProfile(owner?asOwner(loaded):loaded);
   await refreshEntitlements();announceSession();return{uid:s.uid,email:s.email}
  }finally{setBusy(false)}
 }

 async function register(email:string,password:string){
  setBusy(true);
  try{
   const s=await emailRegister(email,password);await track(s,"register");
   const loaded=await profileFor(s);const owner=await ownerVerified(s);if(owner)ownerSessionActive=true;
   setUser({uid:s.uid,email:s.email});setProfile(owner?asOwner(loaded):loaded);
   await refreshEntitlements();announceSession();return{uid:s.uid,email:s.email}
  }finally{setBusy(false)}
 }

 async function loginWithGoogle(){throw new Error("Google sign-in is configured in Firebase and will be enabled after the email/password security test.")}
 async function logout(){logoutRest();ownerSessionActive=false;setUser(null);setProfile(null);setEntitlements([]);announceSession()}
 function hasEntitlement(appId:string){return entitlements.some(x=>x.appId===appId&&entitlementIsActive(x))}

 return{configured:true,user,profile,entitlements,busy,isOwner:ownerSessionActive||hasOwnerBackup()||profile?.role==="owner",hasEntitlement,refreshEntitlements,login,register,loginWithGoogle,logout}
}
