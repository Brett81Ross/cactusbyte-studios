"use client";

import {useEffect,useMemo,useState} from "react";

const BRAND_TITLE="Cactus🌵Byte Studios™";

const buttonStyle={
 minHeight:48,
 border:"1px solid rgba(103,255,225,.22)",
 borderRadius:12,
 background:"rgba(255,255,255,.035)",
 color:"#f2f7f5",
 padding:"0 14px",
 fontWeight:700,
 fontSize:"1rem",
 cursor:"pointer"
} as const;

function brandedQrUrl(url:string){
 const data=encodeURIComponent(url);
 return `https://api.qrserver.com/v1/create-qr-code/?size=440x440&margin=16&color=07100d&bgcolor=f2fffb&data=${data}`;
}

export default function BrandedShare(){
 const[open,setOpen]=useState(false);
 const[shareUrl,setShareUrl]=useState("");
 const[copied,setCopied]=useState(false);

 useEffect(()=>{
  const canonical=()=>`${window.location.origin}/`;
  setShareUrl(canonical());
  const intercept=(event:MouseEvent)=>{
   const target=event.target as HTMLElement|null;
   const button=target?.closest("button");
   if(!button||!button.closest(".topActions")||button.textContent?.trim()!=="Share")return;
   event.preventDefault();
   event.stopPropagation();
   event.stopImmediatePropagation();
   setCopied(false);
   setShareUrl(canonical());
   setOpen(true);
  };
  window.addEventListener("click",intercept,true);
  return()=>window.removeEventListener("click",intercept,true);
 },[]);

 useEffect(()=>{
  if(!open)return;
  const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};
  window.addEventListener("keydown",closeOnEscape);
  return()=>window.removeEventListener("keydown",closeOnEscape);
 },[open]);

 const qrSrc=useMemo(()=>shareUrl?brandedQrUrl(shareUrl):"",[shareUrl]);

 async function nativeShare(){
  try{
   if(navigator.share){
    await navigator.share({title:BRAND_TITLE,text:"Explore the CactusByte app ecosystem.",url:shareUrl});
    return;
   }
   await navigator.clipboard.writeText(shareUrl);
   setCopied(true);
  }catch(error){
   if(error instanceof DOMException&&error.name==="AbortError")return;
  }
 }

 async function copyLink(){
  try{await navigator.clipboard.writeText(shareUrl);setCopied(true)}catch{}
 }

 if(!open)return null;

 return <div role="presentation" onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:1000,display:"grid",placeItems:"center",padding:16,background:"rgba(0,0,0,.78)",backdropFilter:"blur(8px)"}}>
  <section role="dialog" aria-modal="true" aria-label="CactusByte branded QR share" onClick={event=>event.stopPropagation()} style={{width:"min(460px,100%)",maxHeight:"92dvh",overflow:"auto",border:"1px solid rgba(103,255,225,.22)",borderRadius:22,background:"linear-gradient(160deg,#0b1512,#050807 72%)",boxShadow:"0 28px 90px rgba(0,0,0,.6)",padding:20,color:"#f2f7f5"}}>
   <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:14}}>
    <div><div style={{fontSize:12,letterSpacing:".14em",fontWeight:800,color:"#6dffe3"}}>CACTUSBYTE SHARE™</div><h2 style={{margin:"5px 0 4px",fontSize:"clamp(1.55rem,6vw,2rem)"}}>Scan the CactusByte.</h2><p style={{margin:0,color:"#9cafaa",lineHeight:1.45}}>A branded QR for the CactusByte Studios command center.</p></div>
    <button aria-label="Close branded share" onClick={()=>setOpen(false)} style={{...buttonStyle,minWidth:48,padding:0,fontSize:"1.35rem"}}>×</button>
   </div>

   <div style={{margin:"18px auto",width:"min(340px,88vw)",borderRadius:24,padding:13,background:"linear-gradient(135deg,#00d5be,#6dffe3 52%,#0a6e64)",boxShadow:"0 0 35px rgba(0,213,190,.18)"}}>
    <div style={{position:"relative",borderRadius:17,padding:14,background:"#f2fffb",overflow:"hidden"}}>
     <img src={qrSrc} alt="CactusByte Studios branded QR code" style={{display:"block",width:"100%",aspectRatio:"1",objectFit:"contain"}}/>
     <span style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:72,height:72,borderRadius:20,display:"grid",placeItems:"center",background:"#07100d",border:"6px solid #f2fffb",boxShadow:"0 8px 24px rgba(0,0,0,.24)"}}><img src="/logo2.png" alt="" style={{width:58,height:58,objectFit:"contain",borderRadius:14}}/></span>
    </div>
    <div style={{padding:"12px 8px 3px",textAlign:"center",color:"#02100d"}}><strong style={{display:"block",fontSize:"1.12rem"}}>{BRAND_TITLE}</strong><span style={{display:"block",fontSize:".72rem",fontWeight:800,letterSpacing:".12em",marginTop:3}}>ONE STUDIO · ONE LAUNCHPAD</span></div>
   </div>

   <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
    <button onClick={()=>void nativeShare()} style={{...buttonStyle,background:"linear-gradient(#0bcfbb,#07988b)",color:"#02100d",borderColor:"transparent"}}>Android / iOS Share</button>
    <button onClick={()=>void copyLink()} style={buttonStyle}>{copied?"Copied ✓":"Copy Link"}</button>
   </div>
   <p style={{margin:"13px 0 0",fontSize:".82rem",lineHeight:1.45,color:"#8ea09b"}}>Android and Chrome control their own generic QR tile, so CactusByte now shows this branded QR before opening the native share sheet.</p>
  </section>
 </div>;
}
