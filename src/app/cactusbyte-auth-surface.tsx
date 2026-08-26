"use client";

import {useEffect,useState} from "react";
import {emailLogin,emailPasswordReset,emailRegister,getSession,logoutRest,type Session} from "../lib/firebase-rest";

type Mode="signin"|"create"|"reset";

const fieldStyle={width:"100%",minHeight:50,border:"1px solid rgba(103,255,225,.18)",borderRadius:12,background:"#08100e",color:"#f2f7f5",padding:"12px 13px",fontSize:16} as const;
const buttonStyle={minHeight:48,border:"1px solid rgba(103,255,225,.2)",borderRadius:12,background:"rgba(255,255,255,.035)",color:"#f2f7f5",padding:"0 14px",fontWeight:750,fontSize:"1rem",cursor:"pointer"} as const;
const primaryStyle={...buttonStyle,background:"linear-gradient(#0bcfbb,#07988b)",color:"#02100d",borderColor:"transparent"} as const;

function friendlyAuthError(error:unknown){
 const raw=error instanceof Error?error.message:String(error);
 if(raw.includes("EMAIL_EXISTS"))return "That email already has a CactusByte ID. Choose Sign In instead.";
 if(raw.includes("WEAK_PASSWORD"))return "Choose a password with at least 6 characters.";
 if(raw.includes("INVALID_LOGIN_CREDENTIALS")||raw.includes("INVALID_PASSWORD")||raw.includes("EMAIL_NOT_FOUND"))return "That email/password combination did not match a CactusByte ID.";
 if(raw.includes("TOO_MANY_ATTEMPTS"))return "Too many attempts. Wait a moment and try again.";
 if(raw.includes("INVALID_EMAIL"))return "Enter a valid email address.";
 return raw||"Authentication failed. Please try again.";
}

async function track(session:Session,event:"login"|"register"){
 try{await fetch("/api/auth/track",{method:"POST",headers:{Authorization:`Bearer ${session.idToken}`,"Content-Type":"application/json"},body:JSON.stringify({event})})}catch{}
}

export default function CactusByteAuthSurface(){
 const[open,setOpen]=useState(false);
 const[mode,setMode]=useState<Mode>("signin");
 const[email,setEmail]=useState("");
 const[password,setPassword]=useState("");
 const[showPassword,setShowPassword]=useState(false);
 const[busy,setBusy]=useState(false);
 const[message,setMessage]=useState("");
 const[error,setError]=useState("");
 const[session,setSession]=useState<Session|null>(null);
 const[testerCode,setTesterCode]=useState("");
 const[testerActive,setTesterActive]=useState<boolean|null>(null);
 const[testerBusy,setTesterBusy]=useState(false);

 useEffect(()=>{
  const refresh=()=>setSession(getSession());
  refresh();
  const intercept=(event:MouseEvent)=>{
   const target=event.target as HTMLElement|null;
   const button=target?.closest("button");
   if(!button||button.closest("[data-cb-auth-surface]"))return;
   const label=button.textContent?.trim()||"";
   if(label!=="CactusByte ID"&&!label.startsWith("Sign In"))return;
   event.preventDefault();
   event.stopPropagation();
   event.stopImmediatePropagation();
   refresh();
   setMode("signin");
   setError("");
   setMessage("");
   setOpen(true);
  };
  window.addEventListener("click",intercept,true);
  window.addEventListener("pageshow",refresh);
  return()=>{window.removeEventListener("click",intercept,true);window.removeEventListener("pageshow",refresh)};
 },[]);

 useEffect(()=>{
  if(!open)return;
  const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};
  window.addEventListener("keydown",close);
  return()=>window.removeEventListener("keydown",close);
 },[open]);

 useEffect(()=>{
  if(!open||!session){setTesterActive(null);return}
  let alive=true;
  void(async()=>{
   try{
    const response=await fetch("/api/tester/status",{headers:{Authorization:`Bearer ${session.idToken}`},cache:"no-store"});
    const data=await response.json().catch(()=>({}));
    if(alive)setTesterActive(Boolean(response.ok&&data?.tester));
   }catch{if(alive)setTesterActive(false)}
  })();
  return()=>{alive=false}
 },[open,session]);

 function switchMode(next:Mode){setMode(next);setError("");setMessage("");setPassword("")}

 async function submit(){
  const cleanEmail=email.trim();
  if(!cleanEmail){setError("Enter your email address.");return}
  if(mode!=="reset"&&!password){setError("Enter your password.");return}
  setBusy(true);setError("");setMessage("");
  try{
   if(mode==="reset"){
    await emailPasswordReset(cleanEmail);
    setMessage("Password reset email sent. Check your inbox and spam folder, then return here to sign in.");
    return;
   }
   const next=mode==="create"?await emailRegister(cleanEmail,password):await emailLogin(cleanEmail,password);
   await track(next,mode==="create"?"register":"login");
   setSession(next);
   setMessage(mode==="create"?"CactusByte ID created. Signing you in…":"Signed in. Loading your CactusByte ID…");
   window.setTimeout(()=>window.location.reload(),450);
  }catch(err){setError(friendlyAuthError(err))}finally{setBusy(false)}
 }

 async function redeemTesterPass(){
  if(!session){setError("Sign in with CactusByte ID before redeeming a tester coupon.");return}
  if(!testerCode.trim()){setError("Enter the tester coupon code.");return}
  setTesterBusy(true);setError("");setMessage("");
  try{
   const response=await fetch("/api/tester/redeem",{method:"POST",headers:{Authorization:`Bearer ${session.idToken}`,"Content-Type":"application/json"},body:JSON.stringify({code:testerCode})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(String(data?.error||"Tester coupon could not be redeemed."));
   setTesterActive(true);
   setTesterCode("");
   setMessage("Tester Lifetime Pass activated. This CactusByte ID now has lifetime tester access with no Stripe subscription and no expiration.");
   window.setTimeout(()=>window.location.reload(),700);
  }catch(err){setError(err instanceof Error?err.message:String(err))}finally{setTesterBusy(false)}
 }

 function signOut(){logoutRest();setSession(null);setOpen(false);window.location.reload()}

 if(!open)return null;

 return <div data-cb-auth-surface role="presentation" onMouseDown={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:1200,display:"grid",placeItems:"center",padding:16,background:"rgba(0,0,0,.8)",backdropFilter:"blur(8px)"}}>
  <section role="dialog" aria-modal="true" aria-label="CactusByte ID" onMouseDown={event=>event.stopPropagation()} style={{width:"min(470px,100%)",maxHeight:"92dvh",overflow:"auto",border:"1px solid rgba(103,255,225,.2)",borderRadius:22,background:"linear-gradient(160deg,#0b1512,#050807 72%)",boxShadow:"0 28px 90px rgba(0,0,0,.62)",padding:20,color:"#f2f7f5"}}>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14}}>
    <div><div style={{fontSize:12,letterSpacing:".14em",fontWeight:850,color:"#6dffe3"}}>CACTUSBYTE ID™</div><h2 style={{margin:"5px 0 5px",fontSize:"clamp(1.55rem,6vw,2rem)"}}>{session?"Your CactusByte ID":mode==="create"?"Create your CactusByte ID":mode==="reset"?"Reset your password":"Sign in to CactusByte"}</h2><p style={{margin:0,color:"#9cafaa",lineHeight:1.5}}>Your email address is your CactusByte ID. There is no separate username.</p></div>
    <button aria-label="Close CactusByte ID" onClick={()=>setOpen(false)} style={{...buttonStyle,minWidth:48,padding:0,fontSize:"1.35rem"}}>×</button>
   </div>

   {session?<div style={{display:"grid",gap:12,marginTop:18}}>
    <div style={{padding:15,border:"1px solid rgba(103,255,225,.16)",borderRadius:14,background:"rgba(255,255,255,.025)"}}><div style={{fontSize:13,color:"#8ea09b",marginBottom:5}}>SIGNED IN AS</div><strong style={{fontSize:"1.05rem",overflowWrap:"anywhere"}}>{session.email||"CactusByte owner account"}</strong><p style={{margin:"8px 0 0",color:"#9cafaa",lineHeight:1.5}}>Your apps, access and cloud features use this CactusByte ID.</p></div>
    <div style={{padding:15,border:"1px solid rgba(103,255,225,.16)",borderRadius:14,background:"rgba(255,255,255,.025)"}}>
     <div style={{fontSize:13,color:"#6dffe3",fontWeight:800,letterSpacing:".08em",marginBottom:6}}>TESTER LIFETIME PASS</div>
     {testerActive===null?<p style={{margin:0,color:"#9cafaa"}}>Checking tester access…</p>:testerActive?<><strong style={{color:"#8fffdc"}}>Active · lifetime</strong><p style={{margin:"7px 0 0",color:"#9cafaa",lineHeight:1.5}}>Unlimited tester access is bound to this CactusByte ID. No Stripe subscription and no expiration.</p></>:<><p style={{margin:"0 0 10px",color:"#9cafaa",lineHeight:1.5}}>Tester coupons are single-use. The first CactusByte ID to redeem one keeps the lifetime pass.</p><div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8}}><input value={testerCode} onChange={event=>setTesterCode(event.target.value)} placeholder="CBT-XXXX-XXXX-XXXX" autoCapitalize="characters" style={fieldStyle}/><button disabled={testerBusy} onClick={()=>void redeemTesterPass()} style={primaryStyle}>{testerBusy?"Redeeming…":"Redeem"}</button></div></>}
    </div>
    {error&&<p role="alert" style={{margin:0,color:"#ffaaaa",lineHeight:1.45}}>{error}</p>}
    {message&&<p role="status" style={{margin:0,color:"#8fffdc",lineHeight:1.45}}>{message}</p>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}><button onClick={()=>setOpen(false)} style={primaryStyle}>Continue</button><button onClick={signOut} style={buttonStyle}>Sign Out</button></div>
   </div>:<>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:18}}><button onClick={()=>switchMode("signin")} style={mode==="signin"?primaryStyle:buttonStyle}>Sign In</button><button onClick={()=>switchMode("create")} style={mode==="create"?primaryStyle:buttonStyle}>Create Account</button></div>
    <div style={{display:"grid",gap:10,marginTop:14}}>
     {mode==="create"&&<p style={{margin:0,color:"#9cafaa",lineHeight:1.5}}>New to CactusByte? Create your ID using your email and a password you choose.</p>}
     {mode==="signin"&&<p style={{margin:0,color:"#9cafaa",lineHeight:1.5}}>Use the email address and password you chose when you created your account.</p>}
     {mode==="reset"&&<p style={{margin:0,color:"#9cafaa",lineHeight:1.5}}>Enter the email address you use as your CactusByte ID. Firebase will send the password-reset link.</p>}
     <label style={{display:"grid",gap:6,color:"#a9b9b4",fontSize:".92rem"}}>Email address<input autoComplete="email" inputMode="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="you@example.com" style={fieldStyle}/></label>
     {mode!=="reset"&&<label style={{display:"grid",gap:6,color:"#a9b9b4",fontSize:".92rem"}}>{mode==="create"?"Create a password":"Password"}<input autoComplete={mode==="create"?"new-password":"current-password"} type={showPassword?"text":"password"} value={password} onChange={event=>setPassword(event.target.value)} placeholder={mode==="create"?"At least 6 characters":"Your password"} style={fieldStyle}/></label>}
     {mode!=="reset"&&<label style={{display:"flex",alignItems:"center",gap:9,color:"#a9b9b4",fontSize:".9rem"}}><input type="checkbox" checked={showPassword} onChange={event=>setShowPassword(event.target.checked)} style={{width:20,height:20}}/> Show password</label>}
     {error&&<p role="alert" style={{margin:0,color:"#ffaaaa",lineHeight:1.45}}>{error}</p>}
     {message&&<p role="status" style={{margin:0,color:"#8fffdc",lineHeight:1.45}}>{message}</p>}
     <button disabled={busy} onClick={()=>void submit()} style={primaryStyle}>{busy?"Working…":mode==="create"?"Create CactusByte ID":mode==="reset"?"Send Reset Email":"Sign In"}</button>
     {mode==="signin"?<button onClick={()=>switchMode("reset")} style={{...buttonStyle,background:"transparent",borderColor:"transparent",color:"#8fffdc"}}>Forgot password?</button>:mode==="reset"?<button onClick={()=>switchMode("signin")} style={{...buttonStyle,background:"transparent",borderColor:"transparent",color:"#8fffdc"}}>Back to Sign In</button>:null}
     <button disabled style={{...buttonStyle,opacity:.55}}>Google sign-in · after security test</button>
     <button onClick={()=>setOpen(false)} style={{...buttonStyle,background:"transparent"}}>Continue browsing without an account</button>
    </div>
   </>}
  </section>
 </div>;
}
