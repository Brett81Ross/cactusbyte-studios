"use client";

import {useEffect,useMemo,useState} from "react";
import {studioApps,type StudioApp} from "../../data/apps";
import {brandAssets,cactusByteBrand,verifiedBrandAsset} from "../../data/brand-assets";
import styles from "./storefront.module.css";

const RECENT_KEY="cb-storefront-recent-v1";

const featuredIds=["acelynn-pro","noproblem","fantasy-matrix","first-bearing","rivetex"];
const categoryOrder=["Music & Audio","Business","Field Tools","Sports","Recovery","Navigation","All Apps"];

const storefrontCopy:Record<string,{tagline:string;category:string}>={
  "acelynn-pro":{tagline:"Mix analysis, A/B comparison, and actionable audio guidance.",category:"Music & Audio"},
  noproblem:{tagline:"Property intelligence and guided field evidence for smarter service decisions.",category:"Field Tools"},
  "fantasy-matrix":{tagline:"Lineup, injury, waiver, and matchup decision support.",category:"Sports"},
  "first-bearing":{tagline:"Private recovery tools for daily direction, connection, and support.",category:"Recovery"},
  rivetex:{tagline:"Field-service operations, verified work evidence, and job coordination.",category:"Business"},
  pocketstomp:{tagline:"Skate-session tracking, trick feedback, speed, and coaching.",category:"Sports"},
  machzero:{tagline:"Fast resale estimates and evidence-based pricing support.",category:"Business"},
  "rapid-takeoff":{tagline:"Blueprint takeoffs and estimating for construction trades.",category:"Field Tools"},
  ghostlane:{tagline:"Privacy-focused route awareness and navigation.",category:"Navigation"},
  scouttrace:{tagline:"Mobile security and device-intelligence tools.",category:"Field Tools"},
  "shadownex-prime":{tagline:"Live global situational intelligence from public spatial data.",category:"Field Tools"},
  "terraflow-matrix":{tagline:"Mobile landscaping, mowing, lawn care, and irrigation workflows.",category:"Field Tools"},
  orbitgather:{tagline:"Contractor lead intelligence and opportunity discovery.",category:"Business"}
};

function copyFor(app:StudioApp){
  return storefrontCopy[app.id]??{tagline:app.description,category:app.category};
}

export default function StorefrontPage(){
  const[q,setQ]=useState("");
  const[category,setCategory]=useState("All Apps");
  const[recentIds,setRecentIds]=useState<string[]>([]);
  const[selected,setSelected]=useState<StudioApp|null>(null);

  useEffect(()=>{
    try{
      const raw=localStorage.getItem(RECENT_KEY);
      setRecentIds(raw?JSON.parse(raw):[]);
    }catch{}
  },[]);

  const featured=featuredIds.map(id=>studioApps.find(app=>app.id===id)).filter(Boolean) as StudioApp[];
  const apps=useMemo(()=>studioApps.filter(app=>{
    const copy=copyFor(app);
    const matchesQ=!q||`${app.name} ${copy.tagline} ${copy.category}`.toLowerCase().includes(q.toLowerCase());
    const matchesCategory=category==="All Apps"||copy.category===category;
    return matchesQ&&matchesCategory;
  }),[q,category]);
  const recent=recentIds.map(id=>studioApps.find(app=>app.id===id)).filter(Boolean) as StudioApp[];

  function remember(app:StudioApp){
    const next=[app.id,...recentIds.filter(id=>id!==app.id)].slice(0,5);
    setRecentIds(next);
    try{localStorage.setItem(RECENT_KEY,JSON.stringify(next));}catch{}
  }

  function open(app:StudioApp){
    remember(app);
    if(app.url) window.open(app.url,"_blank","noopener,noreferrer");
  }

  return <main className={styles.page}>
    <header className={styles.topbar}>
      <a className={styles.brand} href="/storefront" aria-label="CactusByte storefront home">
        {cactusByteBrand.src&&<img src={cactusByteBrand.src} alt="" />}
        <span><b>Cactus🌵Byte</b><small>STUDIOS</small></span>
      </a>
      <label className={styles.search}><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search apps and tools"/></label>
      <a className={styles.studioLink} href="/">Studio</a>
    </header>

    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>YOUR APPS · ONE LAUNCHPAD</span>
        <h1>CactusByte, built to browse.</h1>
        <p>Open the tools you already use, discover what is new, and move between CactusByte apps without digging through a command center.</p>
        <div className={styles.heroActions}>
          <a href="#apps">Explore Apps</a>
          <a className={styles.secondary} href="/">Open Studio Tools</a>
        </div>
      </div>
      <div className={styles.featured}>
        <FeaturedCard app={featured[0]} open={open} details={setSelected}/>
      </div>
    </section>

    <section className={styles.section} id="apps">
      <div className={styles.sectionHead}><div><span>FEATURED</span><h2>Our apps</h2></div><a href="#all-apps">See all</a></div>
      <div className={styles.featureGrid}>
        {featured.map(app=><AppCard key={app.id} app={app} open={open} details={setSelected}/>)}
      </div>
    </section>

    {recent.length>0&&<section className={styles.section}>
      <div className={styles.sectionHead}><div><span>PICK UP WHERE YOU LEFT OFF</span><h2>Continue using</h2></div></div>
      <div className={styles.continueRow}>{recent.map(app=><ContinueCard key={app.id} app={app} open={open}/>)}</div>
    </section>}

    <section className={styles.section}>
      <div className={styles.sectionHead}><div><span>EXPLORE BY WHAT YOU NEED</span><h2>Categories</h2></div></div>
      <div className={styles.categoryGrid}>
        {categoryOrder.map(name=><button key={name} className={category===name?styles.categoryOn:""} onClick={()=>setCategory(name)}>
          <b>{categoryIcon(name)}</b><span>{name}</span>
        </button>)}
      </div>
    </section>

    <section className={styles.section} id="all-apps">
      <div className={styles.sectionHead}><div><span>CACTUSBYTE PORTFOLIO</span><h2>{category==="All Apps"?"All apps":category}</h2></div><small>{apps.length} apps</small></div>
      <div className={styles.allGrid}>
        {apps.map(app=><AppCard key={app.id} app={app} open={open} details={setSelected}/>)}
      </div>
    </section>

    <nav className={styles.bottomNav} aria-label="CactusByte navigation">
      <a className={styles.navOn} href="/storefront"><span>⌂</span>Home</a>
      <a href="#all-apps"><span>▦</span>Apps</a>
      <a href="/"><span>♧</span>Studio</a>
      <a href="/"><span>◌</span>Updates</a>
      <a href="/"><span>○</span>Profile</a>
    </nav>

    {selected&&<div className={styles.backdrop} onClick={()=>setSelected(null)}>
      <section className={styles.detail} onClick={e=>e.stopPropagation()}>
        <button className={styles.close} onClick={()=>setSelected(null)}>×</button>
        <BrandMark app={selected} large/>
        <span className={styles.eyebrow}>{copyFor(selected).category}</span>
        <h2>{selected.name}</h2>
        <p>{copyFor(selected).tagline}</p>
        <div className={styles.detailMeta}><span>{selected.version}</span><span>{selected.platform}</span><span>{selected.status}</span></div>
        <button className={styles.openButton} onClick={()=>open(selected)}>Open App</button>
        {brandAssets[selected.id]?.status==="unresolved"&&<p className={styles.brandWarning}>Official logo pending recovery. No substitute artwork is being used.</p>}
      </section>
    </div>}
  </main>
}

function FeaturedCard({app,open,details}:{app:StudioApp;open:(app:StudioApp)=>void;details:(app:StudioApp)=>void}){
  const copy=copyFor(app);
  return <article className={styles.featuredCard}>
    <span className={styles.featureBadge}>FEATURED APP</span>
    <div className={styles.featureIdentity}><BrandMark app={app} large/><div><span>{copy.category}</span><h2>{app.name}</h2><p>{copy.tagline}</p></div></div>
    <div className={styles.featureActions}><button onClick={()=>open(app)}>Open</button><button onClick={()=>details(app)}>Explore</button></div>
  </article>
}

function AppCard({app,open,details}:{app:StudioApp;open:(app:StudioApp)=>void;details:(app:StudioApp)=>void}){
  const copy=copyFor(app);
  return <article className={styles.appCard}>
    <BrandMark app={app}/>
    <span className={styles.cardCategory}>{copy.category}</span>
    <h3>{app.name}</h3>
    <p>{copy.tagline}</p>
    <div className={styles.cardFooter}><span>{app.version}</span><div><button onClick={()=>details(app)}>Details</button><button className={styles.primarySmall} onClick={()=>open(app)}>Open</button></div></div>
  </article>
}

function ContinueCard({app,open}:{app:StudioApp;open:(app:StudioApp)=>void}){
  return <button className={styles.continueCard} onClick={()=>open(app)}><BrandMark app={app}/><span><b>{app.shortName}</b><small>Continue</small></span><i>›</i></button>
}

function BrandMark({app,large=false}:{app:StudioApp;large?:boolean}){
  const brand=verifiedBrandAsset(app.id);
  if(!brand)return <div className={large?styles.wordmarkLarge:styles.wordmark} aria-label={`${app.shortName} official logo pending recovery`}><span>{app.shortName}</span><small>Official logo pending recovery</small></div>;
  return <div className={large?styles.logoLarge:styles.logo}><img src={brand.src!} alt={`${app.shortName} official logo`}/></div>;
}

function categoryIcon(name:string){
  if(name==="Music & Audio")return "♫";
  if(name==="Business")return "▣";
  if(name==="Field Tools")return "⌁";
  if(name==="Sports")return "◉";
  if(name==="Recovery")return "✦";
  if(name==="Navigation")return "⌖";
  return "✣";
}
