"use client";

import {useEffect,useMemo,useState,type FormEvent} from "react";
import {studioApps} from "../data/apps";
import {nativeDistributionByApp} from "../data/native-distribution";

const wrap={position:"relative",zIndex:40,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,padding:"10px 12px",background:"linear-gradient(180deg,rgba(4,14,12,.98),rgba(4,10,9,.94))",borderBottom:"1px solid rgba(103,255,225,.18)",boxShadow:"0 10px 30px rgba(0,0,0,.18)"} as const;
const btn={minHeight:48,border:"1px solid rgba(103,255,225,.52)",borderRadius:12,background:"linear-gradient(180deg,rgba(24,55,49,.98),rgba(8,24,21,.98))",color:"#f3fffc",fontWeight:850,fontSize:13,padding:"9px 8px",boxShadow:"inset 0 1px 0 rgba(255,255,255,.1),0 3px 0 rgba(0,213,190,.22),0 8px 20px rgba(0,0,0,.28)"} as const;
const waitBtn={...btn,border:"1px solid rgba(112,255,91,.72)",background:"linear-gradient(180deg,rgba(42,92,31,.98),rgba(13,42,18,.98))",boxShadow:"inset 0 1px 0 rgba(255,255,255,.12),0 3px 0 rgba(112,255,91,.28),0 8px 24px rgba(0,0,0,.32)"} as const;
const overlay={position:"fixed",inset:0,zIndex:1000,display:"grid",placeItems:"center",padding:18,background:"rgba(0,0,0,.72)",backdropFilter:"blur(8px)"} as const;
const modal={width:"min(100%,460px)",border:"1px solid rgba(103,255,225,.3)",borderRadius:20,padding:18,background:"#07120f",boxShadow:"0 24px 80px rgba(0,0,0,.55)",color:"#f3fffc"} as const;
const field={display:"grid",gap:6,fontSize:12,fontWeight:800,color:"#b7cbc4"} as const;
const input={width:"100%",minHeight:46,borderRadius:11,border:"1px solid rgba(103,255,225,.24)",background:"#0b1b17",color:"#f3fffc",padding:"10px 12px",fontSize:15,outline:"none"} as const;

type Choice={appId:string;webUrl:string|null};

function isAndroid(){return /android/i.test(navigator.userAgent)}
function isIos(){
 const ua=navigator.userAgent;
 return /iphone|ipad|ipod/i.test(ua)||(/macintosh/i.test(ua)&&navigator.maxTouchPoints>1);
}
function isCactusByteNative(){return /CactusByteNative\/1\.0/i.test(navigator.userAgent)}

function appFromUrl(url:string){
 try{
  const target=new URL(url,location.href);
  return studioApps.find(app=>{if(!app.url)return false;const known=new URL(app.url);return known.origin===target.origin})||null;
 }catch{return null}
}

export default function LaunchBar(){
 const[hint,setHint]=useState("");
 const[choice,setChoice]=useState<Choice|null>(null);
 const[nativeHub,setNativeHub]=useState(false);
 const[appleTouch,setAppleTouch]=useState(false);
 const[waitlistOpen,setWaitlistOpen]=useState(false);
 const[waitName,setWaitName]=useState("");
 const[waitEmail,setWaitEmail]=useState("");
 const[waitInterest,setWaitInterest]=useState("CactusByte Studios");
 const[waitConsent,setWaitConsent]=useState(false);
 const[waitBusy,setWaitBusy]=useState(false);
 const[waitMessage,setWaitMessage]=useState("");
 const selected=useMemo(()=>choice?.appId==="cactusbyte-studios"?{id:"cactusbyte-studios",shortName:"CactusByte Studios",url:location.origin+"/"}:studioApps.find(app=>app.id===choice?.appId)||null,[choice]);
 const distribution=choice?nativeDistributionByApp.get(choice.appId):null;

 useEffect(()=>{
  setNativeHub(isCactusByteNative());
  setAppleTouch(isIos());
  const suppressLegacyPwa=(event:Event)=>{event.preventDefault();event.stopImmediatePropagation()};
  const capture=(event:MouseEvent)=>{
   if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const target=event.target instanceof Element?event.target.closest("button,a"):null;
   if(!target)return;
   const label=(target.textContent||"").trim().replace(/\s+/g," ");
   if(label==="Install"){
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    if(isIos()){setHint("iPhone/iPad native distribution is not published yet; use the CactusByte web apps.");return}
    setChoice({appId:"cactusbyte-studios",webUrl:location.origin+"/"});return;
   }
   if(target instanceof HTMLAnchorElement&&target.closest(".actions")&&isAndroid()){
    const app=appFromUrl(target.href);
    if(!app||!nativeDistributionByApp.has(app.id))return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    setChoice({appId:app.id,webUrl:target.href});
   }
  };
  window.addEventListener("beforeinstallprompt",suppressLegacyPwa,true);
  document.addEventListener("click",capture,true);
  return()=>{window.removeEventListener("beforeinstallprompt",suppressLegacyPwa,true);document.removeEventListener("click",capture,true)};
 },[]);

 function openHubInstall(){
  if(appleTouch||isIos()){setChoice(null);setHint("iPhone/iPad native distribution is not published yet; use the CactusByte web apps.");return}
  if(nativeHub){setHint("CactusByte is already running as the installed Android app.");return}
  setChoice({appId:"cactusbyte-studios",webUrl:location.origin+"/"});
 }
 function downloadAndroid(){
  if(!distribution)return;
  if(isIos()){setChoice(null);setHint("This is the Android download. iPhone/iPad native distribution is not published yet; the web app remains available.");return}
  window.location.assign(distribution.legacyDirectUrl);
 }
 function openWeb(){if(!choice?.webUrl)return;const url=choice.webUrl;setChoice(null);window.open(url,"_blank","noopener,noreferrer")}
 async function share(){
  const url=`${window.location.origin}/`;
  try{if(navigator.share){await navigator.share({title:"Cactus🌵Byte Studios™",text:"Explore the CactusByte app ecosystem.",url});return}await navigator.clipboard.writeText(url);setHint("CactusByte link copied.")}catch(error){if(!(error instanceof DOMException&&error.name==="AbortError"))setHint("Share is unavailable in this browser.")}
 }
 function qr(){window.dispatchEvent(new Event("cactusbyte:share-open"))}
 async function joinWaitlist(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(waitBusy)return;
  setWaitBusy(true);setWaitMessage("");
  try{
   const response=await fetch("/api/waitlist",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:waitName,email:waitEmail,interest:waitInterest,consent:waitConsent,website:"",source:"cactusbyte-hub"})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.error||"Waitlist signup failed.");
   setWaitMessage(data.message||"You’re on the CactusByte waitlist.");
   if(!data.alreadyJoined){setWaitName("");setWaitEmail("");setWaitInterest("CactusByte Studios");setWaitConsent(false)}
  }catch(error){setWaitMessage(error instanceof Error?error.message:"Waitlist signup failed.")}
  finally{setWaitBusy(false)}
 }

 return <>
  <section aria-label="CactusByte quick actions" style={wrap}><button type="button" style={btn} onClick={openHubInstall}>{appleTouch?"Web Apps":nativeHub?"✓ Android App":"⬇ Android App"}</button><button type="button" style={btn} onClick={()=>void share()}>↗ Share</button><button type="button" style={btn} onClick={qr}>▦ QR Code</button><button type="button" style={waitBtn} onClick={()=>{setWaitMessage("");setWaitlistOpen(true)}}>🌵 Join Waitlist</button></section>
  {hint&&<div role="status" style={{position:"relative",zIndex:39,padding:"7px 14px",fontSize:12,lineHeight:1.35,color:"#9fb0aa",background:"#06100e",borderBottom:"1px solid rgba(103,255,225,.1)"}}>{hint}</div>}
  {waitlistOpen&&<div style={overlay} role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget&&!waitBusy)setWaitlistOpen(false)}}><section role="dialog" aria-modal="true" aria-label="Join the CactusByte Google Play waitlist" style={modal}>
   <div style={{display:"flex",alignItems:"start",justifyContent:"space-between",gap:12}}><div><small style={{color:"#70ff5b",fontWeight:900,letterSpacing:1}}>GOOGLE PLAY EARLY ACCESS</small><h2 style={{margin:"7px 0 6px",fontSize:24}}>Be first in line. 🌵</h2></div><button type="button" aria-label="Close waitlist" style={{...btn,minWidth:48,padding:0}} onClick={()=>{if(!waitBusy)setWaitlistOpen(false)}}>×</button></div>
   <p style={{margin:"6px 0 16px",color:"#a8bbb5",lineHeight:1.5,fontSize:14}}>Join the CactusByte launch list and get notified when the Google Play release opens. Pick the app or area you’re most curious about.</p>
   <form onSubmit={joinWaitlist} style={{display:"grid",gap:12}}>
    <label style={field}>Name<input style={input} value={waitName} onChange={e=>setWaitName(e.target.value)} maxLength={80} autoComplete="name" required placeholder="Your name"/></label>
    <label style={field}>Email<input style={input} value={waitEmail} onChange={e=>setWaitEmail(e.target.value)} maxLength={254} autoComplete="email" inputMode="email" type="email" required placeholder="you@example.com"/></label>
    <label style={field}>Most interested in<select style={input} value={waitInterest} onChange={e=>setWaitInterest(e.target.value)}><option>CactusByte Studios</option>{studioApps.map(app=><option key={app.id} value={app.shortName}>{app.shortName}</option>)}</select></label>
    <label style={{display:"flex",gap:9,alignItems:"flex-start",color:"#a8bbb5",fontSize:12,lineHeight:1.45}}><input type="checkbox" checked={waitConsent} onChange={e=>setWaitConsent(e.target.checked)} required style={{marginTop:2,minWidth:18,minHeight:18}}/><span>I want CactusByte Studios Google Play launch and early-access updates. I can opt out later.</span></label>
    <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position:"absolute",left:"-10000px",width:1,height:1,opacity:0}}/>
    <button type="submit" disabled={waitBusy} style={{...waitBtn,minHeight:52,fontSize:15,opacity:waitBusy?0.7:1}}>{waitBusy?"Joining…":"Join the Waitlist"}</button>
   </form>
   {waitMessage&&<div role="status" style={{marginTop:12,padding:"10px 12px",borderRadius:10,background:"rgba(112,255,91,.08)",border:"1px solid rgba(112,255,91,.22)",color:"#c8ffc0",fontSize:13,lineHeight:1.45}}>{waitMessage}</div>}
   <p style={{margin:"12px 0 0",color:"#78928a",fontSize:11,lineHeight:1.5}}>Your signup is stored in CactusByte Cloud. One waitlist entry per email address.</p>
  </section></div>}
  {choice&&selected&&distribution&&<div style={overlay} role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setChoice(null)}}><section role="dialog" aria-modal="true" aria-label={`${selected.shortName} launch options`} style={modal}>
   <div style={{display:"flex",alignItems:"start",justifyContent:"space-between",gap:12}}><div><small style={{color:"#67ffe1",fontWeight:800,letterSpacing:1}}>CACTUSBYTE NATIVE LAUNCH</small><h2 style={{margin:"7px 0 6px",fontSize:22}}>{selected.shortName}</h2></div><button type="button" aria-label="Close launch options" style={{...btn,minWidth:48,padding:0}} onClick={()=>setChoice(null)}>×</button></div>
   <p style={{margin:"8px 0 14px",color:"#a8bbb5",lineHeight:1.5,fontSize:14}}>{distribution.nativeRequiredFor?`The web app is available, but ${distribution.nativeRequiredFor} requires the Android app.`:"Use the web app now or download the current supported Android app."}</p>
   <div style={{display:"grid",gap:10}}>{choice.webUrl&&<button type="button" style={btn} onClick={openWeb}>Open Web App</button>}<button type="button" style={btn} onClick={downloadAndroid}>Download Android App</button></div>
   <p style={{margin:"12px 0 0",color:"#78928a",fontSize:11,lineHeight:1.5}}>Android Direct: current supported public APK · Google Play: not published yet. Permanent-signing cutover remains separate and is not triggered here.</p>
  </section></div>}
 </>;
}
