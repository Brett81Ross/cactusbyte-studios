"use client";

import {useEffect,useState} from "react";
import {emailLogin,emailPasswordReset,emailRegister,getFreshSession,getSession,type Session} from "../../lib/firebase-rest";

type Mode="claim"|"restore";

export default function OrbitGatherRecoveryPage(){
 const[mode,setMode]=useState<Mode>("restore");
 const[session,setSession]=useState<Session|null>(null);
 const[email,setEmail]=useState("");
 const[password,setPassword]=useState("");
 const[create,setCreate]=useState(false);
 const[busy,setBusy]=useState(false);
 const[message,setMessage]=useState("");
 const[error,setError]=useState("");

 useEffect(()=>{
  const requested=new URLSearchParams(window.location.search).get("mode");
  setMode(requested==="claim"?"claim":"restore");
  setSession(getSession());
 },[]);

 const authenticate=async()=>{
  setBusy(true);setError("");setMessage("");
  try{
   const next=create?await emailRegister(email.trim(),password):await emailLogin(email.trim(),password);
   setSession(next);setMessage(create?"CactusByte ID created. You can continue with OrbitGather recovery.":"Signed in. You can continue with OrbitGather recovery.");
  }catch(e){setError(e instanceof Error?e.message:"Authentication failed.")}
  finally{setBusy(false)}
 };

 const reset=async()=>{
  if(!email.trim()){setError("Enter your CactusByte ID email first.");return}
  setBusy(true);setError("");setMessage("");
  try{await emailPasswordReset(email.trim());setMessage("Password-reset email requested. Follow the email, then return here and sign in.")}
  catch(e){setError(e instanceof Error?e.message:"Password reset failed.")}
  finally{setBusy(false)}
 };

 const continueRecovery=async()=>{
  setBusy(true);setError("");setMessage("");
  try{
   const fresh=await getFreshSession();
   if(!fresh)throw new Error("Sign in with CactusByte ID first.");
   setSession(fresh);
   const response=await fetch("/api/orbitgather/recovery/issue",{
    method:"POST",headers:{Authorization:`Bearer ${fresh.idToken}`,"Content-Type":"application/json"},
    body:JSON.stringify({purpose:mode}),cache:"no-store"
   });
   const data=await response.json().catch(()=>({}));
   if(!response.ok||!data?.launchUrl)throw new Error(String(data?.error||"Recovery link could not be created."));
   window.location.assign(String(data.launchUrl));
  }catch(e){setError(e instanceof Error?e.message:"Recovery could not be started.");setBusy(false)}
 };

 const isClaim=mode==="claim";
 return <main style={{minHeight:"100dvh",background:"#050610",color:"#f5f7ff",padding:"24px 16px",fontFamily:"system-ui,-apple-system,sans-serif"}}>
  <section style={{width:"min(700px,100%)",margin:"0 auto",border:"1px solid rgba(127,115,255,.25)",borderRadius:24,padding:"clamp(20px,5vw,32px)",background:"linear-gradient(155deg,#11162b,#080b16 72%)",boxShadow:"0 28px 90px rgba(0,0,0,.5)"}}>
   <div style={{fontSize:11,fontWeight:950,letterSpacing:".16em",color:"#9b92ff",textTransform:"uppercase"}}>Cactus🌵Byte Studios™ · Secure Recovery</div>
   <h1 style={{fontSize:"clamp(1.8rem,7vw,2.8rem)",lineHeight:1.02,margin:"12px 0 10px"}}>OrbitGather™ Cloud Identity</h1>
   <p style={{color:"#adb5d3",lineHeight:1.6,margin:0}}>{isClaim?"Protect this existing OrbitGather cloud installation by linking its current installation UUID to your CactusByte ID before the Android signing migration or any reinstall.":"Restore a previously protected OrbitGather cloud installation to this clean app while keeping its original cloud records attached to the same installation UUID."}</p>

   <div style={{marginTop:18,padding:14,borderRadius:14,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.025)",color:"#c0c7df",fontSize:14,lineHeight:1.55}}>
    {isClaim?<><strong style={{color:"#f5f7ff"}}>Important:</strong> start this from the legacy OrbitGather install that still has access to its cloud data. Its current installation secret is verified only by OrbitGather and is never sent to CactusByte.</>:<><strong style={{color:"#f5f7ff"}}>Restore rule:</strong> this works only after that installation was protected by this same CactusByte ID. Restore rotates the device secret instead of copying the old one.</>}
   </div>

   {!session?<div style={{display:"grid",gap:10,marginTop:20}}>
    <input aria-label="CactusByte ID email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="CactusByte ID email" style={field}/>
    <input aria-label="CactusByte ID password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" style={field}/>
    <button disabled={busy} onClick={()=>void authenticate()} style={primary}>{busy?"Working…":create?"Create CactusByte ID":"Sign In"}</button>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button disabled={busy} onClick={()=>setCreate(v=>!v)} style={secondary}>{create?"I already have an ID":"Create an ID"}</button><button disabled={busy} onClick={()=>void reset()} style={secondary}>Reset password</button></div>
   </div>:<div style={{marginTop:20}}>
    <div style={{padding:14,borderRadius:14,background:"rgba(127,115,255,.08)",border:"1px solid rgba(127,115,255,.18)",color:"#d8d4ff"}}>Signed in as <strong>{session.email||session.uid}</strong></div>
    <button disabled={busy} onClick={()=>void continueRecovery()} style={{...primary,width:"100%",marginTop:12}}>{busy?"Preparing secure handoff…":isClaim?"Protect This OrbitGather Installation":"Restore My OrbitGather Cloud Identity"}</button>
   </div>}
   {message&&<p role="status" style={{marginTop:14,color:"#8fffd4",fontWeight:700}}>{message}</p>}
   {error&&<p role="alert" style={{marginTop:14,color:"#ff9b9b",fontWeight:750}}>{error}</p>}
   <p style={{margin:"20px 0 0",color:"#7c849f",fontSize:12,lineHeight:1.55}}>No cloud rows are copied. No old device secret is exported. Recovery links expire quickly and can be used only once.</p>
  </section>
 </main>;
}

const field={width:"100%",minHeight:50,border:"1px solid rgba(127,115,255,.2)",borderRadius:12,background:"#090d1b",color:"#f5f7ff",padding:"12px 13px",fontSize:16} as const;
const primary={minHeight:50,border:0,borderRadius:12,background:"linear-gradient(#9b92ff,#7066dd)",color:"#080913",padding:"0 16px",fontWeight:900,fontSize:16,cursor:"pointer"} as const;
const secondary={minHeight:44,border:"1px solid rgba(127,115,255,.18)",borderRadius:12,background:"rgba(255,255,255,.035)",color:"#e8e9f5",padding:"0 14px",fontWeight:750,cursor:"pointer"} as const;
