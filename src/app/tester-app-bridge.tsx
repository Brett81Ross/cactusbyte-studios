"use client";

import {useEffect,useState} from "react";
import {getSession} from "../lib/firebase-rest";

const VIP_APPS:Record<string,string>={
 "https://noproblem-pws.vercel.app":"noproblem",
 "https://machzero-beta.vercel.app":"machzero"
};

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
    try{
     const response=await fetch("/api/tester/issue-app-token",{method:"POST",headers:{Authorization:`Bearer ${session.idToken}`,"Content-Type":"application/json"},body:JSON.stringify({appId}),cache:"no-store"});
     const data=await response.json().catch(()=>({}));
     if(response.ok&&data?.launchUrl){window.location.assign(String(data.launchUrl));return}
    }catch{}
    window.location.assign(original);
   })();
  };
  window.addEventListener("click",intercept,true);
  return()=>window.removeEventListener("click",intercept,true);
 },[tester]);

 return null;
}
