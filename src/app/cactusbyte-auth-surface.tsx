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
   @keyframes cbVipSweep{0%{transform:translateX(-155%) skewX(-16deg);opacity:0}22%{opacity:.95}62%{opacity:.7}100%{transform:translateX(235%) skewX(-16deg);opacity:0}}
   @keyframes cbVipRing{0%{transform:translate(-50%,-50%) scale(.18);opacity:0}18%{opacity:.95}78%{opacity:.36}100%{transform:translate(-50%,-50%) scale(1.42);opacity:0}}
   @keyframes cbVipCore{0%{transform:scale(.68);opacity:0;filter:blur(7px) brightness(.5)}58%{transform:scale(1.08);opacity:1;filter:blur(0) brightness(1.65)}100%{transform:scale(1);opacity:1;filter:brightness(1.08)}}
   @keyframes cbVipCard{0%{transform:translateY(28px) scale(.965);opacity:0}64%{transform:translateY(-2px) scale(1.004);opacity:1}100%{transform:translateY(0) scale(1);opacity:1}}
   @keyframes cbVipParticle{0%{transform:translate3d(0,28px,0) scale(.2);opacity:0}22%{opacity:1}100%{transform:translate3d(var(--drift),-58vh,0) scale(1.18);opacity:0}}
   @keyframes cbVipPulse{0%,100%{box-shadow:0 0 0 1px rgba(109,255,227,.22),0 0 24px rgba(0,213,190,.13),inset 0 0 16px rgba(0,213,190,.06)}50%{box-shadow:0 0 0 1px rgba(109,255,227,.56),0 0 50px rgba(0,213,190,.34),inset 0 0 22px rgba(0,213,190,.12)}}
   @keyframes cbVipGrid{from{background-position:0 0,0 0}to{background-position:0 34px,34px 0}}
   .cb-vip-unlock{position:fixed;inset:0;z-index:1800;display:grid;place-items:center;padding:max(14px,env(safe-area-inset-top)) 14px max(14px,env(safe-area-inset-bottom));overflow:hidden;background:radial-gradient(circle at 50% 34%,rgba(0,213,190,.18),transparent 28%),radial-gradient(circle at 50% 72%,rgba(92,255,132,.08),transparent 34%),rgba(0,4,4,.86);backdrop-filter:blur(16px) saturate(1.08);animation:cbVipBackdrop .28s ease-out both;color:#f4fffb}
   .cb-vip-unlock:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.16;background-image:linear-gradient(rgba(109,255,227,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(109,255,227,.08) 1px,transparent 1px);background-size:34px 34px;mask-image:radial-gradient(circle at 50% 44%,black,transparent 72%);animation:cbVipGrid 7s linear infinite}
   .cb-vip-sweep{position:absolute;inset:-30% auto -30% -42%;width:32%;background:linear-gradient(90deg,transparent,rgba(109,255,227,.24),rgba(225,255,248,.92),rgba(64,255,205,.28),transparent);filter:blur(8px);animation:cbVipSweep 1.5s .1s cubic-bezier(.2,.8,.2,1) both;pointer-events:none}
   .cb-vip-ring{position:absolute;left:50%;top:34%;width:min(76vw,560px);aspect-ratio:1;border:1px solid rgba(109,255,227,.5);border-radius:50%;box-shadow:0 0 42px rgba(0,213,190,.16),inset 0 0 44px rgba(0,213,190,.08);pointer-events:none;animation:cbVipRing 1.85s .15s cubic-bezier(.1,.65,.2,1) both}
   .cb-vip-ring.b{animation-delay:.38s;width:min(58vw,430px);border-color:rgba(105,255,151,.48)}
   .cb-vip-ring.c{animation-delay:.62s;width:min(42vw,315px);border-color:rgba(109,255,227,.42)}
   .cb-vip-particle{position:absolute;bottom:4%;width:5px;height:5px;border-radius:50%;background:#cafff4;box-shadow:0 0 14px #00d5be;animation:cbVipParticle 2.35s ease-out both;pointer-events:none}
   .cb-vip-card{position:relative;width:min(650px,100%);max-height:94dvh;overflow:auto;overscroll-behavior:contain;text-align:center;border:1px solid rgba(109,255,227,.48);border-radius:30px;padding:18px 20px 22px;background:linear-gradient(165deg,rgba(7,22,19,.985),rgba(2,7,7,.995) 64%,rgba(5,12,10,.995));box-shadow:0 34px 110px rgba(0,0,0,.76),0 0 0 1px rgba(0,213,190,.05),0 0 72px rgba(0,213,190,.16);animation:cbVipCard .72s .82s cubic-bezier(.16,.85,.2,1) both}
   .cb-vip-card:before,.cb-vip-card:after{content:"";position:absolute;pointer-events:none;width:58px;height:58px;border-color:rgba(109,255,227,.55)}
   .cb-vip-card:before{left:12px;top:12px;border-left:2px solid;border-top:2px solid;border-radius:15px 0 0 0}
   .cb-vip-card:after{right:12px;bottom:12px;border-right:2px solid;border-bottom:2px solid;border-radius:0 0 15px 0}
   .cb-vip-kicker{display:flex;align-items:center;justify-content:center;gap:10px;margin:2px auto 10px;color:#94fff0;font-size:11px;letter-spacing:.25em;font-weight:950;text-transform:uppercase}
   .cb-vip-kicker:before,.cb-vip-kicker:after{content:"";width:min(64px,13vw);height:1px;background:linear-gradient(90deg,transparent,#5dfbe5)}
   .cb-vip-kicker:after{transform:scaleX(-1)}
   .cb-vip-radar{position:relative;width:min(210px,52vw);aspect-ratio:1;margin:0 auto 4px;display:grid;place-items:center;border-radius:50%;background:radial-gradient(circle,rgba(86,255,136,.14) 0 26%,rgba(0,213,190,.1) 27% 42%,rgba(0,213,190,.025) 43% 59%,transparent 60%),repeating-radial-gradient(circle,rgba(109,255,227,.28) 0 1px,transparent 2px 19px);box-shadow:0 0 58px rgba(0,213,190,.2),inset 0 0 46px rgba(0,213,190,.11);animation:cbVipCore .9s .22s cubic-bezier(.16,.82,.2,1) both}
   .cb-vip-radar:before,.cb-vip-radar:after{content:"";position:absolute;background:linear-gradient(90deg,transparent,rgba(109,255,227,.8),transparent);filter:drop-shadow(0 0 8px #00d5be)}
   .cb-vip-radar:before{left:-12%;right:-12%;height:1px;top:50%}
   .cb-vip-radar:after{top:-12%;bottom:-12%;width:1px;left:50%;background:linear-gradient(180deg,transparent,rgba(109,255,227,.72),transparent)}
   .cb-vip-logo-shell{position:relative;width:42%;aspect-ratio:1;display:grid;place-items:center;border:1px solid rgba(106,255,154,.68);border-radius:50%;background:radial-gradient(circle,rgba(44,255,122,.18),rgba(0,213,190,.06) 58%,rgba(0,0,0,.12));box-shadow:0 0 28px rgba(63,255,132,.28),inset 0 0 24px rgba(0,213,190,.16)}
   .cb-vip-logo{width:78%;height:78%;object-fit:contain;border-radius:18px;filter:drop-shadow(0 0 15px rgba(94,255,181,.7))}
   .cb-vip-badge{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:40px;margin-top:5px;padding:0 16px;border-radius:10px;border:1px solid rgba(107,255,133,.58);background:linear-gradient(180deg,rgba(54,255,113,.13),rgba(0,213,190,.06));color:#eaffef;font-weight:950;letter-spacing:.13em;font-size:.73rem;text-transform:uppercase;animation:cbVipPulse 1.9s 1.35s ease-in-out infinite}
   .cb-vip-title{margin:15px auto 7px;max-width:560px;font-size:clamp(1.75rem,6.2vw,2.75rem);line-height:1.03;letter-spacing:-.04em;text-wrap:balance;background:linear-gradient(180deg,#f8fffd,#91ffe5 72%,#71ffc0);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 0 24px rgba(109,255,227,.08)}
   .cb-vip-copy{margin:0 auto;max-width:535px;color:#c3d8d1;font-size:clamp(.95rem,3.3vw,1.03rem);line-height:1.58}
   .cb-vip-copy.secondary{margin-top:8px;color:#8fa9a2}
   .cb-vip-details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:16px;text-align:left}
   .cb-vip-detail{position:relative;padding:12px 13px 12px 43px;min-height:68px;border-radius:14px;background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(0,213,190,.035));border:1px solid rgba(109,255,227,.18);box-shadow:inset 0 0 22px rgba(0,213,190,.025)}
   .cb-vip-detail-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:22px;height:22px;display:grid;place-items:center;border-radius:50%;color:#77ffd7;filter:drop-shadow(0 0 9px rgba(109,255,227,.5));font-size:17px}
   .cb-vip-detail small{display:block;color:#77968e;font-size:.68rem;letter-spacing:.16em;font-weight:850}
   .cb-vip-detail strong{display:block;margin-top:4px;color:#f4fffb;font-size:.94rem;line-height:1.25}
   .cb-vip-detail:first-child strong{color:#9affea}
   .cb-vip-actions{display:grid;grid-template-columns:1.25fr .9fr;gap:9px;margin-top:17px}
   .cb-vip-actions button{min-height:52px;border-radius:14px;font-weight:900}
   .cb-vip-enter{border:1px solid rgba(146,255,227,.6)!important;background:linear-gradient(90deg,#20d9cf,#62efb0)!important;color:#02100d!important;box-shadow:0 0 28px rgba(0,213,190,.24),inset 0 1px 0 rgba(255,255,255,.38)!important}
   .cb-vip-view{border-color:rgba(109,255,227,.42)!important;background:rgba(0,0,0,.25)!important;color:#b9fff3!important}
   .cb-vip-foot{margin:13px auto 0;color:#5d9187;font-size:.66rem;letter-spacing:.2em;text-transform:uppercase}
   @media(max-width:560px){.cb-vip-unlock{padding:8px}.cb-vip-card{padding:14px 13px 16px;border-radius:23px}.cb-vip-radar{width:min(174px,49vw)}.cb-vip-badge{font-size:.65rem;letter-spacing:.09em;padding:0 10px}.cb-vip-details{grid-template-columns:1fr}.cb-vip-actions{grid-template-columns:1fr}.cb-vip-copy.secondary{display:none}.cb-vip-foot{font-size:.58rem;letter-spacing:.12em}.cb-vip-title{margin-top:12px}.cb-vip-detail{min-height:58px}}
   @media(max-height:720px){.cb-vip-radar{width:132px}.cb-vip-title{font-size:1.65rem;margin-top:9px}.cb-vip-copy{font-size:.89rem;line-height:1.45}.cb-vip-copy.secondary{display:none}.cb-vip-details{margin-top:10px}.cb-vip-actions{margin-top:11px}.cb-vip-foot{display:none}.cb-vip-card{padding-top:12px;padding-bottom:13px}}
   @media(prefers-reduced-motion:reduce){.cb-vip-unlock,.cb-vip-unlock:before,.cb-vip-sweep,.cb-vip-ring,.cb-vip-particle,.cb-vip-card,.cb-vip-radar,.cb-vip-badge{animation:none!important}.cb-vip-sweep,.cb-vip-ring,.cb-vip-particle{display:none!important}}
  `}</style>
  <div className="cb-vip-sweep" aria-hidden="true"/>
  <div className="cb-vip-ring" aria-hidden="true"/><div className="cb-vip-ring b" aria-hidden="true"/><div className="cb-vip-ring c" aria-hidden="true"/>
  {VIP_PARTICLES.map((left,index)=><span className="cb-vip-particle" aria-hidden="true" key={left} style={{left:`${left}%`,animationDelay:`${.3+(index%5)*.13}s`,"--drift":`${(index%2?1:-1)*(18+(index%4)*11)}px`} as React.CSSProperties}/>) }
  <section className="cb-vip-card">
   <div className="cb-vip-kicker">VIP STATUS UNLOCKED™</div>
   <div className="cb-vip-radar" aria-hidden="true"><div className="cb-vip-logo-shell"><img className="cb-vip-logo" src="/logo2.png" alt=""/></div></div>
   <div className="cb-vip-badge">◆ LIFETIME VIP ACTIVATED ◆</div>
   <h2 className="cb-vip-title">Congratulations. You’re CactusByte VIP for life.</h2>
   <p className="cb-vip-copy">You just unlocked VIP status for life across the entire Cactus🌵Byte Studios™ product ecosystem.</p>
   <p className="cb-vip-copy secondary">This CactusByte ID now carries lifetime tester access, eligible Pro features, and future testing privileges at no charge.</p>
   <div className="cb-vip-details">
    <div className="cb-vip-detail"><span className="cb-vip-detail-icon" aria-hidden="true">♛</span><small>STATUS</small><strong>VIP Tester · Lifetime</strong></div>
    <div className="cb-vip-detail"><span className="cb-vip-detail-icon" aria-hidden="true">◎</span><small>ACCOUNT</small><strong>Bound to your CactusByte ID</strong></div>
   </div>
   <div className="cb-vip-actions"><button className="cb-vip-enter" onClick={onEnter} style={primaryStyle}>Enter Cactus🌵Byte</button><button className="cb-vip-view" onClick={onView} style={buttonStyle}>View My VIP Access</button></div>
   <div className="cb-vip-foot">Access granted · Tester lifetime</div>
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