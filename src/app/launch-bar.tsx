"use client";

import {useEffect,useState} from "react";

type InstallPrompt=Event&{prompt:()=>Promise<void>};

const wrap={position:"relative",zIndex:40,display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8,padding:"10px 12px",background:"linear-gradient(180deg,rgba(4,14,12,.98),rgba(4,10,9,.94))",borderBottom:"1px solid rgba(103,255,225,.18)",boxShadow:"0 10px 30px rgba(0,0,0,.18)"} as const;
const btn={minHeight:46,border:"1px solid rgba(103,255,225,.52)",borderRadius:12,background:"linear-gradient(180deg,rgba(24,55,49,.98),rgba(8,24,21,.98))",color:"#f3fffc",fontWeight:850,fontSize:13,padding:"9px 8px",boxShadow:"inset 0 1px 0 rgba(255,255,255,.1),0 3px 0 rgba(0,213,190,.22),0 8px 20px rgba(0,0,0,.28)"} as const;

export default function LaunchBar(){
 const[prompt,setPrompt]=useState<InstallPrompt|null>(null),[hint,setHint]=useState("");
 useEffect(()=>{const onPrompt=(event:Event)=>{event.preventDefault();setPrompt(event as InstallPrompt)};window.addEventListener("beforeinstallprompt",onPrompt);return()=>window.removeEventListener("beforeinstallprompt",onPrompt)},[]);
 async function install(){
  if(window.matchMedia?.("(display-mode: standalone)").matches){setHint("CactusByte is already installed on this device.");return}
  if(prompt){await prompt.prompt().catch(()=>{});setPrompt(null);setHint("Install prompt opened.");return}
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  setHint(ios?"iPhone/iPad: tap Share in Safari, then Add to Home Screen.":"Android: open the browser menu and choose Install app or Add to Home screen.")
 }
 async function share(){
  const url=`${window.location.origin}/`;
  try{if(navigator.share){await navigator.share({title:"Cactus🌵Byte Studios™",text:"Explore the CactusByte app ecosystem.",url});return}await navigator.clipboard.writeText(url);setHint("CactusByte link copied.")}catch(error){if(!(error instanceof DOMException&&error.name==="AbortError"))setHint("Share is unavailable in this browser.")}
 }
 function qr(){window.dispatchEvent(new Event("cactusbyte:share-open"))}
 return <><section aria-label="CactusByte quick actions" style={wrap}><button type="button" style={btn} onClick={()=>void install()}>⬇ Install App</button><button type="button" style={btn} onClick={()=>void share()}>↗ Share</button><button type="button" style={btn} onClick={qr}>▦ QR Code</button></section>{hint&&<div style={{position:"relative",zIndex:39,padding:"7px 14px",fontSize:12,lineHeight:1.35,color:"#9fb0aa",background:"#06100e",borderBottom:"1px solid rgba(103,255,225,.1)"}}>{hint}</div>}</>
}
