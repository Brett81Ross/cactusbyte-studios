"use client";

import {useEffect,useState} from "react";

const SEEN="cbs_demo_seen:cactusbyte-studios:1";
const DISMISSED="cbs_demo_dismissed:cactusbyte-studios:1";
const STEPS=[
  ["Start in the App Matrix","The Apps tab is the studio launchpad. Search or filter the registry, open an app, share it, pin favorites, hide cards, or reorder your personal view."],
  ["Use CactusByte ID™","Sign in when you want cloud features, linked Pro access, community tools, feedback history, or owner-only surfaces. Free app links can still be opened from the registry."],
  ["Understand Free and Pro","Each app keeps its own plan and price. When an app has a live Pro plan, sign in before upgrading so the purchase can be associated with your CactusByte ID™."],
  ["Build with Idea Forge™","Idea Forge stores product ideas and support votes. Owner access can run Idea Radar to research and add new app ideas while avoiding duplicates."],
  ["Send feedback and join Community","Feedback is tied to your signed-in account. Community channels let signed-in CactusByte users exchange messages inside the ecosystem."],
  ["Use Pulse and ByteLink™","Pulse summarizes ecosystem signals. ByteLink is the cross-app messaging layer; features marked Development should be treated as in-progress, not guaranteed production integrations."],
  ["Check Releases","The Releases tab is the quick place to see current app versions and recent updates across the studio."],
  ["Personalize My CactusByte","Use My CactusByte to change layout preferences, accent, compact mode, favorites, hidden apps, category filters, and other local personalization."],
  ["Owner tools stay protected","The Owner tab exposes studio-management views only when the signed-in profile has the owner role. Help never bypasses those checks."]
] as const;

export default function DemoHelp(){
  const[open,setOpen]=useState(false),[dont,setDont]=useState(false);
  useEffect(()=>{try{if(localStorage.getItem(SEEN)!=="1"&&localStorage.getItem(DISMISSED)!=="1"){const t=setTimeout(()=>{setOpen(true);localStorage.setItem(SEEN,"1")},1000);return()=>clearTimeout(t)}}catch{}},[]);
  const close=()=>{try{if(dont)localStorage.setItem(DISMISSED,"1")}catch{}setOpen(false)};
  return <>
    <button type="button" aria-label="How to use CactusByte Studios" title="How to use CactusByte Studios" onClick={()=>setOpen(true)} style={{position:"fixed",right:16,bottom:18,zIndex:90,width:46,height:46,borderRadius:15,border:"1px solid rgba(0,213,190,.36)",background:"rgba(5,18,15,.96)",color:"#eafff9",fontSize:18,fontWeight:950,boxShadow:"0 12px 34px rgba(0,0,0,.52)"}}>?</button>
    {open&&<div role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)close()}} style={{position:"fixed",inset:0,zIndex:10000,background:"rgba(0,0,0,.78)",display:"flex",alignItems:"flex-end",justifyContent:"center",paddingTop:"env(safe-area-inset-top)"}}>
      <section role="dialog" aria-modal="true" aria-labelledby="cbHelpTitle" style={{width:"min(100%,780px)",maxHeight:"92dvh",overflow:"auto",background:"linear-gradient(160deg,#07140f,#050907)",color:"#edfff8",border:"1px solid rgba(0,213,190,.34)",borderBottom:0,borderRadius:"28px 28px 0 0",padding:"18px 16px calc(24px + env(safe-area-inset-bottom))",boxShadow:"0 -28px 80px rgba(0,0,0,.7)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}><div><div style={{fontSize:9,fontWeight:900,letterSpacing:".2em",color:"#4de8d2"}}>CACTUS🌵BYTE STUDIOS™ · v1.5.0 DEMO & HELP</div><h2 id="cbHelpTitle" style={{margin:"4px 0 0",fontSize:22}}>How to use the Command Center</h2></div><button onClick={close} aria-label="Close help" style={{width:40,height:40,borderRadius:"50%",border:"1px solid rgba(0,213,190,.28)",background:"#0b1b16",color:"#fff",fontSize:22}}>×</button></div>
        <p style={{color:"#9cb7ad",fontSize:12,lineHeight:1.55}}>A fast guide to the studio hub. This Help layer explains existing features; it does not change account permissions, payments, app entitlements, or owner access.</p>
        <div style={{border:"1px solid rgba(0,213,190,.3)",borderRadius:17,padding:10,background:"#030807"}}><video controls playsInline preload="metadata" style={{display:"block",width:"100%",maxHeight:"62dvh",borderRadius:12,background:"#000"}}><source src="/demos/cactusbyte-studios-60-second-demo.mp4" type="video/mp4"/>Your browser could not play the 60-second demo.</video><div style={{padding:"8px 4px 0",color:"#91aea3",fontSize:10,textAlign:"center"}}>Cactus🌵Byte Studios™ · All Rights Reserved</div></div>
        <div style={{display:"grid",gap:9,marginTop:14}}>{STEPS.map((s,i)=><div key={s[0]} style={{border:"1px solid rgba(0,213,190,.2)",borderRadius:15,padding:12,background:"rgba(9,27,21,.92)"}}><strong style={{display:"block",fontSize:12,color:"#4de8d2"}}>{i+1}. {s[0]}</strong><span style={{display:"block",marginTop:4,color:"#abc1b8",fontSize:11,lineHeight:1.45}}>{s[1]}</span></div>)}</div>
        <label style={{display:"flex",alignItems:"flex-start",gap:8,marginTop:13,color:"#93ada3",fontSize:11,lineHeight:1.4}}><input type="checkbox" checked={dont} onChange={e=>setDont(e.target.checked)}/><span>Don’t show this automatically again. The ? button always reopens Help.</span></label>
        <button onClick={close} style={{width:"100%",marginTop:14,border:0,borderRadius:14,padding:13,fontWeight:950,background:"linear-gradient(135deg,#44e7ca,#00b9a5)",color:"#02110d"}}>ENTER CACTUSBYTE</button>
      </section>
    </div>}
  </>;
}
