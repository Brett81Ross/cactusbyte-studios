"use client";

import {useEffect,useState} from "react";
import {getSession} from "../lib/firebase-rest";
import {entitlementIsActive,myEntitlements} from "../lib/entitlements-cloud";

const OWNER_BACKUP_KEY="cb_owner_device_backup_v1";
type OwnerStats={registeredUsers:number;newUsers7d:number;disabledUsers:number;signIns24h:number;signIns7d:number;ownerRestores24h:number;ownerRestores7d:number;activeProUsers:number;activeProEntitlements:number;recentSignIns:{email:string;event:string;createdAt:string|null}[]};

export default function AccountDock(){
 const[hasPro,setHasPro]=useState(false),[owner,setOwner]=useState(false),[open,setOpen]=useState(false),[stats,setStats]=useState<OwnerStats|null>(null),[busy,setBusy]=useState(false),[note,setNote]=useState("");
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
 async function loadStats(){
  setBusy(true);setNote("");
  try{const r=await fetch("/api/owner/stats",{headers:await authHeaders(),cache:"no-store",credentials:"include"});if(!r.ok)throw new Error("Owner analytics are unavailable.");setStats(await r.json());setOpen(true)}catch(e){setNote(e instanceof Error?e.message:"Owner analytics are unavailable.")}finally{setBusy(false)}
 }
 if(!hasPro&&!owner)return null;
 return <aside style={{position:"fixed",right:8,bottom:8,zIndex:90,display:"grid",gap:8,maxWidth:410,width:"calc(100% - 16px)",justifyItems:"end",pointerEvents:"none"}}>
  {open&&owner&&<section style={{pointerEvents:"auto",width:"100%",background:"rgba(3,12,11,.98)",border:"1px solid rgba(0,213,190,.28)",borderRadius:16,padding:16,boxShadow:"0 16px 48px rgba(0,0,0,.45)"}}><div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}><div><small style={{opacity:.72,fontSize:13}}>OWNER ONLY</small><b style={{display:"block",fontSize:17}}>CactusByte User Monitor™</b></div><button aria-label="Close user monitor" style={{minWidth:46,minHeight:46,fontSize:22}} onClick={()=>setOpen(false)}>×</button></div>{stats?<><div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8,marginTop:12}}>{[[stats.registeredUsers,"Registered users"],[stats.newUsers7d,"New · 7 days"],[stats.signIns24h,"User auth · 24h"],[stats.signIns7d,"User auth · 7 days"],[stats.activeProUsers,"Pro users"],[stats.activeProEntitlements,"Active Pro plans"],[stats.ownerRestores24h,"Owner restores · 24h"],[stats.ownerRestores7d,"Owner restores · 7 days"]].map(([value,label])=><div key={String(label)} style={{padding:11,borderRadius:12,background:"rgba(255,255,255,.045)"}}><b style={{fontSize:24,display:"block"}}>{value}</b><span style={{fontSize:13,opacity:.72,lineHeight:1.25}}>{label}</span></div>)}</div><div style={{marginTop:14,maxHeight:220,overflow:"auto"}}><small style={{opacity:.72,fontSize:13}}>RECENT USER SIGN-INS</small>{stats.recentSignIns.length?stats.recentSignIns.map((x,i)=><div key={`${x.email}-${x.createdAt}-${i}`} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}><b style={{display:"block",fontSize:15,overflow:"hidden",textOverflow:"ellipsis"}}>{x.email||"CactusByte user"}</b><span style={{fontSize:13,opacity:.68}}>{x.event} · {x.createdAt?new Date(x.createdAt).toLocaleString():"just now"}</span></div>):<p style={{opacity:.68,fontSize:14}}>No user sign-ins recorded yet. Owner auto-restores are counted separately above.</p>}</div><button style={{width:"100%",minHeight:48,marginTop:12,fontSize:15}} onClick={()=>void loadStats()}>Refresh Analytics</button></>:<p style={{opacity:.72,fontSize:14}}>Loading owner analytics…</p>}</section>}
  {note&&<div style={{pointerEvents:"auto",background:"#151b19",padding:"10px 12px",borderRadius:10,fontSize:14}}>{note}</div>}
  <div style={{pointerEvents:"auto",display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>{hasPro&&<button style={{minHeight:48,fontSize:15}} onClick={()=>void manageBilling()} disabled={busy}>Manage Billing</button>}{owner&&<button style={{minHeight:48,fontSize:15}} onClick={()=>open?setOpen(false):void loadStats()} disabled={busy}>Owner Stats</button>}</div>
 </aside>;
}
