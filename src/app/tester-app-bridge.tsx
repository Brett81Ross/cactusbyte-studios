"use client";

import {useEffect,useState} from "react";
import {getSession} from "../lib/firebase-rest";

const VIP_APPS:Record<string,string>={
 "https://noproblem-pws.vercel.app":"noproblem",
 "https://machzero-beta.vercel.app":"machzero"
};
const VIP_LAUNCH_TIMEOUT_MS=3500;

export default function TesterAppBridge(){
 const[tester,setTester]=useState(false);

 useEffect(()=>{
  let alive=true;
  const refresh=async()=>{
   const session=getSession();
   if(!session){if(alive)setTester(false);return}
   try{
    const response=await fetch("/api/tester/status",{headers:{Authorization:`Bearer ${session.idToken}`},cache:"no-store"});
    const data=await response.json().catch(()=>({}));
    if(alive)setTester(Boolean(response.ok&&data?.tester));
   }catch{if(alive)setTester(false)}
  };
  const redeemed=()=>{if(alive)setTester(true)};
  void refresh();
  window.addEventListener("pageshow",refresh);
  window.addEventListener("cactusbyte:tester-redeemed",redeemed);
  return()=>{alive=false;window.removeEventListener("pageshow",refresh);window.removeEventListener("cactusbyte:tester-redeemed",redeemed)};
 },[]);

 useEffect(()=>{
  if(!tester)return;
  const intercept=(event:MouseEvent)=>{
   if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const target=event.target as HTMLElement|null;
   const anchor=target?.closest("a") as HTMLAnchorElement|null;
   if(!anchor||!anchor.closest(".actions"))return;
   let appId="";
   try{appId=VIP_APPS[new URL(anchor.href).origin]||""}catch{return}
   if(!appId)return;
   const session=getSession();
   if(!session)return;
   const original=anchor.href;
   event.preventDefault();
   event.stopPropagation();
   event.stopImmediatePropagation();
   void(async()=>{
    const controller=new AbortController();
    const timeout=window.setTimeout(()=>controller.abort(),VIP_LAUNCH_TIMEOUT_MS);
    let navigated=false;
    const go=(url:string)=>{if(navigated)return;navigated=true;window.location.assign(url)};
    try{
     const response=await fetch("/api/tester/issue-app-token",{method:"POST",headers:{Authorization:`Bearer ${session.idToken}`,"Content-Type":"application/json"},body:JSON.stringify({appId}),cache:"no-store",signal:controller.signal});
     const data=await response.json().catch(()=>({}));
     if(response.ok&&data?.launchUrl){go(String(data.launchUrl));return}
    }catch{}
    finally{window.clearTimeout(timeout)}
    go(original);
   })();
  };
  window.addEventListener("click",intercept,true);
  return()=>window.removeEventListener("click",intercept,true);
 },[tester]);

 return null;
}
