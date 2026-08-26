"use client";

import {useEffect} from "react";
import {studioApps} from "../data/apps";
import {getSession} from "../lib/firebase-rest";

function base(value:string){
 try{const url=new URL(value);return `${url.origin}${url.pathname}`}catch{return""}
}

export default function SecureCheckoutBridge(){
 useEffect(()=>{
  const onClick=(event:MouseEvent)=>{
   const target=event.target instanceof Element?event.target.closest("a[href]"):null;
   if(!(target instanceof HTMLAnchorElement))return;
   const match=studioApps.find(app=>app.monetization?.checkoutUrl&&base(app.monetization.checkoutUrl)===base(target.href));
   if(!match)return;
   const session=getSession();
   if(!session)return;
   event.preventDefault();
   event.stopPropagation();
   const popup=window.open("about:blank","_blank");
   if(popup){try{popup.opener=null;popup.document.title="Opening secure checkout…"}catch{}}
   void fetch("/api/stripe/checkout-link",{
    method:"POST",
    headers:{"Authorization":`Bearer ${session.idToken}`,"Content-Type":"application/json"},
    body:JSON.stringify({appId:match.id})
   }).then(async response=>{
    const payload=await response.json().catch(()=>({}));
    if(!response.ok||typeof payload.url!=="string")throw new Error("Secure checkout could not start.");
    if(popup&&!popup.closed)popup.location.replace(payload.url);else window.location.assign(payload.url);
   }).catch(()=>{
    if(popup&&!popup.closed)popup.close();
    window.alert("Secure checkout could not start. Please refresh CactusByte and try again.");
   });
  };
  document.addEventListener("click",onClick,true);
  return()=>document.removeEventListener("click",onClick,true);
 },[]);
 return null;
}
