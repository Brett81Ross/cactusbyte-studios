"use client";

import {useState} from "react";

export default function OwnerDeviceSetup(){
 const[code,setCode]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function activate(){
  setBusy(true);setMessage("");
  try{const r=await fetch("/api/owner/bootstrap",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({setupCode:code})});if(!r.ok)throw new Error(await r.text()||"Owner device activation failed.");setMessage("Owner device trusted. CactusByte will automatically restore owner access on this device.");setCode("")}catch(e){setMessage(e instanceof Error?e.message:"Owner device activation failed.")}finally{setBusy(false)}
 }
 return <main style={{minHeight:"100dvh",display:"grid",placeItems:"center",padding:20,background:"#050807",color:"#effffc",fontFamily:"system-ui,sans-serif"}}><section style={{width:"min(520px,100%)",border:"1px solid rgba(0,213,190,.25)",borderRadius:20,padding:22,background:"#09100f",boxShadow:"0 24px 70px rgba(0,0,0,.45)"}}><small style={{color:"#00d5be",fontWeight:800}}>CACTUSBYTE OWNER DEVICE™</small><h1 style={{margin:"8px 0"}}>Trust this device once.</h1><p style={{opacity:.72,lineHeight:1.5}}>Enter the private owner setup code once. After activation, this device receives an HttpOnly owner credential and CactusByte can silently restore the owner account without asking you to sign in every time.</p><label style={{display:"grid",gap:7,marginTop:18}}>Owner setup code<input type="password" value={code} onChange={e=>setCode(e.target.value)} autoComplete="off" style={{minHeight:48,borderRadius:12,border:"1px solid #24433d",background:"#020706",color:"white",padding:"0 12px"}}/></label><button onClick={()=>void activate()} disabled={busy||!code.trim()} style={{width:"100%",minHeight:48,marginTop:12,borderRadius:12,border:0,fontWeight:900}}>{busy?"Activating…":"Trust This Device"}</button>{message&&<p style={{marginTop:14,padding:10,borderRadius:10,background:"rgba(255,255,255,.05)"}}>{message}</p>}<a href="/" style={{display:"block",textAlign:"center",marginTop:18,color:"#8fffdc"}}>Return to CactusByte</a><p style={{fontSize:12,opacity:.55,marginTop:18}}>Changing the server-side owner signing secret revokes previously trusted owner devices.</p></section></main>;
}
