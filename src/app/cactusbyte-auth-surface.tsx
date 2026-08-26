"use client";

import {useEffect,useState} from "react";
import {emailLogin,emailPasswordReset,emailRegister,getSession,logoutRest,type Session} from "../lib/firebase-rest";

type Mode="signin"|"create"|"reset";

const fieldStyle={width:"100%",minHeight:50,border:"1px solid rgba(103,255,225,.18)",borderRadius:12,background:"#08100e",color:"#f2f7f5",padding:"12px 13px",fontSize:16} as const;
const buttonStyle={minHeight:48,border:"1px solid rgba(103,255,225,.2)",borderRadius:12,background:"rgba(255,255,255,.035)",color:"#f2f7f5",padding:"0 14px",fontWeight:750,fontSize:"1rem",cursor:"pointer"} as const;
const primaryStyle={...buttonStyle,background:"linear-gradient(#0bcfbb,#07988b)",color:"#02100d",borderColor:"transparent"} as const;
const VIP_PARTICLES=[8,15,23,31,39,47,55,63,71,79,87,94];

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

function VipUnlock({onEnter,onView}:{onEnter:()=>void;onView:()=>void}){
 return <div className="cb-vip-unlock" role="dialog" aria-modal="true" aria-label="VIP lifetime status unlocked">
  <style>{`
   @keyframes cbVipBackdrop{from{opacity:0}to{opacity:1}}
   @keyframes cbVipSweep{0%{transform:translateX(-140%) skewX(-18deg);opacity:0}25%{opacity:.9}70%{opacity:.55}100%{transform:translateX(180%) skewX(-18deg);opacity:0}}
   @keyframes cbVipRing{0%{transform:translate(-50%,-50%) scale(.12);opacity:0}20%{opacity:.9}100%{transform:translate(-50%,-50%) scale(1.7);opacity:0}}
   @keyframes cbVipLogo{0%{transform:scale(.55) rotate(-9deg);opacity:0;filter:brightness(.5) blur(8px)}55%{transform:scale(1.12) rotate(2deg);opacity:1;filter:brightness(1.8) drop-shadow(0 0 30px #6dffe3)}100%{transform:scale(1) rotate(0);opacity:1;filter:brightness(1.08) drop-shadow(0 0 18px rgba(109,255,227,.65))}}
   @keyframes cbVipCard{0%{transform:translateY(42px) scale(.93);opacity:0}60%{transform:translateY(-3px) scale(1.01);opacity:1}100%{transform:translateY(0) scale(1);opacity:1}}
   @keyframes cbVipParticle{0%{transform:translate3d(0,32px,0) scale(.2);opacity:0}24%{opacity:1}100%{transform:translate3d(var(--drift),-48vh,0) scale(1.15);opacity:0}}
   @keyframes cbVipPulse{0%,100%{box-shadow:0 0 0 1px rgba(109,255,227,.25),0 0 28px rgba(0,213,190,.18)}50%{box-shadow:0 0 0 1px rgba(109,255,227,.6),0 0 55px rgba(0,213,190,.42)}}
   .cb-vip-unlock{position:fixed;inset:0;z-index:1800;display:grid;place-items:center;padding:16px;overflow:hidden;background:radial-gradient(circle at 50% 42%,rgba(0,213,190,.2),transparent 31%),linear-gradient(180deg,rgba(2,7,6,.92),rgba(0,0,0,.98));backdrop-filter:blur(14px);animation:cbVipBackdrop .32s ease-out both;color:#f4fffb}
   .cb-vip-sweep{position:absolute;inset:-25% auto -25% -35%;width:42%;background:linear-gradient(90deg,transparent,rgba(109,255,227,.42),rgba(255,255,255,.86),rgba(0,213,190,.35),transparent);filter:blur(9px);animation:cbVipSweep 1.45s .12s cubic-bezier(.2,.8,.2,1) both;pointer-events:none}
   .cb-vip-ring{position:absolute;left:50%;top:42%;width:min(62vw,520px);aspect-ratio:1;border:2px solid rgba(109,255,227,.48);border-radius:50%;box-shadow:0 0 40px rgba(0,213,190,.2),inset 0 0 40px rgba(0,213,190,.12);pointer-events:none;animation:cbVipRing 1.7s cubic-bezier(.1,.65,.2,1) both}
   .cb-vip-ring.b{animation-delay:.28s;width:min(48vw,410px)}
   .cb-vip-ring.c{animation-delay:.52s;width:min(34vw,300px)}
   .cb-vip-particle{position:absolute;bottom:8%;width:6px;height:6px;border-radius:50%;background:#bafff1;box-shadow:0 0 16px #00d5be;animation:cbVipParticle 2.25s ease-out both;pointer-events:none}
   .cb-vip-card{position:relative;width:min(620px,100%);max-height:92dvh;overflow:auto;text-align:center;border:1px solid rgba(109,255,227,.38);border-radius:28px;padding:24px;background:linear-gradient(155deg,rgba(14,32,27,.96),rgba(4,8,7,.98) 72%);box-shadow:0 34px 120px rgba(0,0,0,.72),0 0 65px rgba(0,213,190,.14);animation:cbVipCard .72s 1.05s cubic-bezier(.16,.85,.2,1) both}
   .cb-vip-logo{width:112px;height:112px;object-fit:contain;border-radius:28px;animation:cbVipLogo 1.05s .3s cubic-bezier(.16,.82,.2,1) both}
   .cb-vip-badge{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:38px;margin-top:13px;padding:0 14px;border-radius:999px;border:1px solid rgba(109,255,227,.4);background:rgba(0,213,190,.1);color:#9affea;font-weight:900;letter-spacing:.08em;font-size:.78rem;animation:cbVipPulse 1.9s 1.5s ease-in-out infinite}
   .cb-vip-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:19px}
   .cb-vip-actions button{flex:1 1 190px}
   @media(prefers-reduced-motion:reduce){.cb-vip-unlock,.cb-vip-sweep,.cb-vip-ring,.cb-vip-particle,.cb-vip-card,.cb-vip-logo,.cb-vip-badge{animation:none!important}}
  `}</style>
  <div className="cb-vip-sweep"/>
  <div className="cb-vip-ring"/><div className="cb-vip-ring b"/><div className="cb-vip-ring c"/>
  {VIP_PARTICLES.map((left,index)=><span className="cb-vip-particle" key={left} style={{left:`${left}%`,animationDelay:`${.32+(index%5)*.14}s`,"--drift":`${(index%2?1:-1)*(18+(index%4)*11)}px`} as React.CSSProperties}/>) }
  <section className="cb-vip-card">
   <div style={{fontSize:12,letterSpacing:".18em",fontWeight:950,color:"#6dffe3"}}>VIP STATUS UNLOCKED™</div>
   <img className="cb-vip-logo" src="/logo2.png" alt="CactusByte Studios"/>
   <div className="cb-vip-badge">◆ LIFETIME VIP ACTIVATED ◆</div>
   <h2 style={{margin:"16px auto 8px",fontSize:"clamp(1.75rem,7vw,2.7rem)",lineHeight:1.02,letterSpacing:"-.035em"}}>Congratulations. You’re CactusByte VIP for life.</h2>
   <p style={{margin:"0 auto",maxWidth:520,color:"#bdd0ca",fontSize:"1.02rem",lineHeight:1.62}}>You just unlocked VIP status for life across the entire Cactus🌵Byte Studios™ product ecosystem.</p>
   <p style={{margin:"10px auto 0",maxWidth:520,color:"#91a9a2",lineHeight:1.55}}>This CactusByte ID now carries lifetime tester access, eligible Pro features, and future testing privileges at no charge.</p>
   <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:9,marginTop:18,textAlign:"left"}}>
    <div style={{padding:13,borderRadius:14,background:"rgba(255,255,255,.025)",border:"1px solid rgba(109,255,227,.14)"}}><small style={{color:"#78938b"}}>STATUS</small><strong style={{display:"block",marginTop:4,color:"#9affea"}}>VIP Tester · Lifetime</strong></div>
    <div style={{padding:13,borderRadius:14,background:"rgba(255,255,255,.025)",border:"1px solid rgba(109,255,227,.14)"}}><small style={{color:"#78938b"}}>ACCOUNT</small><strong style={{display:"block",marginTop:4,color:"#f3fffb"}}>Bound to your CactusByte ID</strong></div>
   </div>
   <div className="cb-vip-actions"><button onClick={onEnter} style={primaryStyle}>Enter Cactus🌵Byte</button><button onClick={onView} style={buttonStyle}>View My VIP Access</button></div>
  </section>
 </div>
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
 const[vipUnlocked,setVipUnlocked]=useState(false);

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
  const close=(event:KeyboardEvent)=>{if(event.key==="Escape"&&!vipUnlocked)setOpen(false)};
  window.addEventListener("keydown",close);
  return()=>window.removeEventListener("keydown",close);
 },[open,vipUnlocked]);

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
   setMessage("");
   setVipUnlocked(true);
   window.dispatchEvent(new Event("cactusbyte:tester-redeemed"));
  }catch(err){setError(err instanceof Error?err.message:String(err))}finally{setTesterBusy(false)}
 }

 function enterVip(){setVipUnlocked(false);setOpen(false);window.location.reload()}
 function viewVip(){setVipUnlocked(false);setMessage("VIP Tester · Lifetime is active on this CactusByte ID. Your lifetime tester access does not expire.")}
 function signOut(){logoutRest();setSession(null);setOpen(false);window.location.reload()}

 if(!open)return null;

 return <div data-cb-auth-surface role="presentation" onMouseDown={()=>{if(!vipUnlocked)setOpen(false)}} style={{position:"fixed",inset:0,zIndex:1200,display:"grid",placeItems:"center",padding:16,background:"rgba(0,0,0,.8)",backdropFilter:"blur(8px)"}}>
  <section role="dialog" aria-modal="true" aria-label="CactusByte ID" onMouseDown={event=>event.stopPropagation()} style={{width:"min(470px,100%)",maxHeight:"92dvh",overflow:"auto",border:"1px solid rgba(103,255,225,.2)",borderRadius:22,background:"linear-gradient(160deg,#0b1512,#050807 72%)",boxShadow:"0 28px 90px rgba(0,0,0,.62)",padding:20,color:"#f2f7f5"}}>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14}}>
    <div><div style={{fontSize:12,letterSpacing:".14em",fontWeight:850,color:"#6dffe3"}}>CACTUSBYTE ID™</div><h2 style={{margin:"5px 0 5px",fontSize:"clamp(1.55rem,6vw,2rem)"}}>{session?"Your CactusByte ID":mode==="create"?"Create your CactusByte ID":mode==="reset"?"Reset your password":"Sign in to CactusByte"}</h2><p style={{margin:0,color:"#9cafaa",lineHeight:1.5}}>Your email address is your CactusByte ID. There is no separate username.</p></div>
    <button aria-label="Close CactusByte ID" onClick={()=>setOpen(false)} style={{...buttonStyle,minWidth:48,padding:0,fontSize:"1.35rem"}}>×</button>
   </div>

   {session?<div style={{display:"grid",gap:12,marginTop:18}}>
    <div style={{padding:15,border:"1px solid rgba(103,255,225,.16)",borderRadius:14,background:"rgba(255,255,255,.025)"}}><div style={{fontSize:13,color:"#8ea09b",marginBottom:5}}>SIGNED IN AS</div><strong style={{fontSize:"1.05rem",overflowWrap:"anywhere"}}>{session.email||"CactusByte owner account"}</strong><p style={{margin:"8px 0 0",color:"#9cafaa",lineHeight:1.5}}>Your apps, access and cloud features use this CactusByte ID.</p></div>
    <div style={{padding:15,border:testerActive?"1px solid rgba(109,255,227,.42)":"1px solid rgba(103,255,225,.16)",borderRadius:14,background:testerActive?"linear-gradient(145deg,rgba(0,213,190,.10),rgba(255,255,255,.025))":"rgba(255,255,255,.025)",boxShadow:testerActive?"0 0 30px rgba(0,213,190,.08)":"none"}}>
     <div style={{fontSize:13,color:"#6dffe3",fontWeight:800,letterSpacing:".08em",marginBottom:6}}>TESTER LIFETIME PASS</div>
     {testerActive===null?<p style={{margin:0,color:"#9cafaa"}}>Checking tester access…</p>:testerActive?<><strong style={{display:"inline-flex",alignItems:"center",gap:7,color:"#8fffdc"}}>◆ VIP Tester · Lifetime</strong><p style={{margin:"7px 0 0",color:"#9cafaa",lineHeight:1.5}}>Unlimited tester access is permanently bound to this CactusByte ID. No Stripe subscription and no expiration.</p></>:<><p style={{margin:"0 0 10px",color:"#9cafaa",lineHeight:1.5}}>Tester coupons are single-use. The first CactusByte ID to redeem one keeps the lifetime pass.</p><div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8}}><input value={testerCode} onChange={event=>setTesterCode(event.target.value)} placeholder="CBT-XXXX-XXXX-XXXX" autoCapitalize="characters" style={fieldStyle}/><button disabled={testerBusy} onClick={()=>void redeemTesterPass()} style={primaryStyle}>{testerBusy?"Redeeming…":"Redeem"}</button></div></>}
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
  {vipUnlocked&&<VipUnlock onEnter={enterVip} onView={viewVip}/>} 
 </div>;
}
