"use client";

import {useEffect,useMemo,useState,type CSSProperties} from "react";
import {studioApps,type StudioApp} from "../../data/apps";
import {brandAssets,cactusByteBrand,verifiedBrandAsset} from "../../data/brand-assets";
import styles from "./storefront.module.css";

const RECENT_KEY="cb-storefront-recent-v3";
const featuredIds=["acelynn-pro","noproblem","fantasy-matrix","first-bearing","rivetex","pocketstomp"];
const quickIds=["acelynn-pro","fantasy-matrix","first-bearing"];
const newIds=["noproblem","first-bearing","fantasy-matrix"];
const categories=[
  {name:"Music & Audio",label:"Music",icon:"♫",hint:"Mix & create"},
  {name:"Business",label:"Business",icon:"▣",hint:"Build & grow"},
  {name:"Field Tools",label:"Field Tools",icon:"⌁",hint:"Get it done"},
  {name:"Sports",label:"Sports",icon:"◉",hint:"Play smarter"},
  {name:"Recovery",label:"Recovery",icon:"✦",hint:"Stay connected"},
  {name:"All Apps",label:"All Apps",icon:"✣",hint:"See everything"}
];

const storefrontCopy:Record<string,{tagline:string;category:string;short:string}>={
  "acelynn-pro":{tagline:"Mix Check & A/B Compare with actionable audio guidance.",category:"Music & Audio",short:"Hear the difference. Make the next mix move."},
  noproblem:{tagline:"Property intelligence and guided field evidence for smarter service decisions.",category:"Field Tools",short:"Property intelligence, field ready."},
  "fantasy-matrix":{tagline:"Lineup, injury, waiver, and matchup decision support.",category:"Sports",short:"Know what to do with your team right now."},
  "first-bearing":{tagline:"Private recovery tools for daily direction, connection, and support.",category:"Recovery",short:"One step. One degree. One day at a time."},
  rivetex:{tagline:"Field-service operations, verified work evidence, and job coordination.",category:"Business",short:"Field operations, built to prove."},
  pocketstomp:{tagline:"Skate-session tracking, trick feedback, speed, and coaching.",category:"Sports",short:"Ride. Track. Improve."},
  machzero:{tagline:"Fast resale estimates and evidence-based pricing support.",category:"Business",short:"Know what it is worth."},
  "rapid-takeoff":{tagline:"Blueprint takeoffs and estimating for construction trades.",category:"Field Tools",short:"Takeoffs without the drag."},
  ghostlane:{tagline:"Privacy-focused route awareness and navigation.",category:"Navigation",short:"Route awareness with privacy first."},
  scouttrace:{tagline:"Mobile security and device-intelligence tools.",category:"Field Tools",short:"Device intelligence in your pocket."},
  "shadownex-prime":{tagline:"Live global situational intelligence from public spatial data.",category:"Field Tools",short:"See the bigger picture."},
  "terraflow-matrix":{tagline:"Mobile landscaping, mowing, lawn care, and irrigation workflows.",category:"Field Tools",short:"Field work that flows."},
  orbitgather:{tagline:"Contractor lead intelligence and opportunity discovery.",category:"Business",short:"Find the next opportunity."}
};

const demoPaths:Record<string,string>={
  "acelynn-pro":"/demos/acelynn-pro-60-second-demo.mp4",
  "fantasy-matrix":"/demos/fantasy-football-matrix-60-second-demo.mp4",
  "first-bearing":"/demos/first-bearing-60-second-demo.mp4",
  machzero:"/demos/machzero-60-second-demo.mp4",
  "rapid-takeoff":"/demos/rapid-takeoff-60-second-demo.mp4",
  ghostlane:"/demos/ghostlane-60-second-demo.mp4",
  scouttrace:"/demos/acelynn-scouttrace-60-second-demo.mp4",
  "shadownex-prime":"/demos/shadownex-prime-60-second-demo.mp4",
  "terraflow-matrix":"/demos/terraflow-matrix-60-second-demo.mp4",
  orbitgather:"/demos/orbitgather-60-second-demo.mp4"
};

const cardAccent:Record<string,string>={
  "acelynn-pro":"#5b78ff",
  noproblem:"#00c9e8",
  "fantasy-matrix":"#55c96a",
  "first-bearing":"#21b9b0",
  rivetex:"#ff8a3d",
  pocketstomp:"#ff9c43",
  machzero:"#4bb4ff",
  "rapid-takeoff":"#ffc14c",
  ghostlane:"#8f76ff",
  scouttrace:"#38d5c8",
  "shadownex-prime":"#21a8c8",
  "terraflow-matrix":"#4cc66d",
  orbitgather:"#4da7ff"
};

function copyFor(app:StudioApp){
  return storefrontCopy[app.id]??{tagline:app.description,category:app.category,short:app.description};
}
function findApps(ids:string[]){return ids.map(id=>studioApps.find(app=>app.id===id)).filter(Boolean) as StudioApp[]}
function accentStyle(app:StudioApp){return {"--accent":cardAccent[app.id]??"#00e0cf"} as CSSProperties}

export default function StorefrontPage(){
  const[q,setQ]=useState("");
  const[category,setCategory]=useState("All Apps");
  const[recentIds,setRecentIds]=useState<string[]>([]);
  const[selected,setSelected]=useState<StudioApp|null>(null);
  const[demo,setDemo]=useState<StudioApp|null>(null);
  const[mobileSearch,setMobileSearch]=useState(false);

  useEffect(()=>{try{const raw=localStorage.getItem(RECENT_KEY);setRecentIds(raw?JSON.parse(raw):[])}catch{}},[]);

  const heroApp=studioApps.find(app=>app.id==="acelynn-pro")??studioApps[0];
  const featured=findApps(featuredIds);
  const newest=findApps(newIds);
  const recent=findApps(recentIds);
  const continueApps=recent.length?recent.slice(0,3):findApps(quickIds);

  const apps=useMemo(()=>studioApps.filter(app=>{
    const copy=copyFor(app);
    const haystack=`${app.name} ${app.shortName} ${copy.tagline} ${copy.category}`.toLowerCase();
    return (!q||haystack.includes(q.toLowerCase()))&&(category==="All Apps"||copy.category===category);
  }),[q,category]);

  function remember(app:StudioApp){
    const next=[app.id,...recentIds.filter(id=>id!==app.id)].slice(0,5);
    setRecentIds(next);try{localStorage.setItem(RECENT_KEY,JSON.stringify(next))}catch{}
  }
  function open(app:StudioApp){remember(app);if(app.url)window.open(app.url,"_blank","noopener,noreferrer")}
  function chooseCategory(name:string){setCategory(name);requestAnimationFrame(()=>document.getElementById("all-apps")?.scrollIntoView({behavior:"smooth",block:"start"}))}

  return <main className={styles.page}>
    <aside className={styles.rail}>
      <a className={styles.railBrand} href="/" aria-label="CactusByte home">
        {cactusByteBrand.src&&<img src={cactusByteBrand.src} alt="" />}
        <span><b>Cactus🌵Byte</b><small>STUDIOS</small></span>
      </a>
      <nav className={styles.railNav} aria-label="CactusByte sections">
        <a className={styles.railOn} href="#home"><i>⌂</i><span>Home</span></a>
        <a href="#apps"><i>◇</i><span>Discover</span></a>
        <a href="#all-apps"><i>▦</i><span>Apps</span></a>
        <a href="#categories"><i>▱</i><span>Categories</span></a>
        <a href="/studio"><i>♧</i><span>Studio</span></a>
        <a href="/studio#releases"><i>◌</i><span>Updates</span></a>
        <a href="/studio"><i>○</i><span>Profile</span></a>
      </nav>
      <div className={styles.railPromo}><small>YOUR APPS.</small><strong>ONE<br/>LAUNCHPAD.</strong>{cactusByteBrand.src&&<img src={cactusByteBrand.src} alt="" />}</div>
    </aside>

    <div className={styles.main}>
      <header className={styles.mobileHeader}>
        <a className={styles.mobileBrand} href="/" aria-label="CactusByte home">
          {cactusByteBrand.src&&<img src={cactusByteBrand.src} alt="" />}
          <span><b>Cactus🌵Byte</b><small>STUDIOS</small></span>
        </a>
        <button className={styles.iconButton} aria-label="Search apps" onClick={()=>setMobileSearch(v=>!v)}>⌕</button>
      </header>

      {mobileSearch&&<label className={styles.mobileSearch}><span>⌕</span><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search apps, tools, and ideas..." /></label>}

      <header className={styles.topbar}>
        <label className={styles.search}><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search apps, tools, and ideas..." /></label>
        <div className={styles.topActions}><a href="/studio#releases" aria-label="Updates">♢</a><a href="/studio" aria-label="Profile">{cactusByteBrand.src&&<img src={cactusByteBrand.src} alt="" />}</a></div>
      </header>

      <section className={styles.heroCard} id="home" style={accentStyle(heroApp)}>
        <video className={styles.heroVideo} src={demoPaths[heroApp.id]} poster="/acelynn-beta-icon.png" autoPlay muted loop playsInline preload="auto"/>
        <div className={styles.heroWash}/>
        <div className={styles.heroContent}>
          <span className={styles.featureBadge}>FEATURED APP</span>
          <div className={styles.heroIdentity}><BrandMark app={heroApp} large/><div><h1>{heroApp.shortName}</h1><p>{copyFor(heroApp).short}</p></div></div>
          <p className={styles.heroDescription}>{copyFor(heroApp).tagline}</p>
          <div className={styles.heroButtons}><button onClick={()=>open(heroApp)}>Open</button><button className={styles.outlineButton} onClick={()=>setDemo(heroApp)}>▶ Watch Demo</button></div>
        </div>
        <div className={styles.heroBrandLine}>Your apps. One launchpad.</div>
        <div className={styles.heroDots}><b/><span/><span/><span/></div>
      </section>

      <StoreSection id="apps" kicker="POWERFUL TOOLS · BUILT BY CACTUSBYTE" title="Our Apps" action="#all-apps">
        <div className={styles.appShelf}>{featured.map(app=><StoreCard key={app.id} app={app} open={open} details={setSelected}/>)}</div>
      </StoreSection>

      <StoreSection kicker={recent.length?"PICK UP WHERE YOU LEFT OFF":"QUICK LAUNCH"} title="Continue Using" action="#all-apps">
        <div className={styles.continueShelf}>{continueApps.map(app=><ContinueCard key={app.id} app={app} open={open}/>)}</div>
      </StoreSection>

      <StoreSection id="categories" kicker="EXPLORE BY WHAT MOVES YOU" title="Categories" action="#all-apps">
        <div className={styles.categoryShelf}>{categories.map((item,index)=><button key={item.name} data-category-index={index} className={category===item.name?styles.categoryOn:""} onClick={()=>chooseCategory(item.name)}><b>{item.icon}</b><span>{item.label}</span><small>{item.hint}</small></button>)}</div>
      </StoreSection>

      <StoreSection kicker="FRESH APPS · BIGGER POSSIBILITIES" title="New from Cactus🌵Byte" action="#all-apps">
        <div className={styles.newShelf}>{newest.map(app=><WideCard key={app.id} app={app} open={open} details={setSelected}/>)}</div>
      </StoreSection>

      <StoreSection id="all-apps" kicker="CACTUSBYTE PORTFOLIO" title={category==="All Apps"?"All Apps":category}>
        <div className={styles.portfolioHead}><span>{apps.length} available</span>{category!=="All Apps"&&<button onClick={()=>setCategory("All Apps")}>Clear filter</button>}</div>
        <div className={styles.allGrid}>{apps.map(app=><StoreCard key={app.id} app={app} open={open} details={setSelected}/>)}</div>
      </StoreSection>

      <footer className={styles.footer}><span>Cactus🌵Byte Studios™ v1.7.0</span><small>Your apps. One launchpad.</small></footer>
    </div>

    <nav className={styles.bottomNav} aria-label="CactusByte navigation">
      <a className={styles.navOn} href="#home"><span>⌂</span>Home</a>
      <a href="#all-apps"><span>▦</span>Apps</a>
      <a href="/studio"><span>♧</span>Studio</a>
      <a href="/studio#releases"><span>◌</span>Updates</a>
      <a href="/studio"><span>○</span>Profile</a>
    </nav>

    {selected&&<div className={styles.backdrop} onClick={()=>setSelected(null)}>
      <section className={styles.detail} data-app={selected.id} style={accentStyle(selected)} onClick={e=>e.stopPropagation()}>
        <button className={styles.close} aria-label="Close details" onClick={()=>setSelected(null)}>×</button>
        <div className={styles.detailGlow}/>
        <div className={styles.detailHero}><BrandMark app={selected} large/><div><span>{copyFor(selected).category}</span><h2>{selected.name}</h2><p>{copyFor(selected).short}</p></div></div>
        <p className={styles.detailDescription}>{copyFor(selected).tagline}</p>
        <div className={styles.detailMeta}><span>{selected.version}</span><span>{selected.platform}</span><span>{selected.status}</span></div>
        <div className={styles.detailActions}><button onClick={()=>open(selected)}>Open App</button>{demoPaths[selected.id]&&<button className={styles.outlineButton} onClick={()=>setDemo(selected)}>▶ Watch Demo</button>}</div>
        {brandAssets[selected.id]?.status==="unresolved"&&<p className={styles.brandWarning}>Official logo pending recovery. No substitute artwork is being used.</p>}
      </section>
    </div>}

    {demo&&demoPaths[demo.id]&&<div className={styles.backdrop} onClick={()=>setDemo(null)}>
      <section className={styles.demoModal} onClick={e=>e.stopPropagation()}>
        <button className={styles.close} aria-label="Close demo" onClick={()=>setDemo(null)}>×</button>
        <div className={styles.demoTitle}><BrandMark app={demo}/><div><small>60-SECOND DEMO</small><h2>{demo.name}</h2></div></div>
        <video src={demoPaths[demo.id]} controls autoPlay playsInline/>
      </section>
    </div>}
  </main>
}

function StoreSection({id,kicker,title,action,children}:{id?:string;kicker:string;title:string;action?:string;children:React.ReactNode}){
  return <section className={styles.section} id={id}><div className={styles.sectionHead}><div><small>{kicker}</small><h2>{title}</h2></div>{action&&<a href={action}>See All ›</a>}</div>{children}</section>
}

function StoreCard({app,open,details}:{app:StudioApp;open:(app:StudioApp)=>void;details:(app:StudioApp)=>void}){
  const copy=copyFor(app);
  return <article className={styles.storeCard} data-app={app.id} style={accentStyle(app)}>
    <div className={styles.cardAura}/>
    <BrandMark app={app}/>
    <span className={styles.cardCategory}>{copy.category}</span>
    <h3>{app.shortName}</h3><p>{copy.short}</p>
    <div className={styles.cardButtons}><button onClick={()=>open(app)}>Open</button><button className={styles.cardDetails} aria-label={`Details for ${app.name}`} onClick={()=>details(app)}>Details</button></div>
  </article>
}

function ContinueCard({app,open}:{app:StudioApp;open:(app:StudioApp)=>void}){
  const copy=copyFor(app),video=demoPaths[app.id];
  return <button className={styles.continueCard} data-app={app.id} style={accentStyle(app)} onClick={()=>open(app)}>
    {video&&<video className={styles.continueMedia} src={video} muted loop autoPlay playsInline preload="metadata"/>}
    <div className={styles.continueShade}/><BrandMark app={app}/><span><b>{app.shortName}</b><small>{copy.short}</small></span><i>▶</i>
  </button>
}

function WideCard({app,open,details}:{app:StudioApp;open:(app:StudioApp)=>void;details:(app:StudioApp)=>void}){
  const copy=copyFor(app),video=demoPaths[app.id];
  return <article className={styles.wideCard} data-app={app.id} style={accentStyle(app)}>
    {video&&<video className={styles.wideMedia} src={video} muted loop autoPlay playsInline preload="metadata"/>}
    <div className={styles.wideShade}/><BrandMark app={app}/><div><span>{copy.category}</span><h3>{app.shortName}</h3><p>{copy.short}</p></div>
    <button onClick={()=>open(app)}>Open</button><button className={styles.wideDetails} aria-label={`Details for ${app.name}`} onClick={()=>details(app)}>›</button>
  </article>
}

function BrandMark({app,large=false}:{app:StudioApp;large?:boolean}){
  const brand=verifiedBrandAsset(app.id);
  if(!brand)return <div className={large?styles.wordmarkLarge:styles.wordmark} aria-label={`${app.shortName} official logo pending recovery`}><span>{app.shortName}</span><small>Official logo pending recovery</small></div>;
  return <div className={large?styles.logoLarge:styles.logo}><img src={brand.src!} alt={`${app.shortName} official logo`}/></div>;
}
