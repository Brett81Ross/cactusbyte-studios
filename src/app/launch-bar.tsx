"use client";

import {useEffect,useMemo,useState} from "react";
import {studioApps} from "../data/apps";
import {nativeDistributionByApp} from "../data/native-distribution";

const wrap={position:"relative",zIndex:40,display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8,padding:"10px 12px",background:"linear-gradient(180deg,rgba(4,14,12,.98),rgba(4,10,9,.94))",borderBottom:"1px solid rgba(103,255,225,.18)",boxShadow:"0 10px 30px rgba(0,0,0,.18)"} as const;
const btn={minHeight:48,border:"1px solid rgba(103,255,225,.52)",borderRadius:12,background:"linear-gradient(180deg,rgba(24,55,49,.98),rgba(8,24,21,.98))",color:"#f3fffc",fontWeight:850,fontSize:13,padding:"9px 8px",boxShadow:"inset 0 1px 0 rgba(255,255,255,.1),0 3px 0 rgba(0,213,190,.22),0 8px 20px rgba(0,0,0,.28)"} as const;
const overlay={position:"fixed",inset:0,zIndex:1000,display:"grid",placeItems:"center",padding:18,background:"rgba(0,0,0,.72)",backdropFilter:"blur(8px)"} as const;
const modal={width:"min(100%,460px)",border:"1px solid rgba(103,255,225,.3)",borderRadius:20,padding:18,background:"#07120f",boxShadow:"0 24px 80px rgba(0,0,0,.55)",color:"#f3fffc"} as const;

type Choice={appId:string;webUrl:string|null};

function isAndroid(){return /android/i.test(navigator.userAgent)}
function isIos(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
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
 const selected=useMemo(()=>choice?.appId==="cactusbyte-studios"?{id:"cactusbyte-studios",shortName:"CactusByte Studios",url:location.origin+"/"}:studioApps.find(app=>app.id===choice?.appId)||null,[choice]);
 const distribution=choice?nativeDistributionByApp.get(choice.appId):null;

 useEffect(()=>{
  setNativeHub(isCactusByteNative());
  const capture=(event:MouseEvent)=>{
   if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const target=event.target instanceof Element?event.target.closest("button,a"):null;
   if(!target)return;
   const label=(target.textContent||"").trim().replace(/\s+/g," ");
   if(label==="Install"){
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    setChoice({appId:"cactusbyte-studios",webUrl:location.origin+"/"});return;
   }
   if(target instanceof HTMLAnchorElement&&target.closest(".actions")&&isAndroid()){
    const app=appFromUrl(target.href);
    if(!app||!nativeDistributionByApp.has(app.id))return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    setChoice({appId:app.id,webUrl:target.href});
   }
  };
  document.addEventListener("click",capture,true);
  return()=>document.removeEventListener("click",capture,true);
 },[]);

 function openHubInstall(){
  if(nativeHub){setHint("CactusByte is already running as the installed Android app.");return}
  setChoice({appId:"cactusbyte-studios",webUrl:location.origin+"/"});
 }
 function downloadAndroid(){
  if(!distribution)return;
  if(isIos()){setHint("This is the Android download. iPhone/iPad native distribution is not published yet; the web app remains available.")}
  window.location.assign(distribution.legacyDirectUrl);
 }
 function openWeb(){if(!choice?.webUrl)return;const url=choice.webUrl;setChoice(null);window.open(url,"_blank","noopener,noreferrer")}
 async function share(){
  const url=`${window.location.origin}/`;
  try{if(navigator.share){await navigator.share({title:"Cactus🌵Byte Studios™",text:"Explore the CactusByte app ecosystem.",url});return}await navigator.clipboard.writeText(url);setHint("CactusByte link copied.")}catch(error){if(!(error instanceof DOMException&&error.name==="AbortError"))setHint("Share is unavailable in this browser.")}
 }
 function qr(){window.dispatchEvent(new Event("cactusbyte:share-open"))}

 return <>
  <section aria-label="CactusByte quick actions" style={wrap}><button type="button" style={btn} onClick={openHubInstall}>{nativeHub?"✓ Android App":"⬇ Android App"}</button><button type="button" style={btn} onClick={()=>void share()}>↗ Share</button><button type="button" style={btn} onClick={qr}>▦ QR Code</button></section>
  {hint&&<div role="status" style={{position:"relative",zIndex:39,padding:"7px 14px",fontSize:12,lineHeight:1.35,color:"#9fb0aa",background:"#06100e",borderBottom:"1px solid rgba(103,255,225,.1)"}}>{hint}</div>}
  {choice&&selected&&distribution&&<div style={overlay} role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setChoice(null)}}><section role="dialog" aria-modal="true" aria-label={`${selected.shortName} launch options`} style={modal}>
   <div style={{display:"flex",alignItems:"start",justifyContent:"space-between",gap:12}}><div><small style={{color:"#67ffe1",fontWeight:800,letterSpacing:1}}>CACTUSBYTE NATIVE LAUNCH</small><h2 style={{margin:"7px 0 6px",fontSize:22}}>{selected.shortName}</h2></div><button type="button" aria-label="Close launch options" style={{...btn,minWidth:48,padding:0}} onClick={()=>setChoice(null)}>×</button></div>
   <p style={{margin:"8px 0 14px",color:"#a8bbb5",lineHeight:1.5,fontSize:14}}>{distribution.nativeRequiredFor?`The web app is available, but ${distribution.nativeRequiredFor} requires the Android app.`:"Use the web app now or download the current supported Android app."}</p>
   <div style={{display:"grid",gap:10}}>{choice.webUrl&&<button type="button" style={btn} onClick={openWeb}>Open Web App</button>}<button type="button" style={btn} onClick={downloadAndroid}>Download Android App</button></div>
   <p style={{margin:"12px 0 0",color:"#78928a",fontSize:11,lineHeight:1.5}}>Android Direct: current supported public APK · Google Play: not published yet. Permanent-signing cutover remains separate and is not triggered here.</p>
  </section></div>}
 </>;
}
