"use client";

import {useEffect,useState} from "react";
import {emailLogin,emailPasswordReset,emailRegister,getFreshSession,getSession,type Session} from "../../lib/firebase-rest";

type Mode="claim"|"restore";

export default function RapidTakeoffRecoveryPage(){
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
   setSession(next);setMessage(create?"CactusByte ID created. You can continue with Rapid Takeoff recovery.":"Signed in. You can continue with Rapid Takeoff recovery.");
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
   const response=await fetch("/api/rapid-takeoff/recovery/issue",{
    method:"POST",headers:{Authorization:`Bearer ${fresh.idToken}`,"Content-Type":"application/json"},
    body:JSON.stringify({purpose:mode}),cache:"no-store"
   });
   const data=await response.json().catch(()=>({}));
   if(!response.ok||!data?.launchUrl)throw new Error(String(data?.error||"Recovery link could not be created."));
   window.location.assign(String(data.launchUrl));
  }catch(e){setError(e instanceof Error?e.message:"Recovery could not be started.");setBusy(false)}
 };

 const isClaim=mode==="claim";
 return <main style={{minHeight:"100dvh",background:"#050807",color:"#f4fffb",padding:"24px 16px",fontFamily:"system-ui,-apple-system,sans-serif"}}>
  <section style={{width:"min(680px,100%)",margin:"0 auto",border:"1px solid rgba(103,255,225,.22)",borderRadius:24,padding:"clamp(20px,5vw,32px)",background:"linear-gradient(155deg,#0d1c18,#07100e 72%)",boxShadow:"0 28px 90px rgba(0,0,0,.5)"}}>
   <div style={{fontSize:11,fontWeight:950,letterSpacing:".16em",color:"#67ffe1",textTransform:"uppercase"}}>Cactus🌵Byte Studios™ · Secure Recovery</div>
   <h1 style={{fontSize:"clamp(1.8rem,7vw,2.8rem)",lineHeight:1.02,margin:"12px 0 10px"}}>Rapid Takeoff™ Pro</h1>
   <p style={{color:"#a9c2bb",lineHeight:1.6,margin:0}}>{isClaim?"Protect the lifetime Pro access already active on this device by linking it to your CactusByte ID before the Android signing migration or any reinstall.":"Restore previously linked lifetime Rapid Takeoff Pro access to this clean installation using your CactusByte ID."}</p>

   <div style={{marginTop:18,padding:14,borderRadius:14,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.025)",color:"#b9cec8",fontSize:14,lineHeight:1.55}}>
    {isClaim?<><strong style={{color:"#f4fffb"}}>Important:</strong> continue from the same Rapid Takeoff app/WebView where Pro currently shows active. The old Pro cookie is checked before ownership can be linked.</>:<><strong style={{color:"#f4fffb"}}>Restore rule:</strong> this works only after lifetime Pro has been linked to this CactusByte ID or lifetime VIP tester access is active.</>}
   </div>

   {!session?<div style={{display:"grid",gap:10,marginTop:20}}>
    <input aria-label="CactusByte ID email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="CactusByte ID email" style={field}/>
    <input aria-label="CactusByte ID password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" style={field}/>
    <button disabled={busy} onClick={()=>void authenticate()} style={primary}>{busy?"Working…":create?"Create CactusByte ID":"Sign In"}</button>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button disabled={busy} onClick={()=>setCreate(v=>!v)} style={secondary}>{create?"I already have an ID":"Create an ID"}</button><button disabled={busy} onClick={()=>void reset()} style={secondary}>Reset password</button></div>
   </div>:<div style={{marginTop:20}}>
    <div style={{padding:14,borderRadius:14,background:"rgba(103,255,225,.07)",border:"1px solid rgba(103,255,225,.16)",color:"#bff7eb"}}>Signed in as <strong>{session.email||session.uid}</strong></div>
    <button disabled={busy} onClick={()=>void continueRecovery()} style={{...primary,width:"100%",marginTop:12}}>{busy?"Preparing secure handoff…":isClaim?"Link Current Pro to This ID":"Restore My Pro Access"}</button>
   </div>}
   {message&&<p role="status" style={{marginTop:14,color:"#7dffcf",fontWeight:700}}>{message}</p>}
   {error&&<p role="alert" style={{marginTop:14,color:"#ff9b9b",fontWeight:750}}>{error}</p>}
   <p style={{margin:"20px 0 0",color:"#718b84",fontSize:12,lineHeight:1.55}}>No coupon is reused. No Pro cookie is exported. Recovery links expire quickly and can be used only once.</p>
  </section>
 </main>;
}

const field={width:"100%",minHeight:50,border:"1px solid rgba(103,255,225,.18)",borderRadius:12,background:"#08100e",color:"#f2f7f5",padding:"12px 13px",fontSize:16} as const;
const primary={minHeight:50,border:0,borderRadius:12,background:"linear-gradient(#0bcfbb,#07988b)",color:"#02100d",padding:"0 16px",fontWeight:900,fontSize:16,cursor:"pointer"} as const;
const secondary={minHeight:44,border:"1px solid rgba(103,255,225,.16)",borderRadius:12,background:"rgba(255,255,255,.035)",color:"#dff8f1",padding:"0 14px",fontWeight:750,cursor:"pointer"} as const;
