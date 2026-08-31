"use client";

import {useEffect,useState} from "react";

const ANDROID_APK_URL="https://github.com/Brett81Ross/cactusbyte-studios/releases/download/android-latest/CactusByte-Studios.apk";
const wrap={position:"relative",zIndex:40,display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8,padding:"10px 12px",background:"linear-gradient(180deg,rgba(4,14,12,.98),rgba(4,10,9,.94))",borderBottom:"1px solid rgba(103,255,225,.18)",boxShadow:"0 10px 30px rgba(0,0,0,.18)"} as const;
const btn={minHeight:46,border:"1px solid rgba(103,255,225,.52)",borderRadius:12,background:"linear-gradient(180deg,rgba(24,55,49,.98),rgba(8,24,21,.98))",color:"#f3fffc",fontWeight:850,fontSize:13,padding:"9px 8px",boxShadow:"inset 0 1px 0 rgba(255,255,255,.1),0 3px 0 rgba(0,213,190,.22),0 8px 20px rgba(0,0,0,.28)"} as const;

export default function LaunchBar(){
 const[hint,setHint]=useState("");
 const native=()=>/CactusByteNative\/1\.0/i.test(navigator.userAgent);
 const ios=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
 function install(){
  if(native()){setHint("CactusByte is already running as the installed Android app.");return}
  if(ios()){setHint("Native iPhone/iPad installation will use TestFlight or the App Store. No browser shortcut will be created.");return}
  setHint("Downloading the real CactusByte Android app…");
  window.location.assign(ANDROID_APK_URL);
 }
 useEffect(()=>{
  const captureInstall=(event:MouseEvent)=>{
   const target=event.target instanceof Element?event.target.closest("button,a"):null;
   if(!target)return;
   const label=(target.textContent||"").trim().replace(/\s+/g," ");
   if(label!=="Install"&&!/^⬇?\s*Install App$/i.test(label))return;
   event.preventDefault();
   event.stopPropagation();
   install();
  };
  document.addEventListener("click",captureInstall,true);
  return()=>document.removeEventListener("click",captureInstall,true);
 },[]);
 async function share(){
  const url=`${window.location.origin}/`;
  try{if(navigator.share){await navigator.share({title:"Cactus🌵Byte Studios™",text:"Explore the CactusByte app ecosystem.",url});return}await navigator.clipboard.writeText(url);setHint("CactusByte link copied.")}catch(error){if(!(error instanceof DOMException&&error.name==="AbortError"))setHint("Share is unavailable in this browser.")}
 }
 function qr(){window.dispatchEvent(new Event("cactusbyte:share-open"))}
 return <><section aria-label="CactusByte quick actions" style={wrap}><button type="button" style={btn} onClick={install}>⬇ Install App</button><button type="button" style={btn} onClick={()=>void share()}>↗ Share</button><button type="button" style={btn} onClick={qr}>▦ QR Code</button></section>{hint&&<div style={{position:"relative",zIndex:39,padding:"7px 14px",fontSize:12,lineHeight:1.35,color:"#9fb0aa",background:"#06100e",borderBottom:"1px solid rgba(103,255,225,.1)"}}>{hint}</div>}</>
}
