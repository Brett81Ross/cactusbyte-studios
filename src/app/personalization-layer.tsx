"use client";

import {useEffect,useState} from "react";
import {createPortal} from "react-dom";

type MotionMode="full"|"subtle"|"off";
type TextScale="normal"|"large";
type PersonalizationPrefs={motion:MotionMode;ambient:boolean;cardGlow:boolean;textScale:TextScale};

const KEY="cb-personalization-v1";
const DEFAULTS:PersonalizationPrefs={motion:"subtle",ambient:true,cardGlow:true,textScale:"normal"};

function readPrefs():PersonalizationPrefs{
 try{return {...DEFAULTS,...JSON.parse(localStorage.getItem(KEY)||"{}")}}
 catch{return DEFAULTS}
}

function applyPrefs(p:PersonalizationPrefs){
 const root=document.documentElement;
 root.dataset.cbMotion=p.motion;
 root.dataset.cbAmbient=p.ambient?"on":"off";
 root.dataset.cbCardGlow=p.cardGlow?"on":"off";
 root.dataset.cbTextScale=p.textScale;
}

export default function PersonalizationLayer(){
 const[prefs,setPrefs]=useState<PersonalizationPrefs>(DEFAULTS);
 const[host,setHost]=useState<HTMLElement|null>(null);

 useEffect(()=>{
  const initial=readPrefs();
  setPrefs(initial);
  applyPrefs(initial);
  const findHost=()=>{
   const grid=document.querySelector(".settingsGrid") as HTMLElement|null;
   setHost(grid);
  };
  findHost();
  const observer=new MutationObserver(findHost);
  observer.observe(document.body,{childList:true,subtree:true});
  return()=>observer.disconnect();
 },[]);

 useEffect(()=>{
  localStorage.setItem(KEY,JSON.stringify(prefs));
  applyPrefs(prefs);
 },[prefs]);

 if(!host)return null;

 return createPortal(<section className="cbPersonalization" aria-label="CactusByte personalization options">
  <div className="cbPersonalizationHead"><div><small>HOME EXPERIENCE</small><strong>Make CactusByte yours.</strong></div><span>Live preview</span></div>
  <label>Home animation<select value={prefs.motion} onChange={e=>setPrefs(p=>({...p,motion:e.target.value as MotionMode}))}><option value="full">Full cinematic</option><option value="subtle">Subtle</option><option value="off">Off</option></select></label>
  <label className="check"><input type="checkbox" checked={prefs.ambient} onChange={e=>setPrefs(p=>({...p,ambient:e.target.checked}))}/> Ambient hero glow</label>
  <label className="check"><input type="checkbox" checked={prefs.cardGlow} onChange={e=>setPrefs(p=>({...p,cardGlow:e.target.checked}))}/> App-card hover / focus glow</label>
  <label>Text size<select value={prefs.textScale} onChange={e=>setPrefs(p=>({...p,textScale:e.target.value as TextScale}))}><option value="normal">Normal</option><option value="large">Large / easier to read</option></select></label>
  <button type="button" onClick={()=>setPrefs(DEFAULTS)}>Reset Home Experience</button>
  <p className="muted">Animation settings stay on this device. System Reduce Motion always wins and disables decorative movement automatically.</p>
 </section>,host);
}
