"use client";

import {useEffect,useState} from "react";
import {getSession} from "../lib/firebase-rest";
import {entitlementIsActive,myEntitlements} from "../lib/entitlements-cloud";

const OWNER_BACKUP_KEY="cb_owner_device_backup_v1";
type OwnerStats={registeredUsers:number;newUsers7d:number;disabledUsers:number;signIns24h:number;signIns7d:number;ownerRestores24h:number;ownerRestores7d:number;activeProUsers:number;activeProEntitlements:number;recentSignIns:{email:string;event:string;createdAt:string|null}[]};
type HealthState="ok"|"warn"|"error"|"unavailable";
type SystemHealth={id:string;label:string;state:HealthState;summary:string;detail?:string};
type ReleaseHealth={appId:string;liveVersion:string;recordedVersion:string;detectedVersion:string|null;stagedVersion:string|null;state:string;truthState:string;deploymentVerification:string;issues:string[]};
type OwnerHealth={generatedAt:string;releaseTruth:{counts:{live:number;staged:number;mismatch:number;unverified:number;total:number};apps:ReleaseHealth[]};systems:SystemHealth[];systemCounts:{ok:number;warn:number;error:number;unavailable:number};android:{status:string;appCount:number;cutoverAuthorized:boolean;playPublished:boolean};boundaries:{productionDeploymentAuthorized:boolean;permanentSigningCutoverAuthorized:boolean;googlePlayPublicationAuthorized:boolean}};

const stateColor:Record<HealthState,string>={ok:"#8fffdc",warn:"#f0c26c",error:"#ff9f9f",unavailable:"#9aa9a4"};

export default function AccountDock(){
 const[hasPro,setHasPro]=useState(false),[owner,setOwner]=useState(false),[open,setOpen]=useState(false),[stats,setStats]=useState<OwnerStats|null>(null),[health,setHealth]=useState<OwnerHealth|null>(null),[busy,setBusy]=useState(false),[note,setNote]=useState("");
 async function authHeaders(){const s=getSession();const headers:Record<string,string>={};if(s)headers.Authorization=`Bearer ${s.idToken}`;try{const token=localStorage.getItem(OWNER_BACKUP_KEY);if(token)headers["X-CactusByte-Owner-Device"]=token}catch{}return headers}
 async function refresh(){
  const session=getSession();
  if(session){try{const rows=await myEntitlements();setHasPro(rows.some(entitlementIsActive))}catch{setHasPro(false)}}else setHasPro(false);
  try{const r=await fetch("/api/owner/status",{headers:await authHeaders(),cache:"no-store",credentials:"include"});setOwner(r.ok)}catch{setOwner(false)}
 }
 useEffect(()=>{void refresh();const update=()=>void refresh();window.addEventListener("focus",update);window.addEventListener("cactusbyte:session",update);return()=>{window.removeEventListener("focus",update);window.removeEventListener("cactusbyte:session",update)}},[]);
 async function manageBilling(){
  const session=getSession();if(!session){setNote("Sign in with CactusByte ID™ to manage billing.");return}
  setBusy(true);setNote("");
  try{const r=await fetch("/api/stripe/portal",{method:"POST",headers:{Authorization:`Bearer ${session.idToken}`,"Content-Type":"application/json"},body:"{}"});const j=await r.json().catch(()=>({}));if(!r.ok||typeof j.url!=="string")throw new Error("Billing portal is unavailable.");location.assign(j.url)}catch(e){setNote(e instanceof Error?e.message:"Billing portal is unavailable.")}finally{setBusy(false)}
 }
 async function loadOwnerHealth(){
  setBusy(true);setNote("");
  try{
   const headers=await authHeaders();
   const[statsResponse,healthResponse]=await Promise.all([
    fetch("/api/owner/stats",{headers,cache:"no-store",credentials:"include"}),
    fetch("/api/owner/health",{headers,cache:"no-store",credentials:"include"})
   ]);
   if(!statsResponse.ok)throw new Error("Owner analytics are unavailable.");
   if(!healthResponse.ok)throw new Error("Owner health is unavailable.");
   const[nextStats,nextHealth]=await Promise.all([statsResponse.json(),healthResponse.json()]);
   setStats(nextStats);setHealth(nextHealth);setOpen(true);
  }catch(e){setNote(e instanceof Error?e.message:"Owner health is unavailable.")}finally{setBusy(false)}
 }
 if(!hasPro&&!owner)return null;
 const attention=health?.releaseTruth.apps.filter(app=>app.state!=="LIVE"||app.issues.length>0)||[];
 return <aside style={{position:"fixed",right:8,bottom:8,zIndex:90,display:"grid",gap:8,maxWidth:480,width:"calc(100% - 16px)",justifyItems:"end",pointerEvents:"none"}}>
  {open&&owner&&<section style={{pointerEvents:"auto",width:"100%",maxHeight:"min(82dvh,760px)",overflow:"auto",background:"rgba(3,12,11,.985)",border:"1px solid rgba(0,213,190,.28)",borderRadius:16,padding:16,boxShadow:"0 16px 48px rgba(0,0,0,.45)"}}><div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}><div><small style={{opacity:.72,fontSize:13}}>OWNER ONLY · INTERNAL RELEASE EVIDENCE</small><b style={{display:"block",fontSize:18}}>CactusByte Owner Health Center™</b></div><button aria-label="Close owner health" style={{minWidth:48,minHeight:48,fontSize:22}} onClick={()=>setOpen(false)}>×</button></div>
   {health?<><div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8,marginTop:12}}>{[[health.releaseTruth.counts.live,"Verified/live"],[health.releaseTruth.counts.staged,"Staged"],[health.releaseTruth.counts.mismatch,"Mismatch"],[health.releaseTruth.counts.unverified,"Unverified"]].map(([value,label])=><div key={String(label)} style={{padding:11,borderRadius:12,background:"rgba(255,255,255,.045)"}}><b style={{fontSize:24,display:"block"}}>{value}</b><span style={{fontSize:13,opacity:.72}}>{label}</span></div>)}</div>
   <div style={{marginTop:14}}><small style={{opacity:.72,fontSize:13}}>SYSTEM HEALTH</small>{health.systems.map(system=><div key={system.id} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}><div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"baseline"}}><b style={{fontSize:14}}>{system.label}</b><span style={{fontSize:12,fontWeight:800,color:stateColor[system.state]}}>{system.state.toUpperCase()}</span></div><p style={{fontSize:13,opacity:.76,margin:"4px 0",lineHeight:1.4}}>{system.summary}</p>{system.detail&&<span style={{fontSize:11,opacity:.55,overflowWrap:"anywhere"}}>{system.detail}</span>}</div>)}</div>
   <div style={{marginTop:14,padding:12,borderRadius:12,background:"rgba(255,255,255,.035)"}}><small style={{opacity:.72,fontSize:13}}>ANDROID RELEASE SAFETY</small><b style={{display:"block",fontSize:15,marginTop:4}}>{health.android.status} · {health.android.appCount} signing identities</b><p style={{fontSize:13,opacity:.72,lineHeight:1.45,margin:"5px 0 0"}}>Cutover: NOT AUTHORIZED · Google Play publication: NOT AUTHORIZED. Staged signing readiness never triggers uninstall, reinstall, or migration.</p></div>
   <div style={{marginTop:14}}><small style={{opacity:.72,fontSize:13}}>RELEASE TRUTH ATTENTION</small>{attention.length?attention.slice(0,8).map(app=><div key={app.appId} style={{padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}><b style={{fontSize:14}}>{app.appId} · {app.state}</b><span style={{display:"block",fontSize:12,opacity:.66,marginTop:3}}>Live {app.liveVersion} · detected {app.detectedVersion||"unavailable"}{app.stagedVersion?` · staged ${app.stagedVersion}`:""} · deploy {app.deploymentVerification}</span>{app.issues.length>0&&<span style={{display:"block",fontSize:11,color:"#f0c26c",marginTop:3}}>{app.issues.join(" · ")}</span>}</div>):<p style={{opacity:.68,fontSize:13}}>No release-truth mismatches require attention.</p>}</div>
   {stats&&<><div style={{marginTop:14}}><small style={{opacity:.72,fontSize:13}}>USER + PRO HEALTH</small><div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8,marginTop:7}}>{[[stats.registeredUsers,"Registered users"],[stats.newUsers7d,"New · 7 days"],[stats.signIns24h,"User auth · 24h"],[stats.activeProUsers,"Pro users"],[stats.activeProEntitlements,"Active Pro plans"],[stats.ownerRestores24h,"Owner restores · 24h"]].map(([value,label])=><div key={String(label)} style={{padding:10,borderRadius:11,background:"rgba(255,255,255,.035)"}}><b style={{fontSize:20,display:"block"}}>{value}</b><span style={{fontSize:12,opacity:.68}}>{label}</span></div>)}</div></div></>}
   <p style={{fontSize:11,opacity:.5,lineHeight:1.4,margin:"13px 0 0"}}>Last checked {new Date(health.generatedAt).toLocaleString()}. Owner Health is diagnostic only and cannot deploy or authorize Android signing cutover.</p><button style={{width:"100%",minHeight:48,marginTop:12,fontSize:15}} onClick={()=>void loadOwnerHealth()}>Refresh Owner Health</button></>:<p style={{opacity:.72,fontSize:14}}>Loading owner health…</p>}
  </section>}
  {note&&<div style={{pointerEvents:"auto",background:"#151b19",padding:"10px 12px",borderRadius:10,fontSize:14}}>{note}</div>}
  <div style={{pointerEvents:"auto",display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>{hasPro&&<button style={{minHeight:48,fontSize:15}} onClick={()=>void manageBilling()} disabled={busy}>Manage Billing</button>}{owner&&<button style={{minHeight:48,fontSize:15}} onClick={()=>open?setOpen(false):void loadOwnerHealth()} disabled={busy}>Owner Health</button>}</div>
 </aside>;
}
