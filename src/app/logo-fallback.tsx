"use client";

import {useEffect} from "react";

export default function LogoFallback(){
  useEffect(()=>{
    const onError=(event:Event)=>{
      const img=event.target;
      if(!(img instanceof HTMLImageElement)||!img.alt.toLowerCase().endsWith(" logo")||img.dataset.cbFallback==="1")return;
      img.dataset.cbFallback="1";
      const label=img.alt.replace(/\s+logo$/i,"").replace(/([a-z])([A-Z])/g,"$1 $2").trim();
      const initials=label.split(/[^A-Za-z0-9]+/).filter(Boolean).map(x=>x[0]).join("").slice(0,3).toUpperCase()||"APP";
      const badge=document.createElement("span");
      badge.textContent=initials;
      badge.setAttribute("role","img");
      badge.setAttribute("aria-label",img.alt);
      badge.title=`${label} logo unavailable`;
      badge.style.cssText="display:grid;place-items:center;width:54px;height:54px;flex:0 0 54px;border-radius:14px;border:1px solid rgba(0,213,190,.36);background:linear-gradient(145deg,#0d1c18,#07100e);color:#65f3df;font:900 15px/1 system-ui,-apple-system,sans-serif;letter-spacing:.05em;box-shadow:inset 0 0 22px rgba(0,213,190,.08)";
      img.replaceWith(badge);
    };
    document.addEventListener("error",onError,true);
    return()=>document.removeEventListener("error",onError,true);
  },[]);
  return null;
}
