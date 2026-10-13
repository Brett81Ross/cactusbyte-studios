"use client";

import {useEffect,useMemo,useState,type CSSProperties} from "react";
import {studioApps,type StudioApp} from "../../data/apps";
import {brandAssets,cactusByteBrand,verifiedBrandAsset} from "../../data/brand-assets";
import styles from "./storefront.module.css";

const RECENT_KEY="cb-storefront-recent-v4";
const STOREFRONT_VERSION="1.8.0";

const featuredIds=["acelynn-pro","first-bearing","fantasy-matrix","hustle-first","rivetex"];
const moreIds=["shadownex-prime","scouttrace","rapid-takeoff","terraflow-matrix","machzero","pocketstomp"];
const categories=[
  {name:"All Apps",label:"All Apps"},
  {name:"Business",label:"Productivity"},
  {name:"Field Tools",label:"Field Tools"},
  {name:"Music & Audio",label:"Audio"},
  {name:"Recovery",label:"Recovery"},
  {name:"Sports",label:"Sports"},
  {name:"Construction",label:"Construction"},
  {name:"Security",label:"Security"},
  {name:"Marketplace",label:"Marketplace"}
];

const storefrontCopy:Record<string,{tagline:string;category:string;short:string;eyebrow?:string}>={
  "acelynn-pro":{tagline:"Professional audio diagnostics and A/B mix guidance for a clearer world.",category:"Music & Audio",short:"Hear More. Know More.",eyebrow:"REAL-TIME ANALYSIS · PRO AUDIO TOOLS"},
  noproblem:{tagline:"Property intelligence and guided field evidence for smarter service decisions.",category:"Field Tools",short:"Property intelligence, field ready."},
  "fantasy-matrix":{tagline:"Lineup, injury, waiver, and matchup decision support.",category:"Sports",short:"Smarter insights. Bigger wins."},
  "first-bearing":{tagline:"Private recovery tools for daily direction, connection, and support.",category:"Recovery",short:"Navigate further. Get home safer."},
  rivetex:{tagline:"Field-service operations, verified work evidence, and job coordination.",category:"Business",short:"Built for the field. Backed by real work."},
  pocketstomp:{tagline:"Skate-session tracking, trick feedback, speed, and coaching.",category:"Sports",short:"Create. Play. Take it anywhere."},
  machzero:{tagline:"Fast resale estimates and evidence-based pricing support.",category:"Business",short:"Know what it is worth."},
  "rapid-takeoff":{tagline:"Blueprint takeoffs and estimating for construction trades.",category:"Construction",short:"From plans to progress. Faster."},
  ghostlane:{tagline:"Privacy-focused route awareness and navigation.",category:"Navigation",short:"Route awareness with privacy first."},
  scouttrace:{tagline:"Mobile security and device-intelligence tools.",category:"Security",short:"Track. Identify. Protect."},
  "shadownex-prime":{tagline:"Live global situational intelligence from public spatial data.",category:"Field Tools",short:"See what others miss. Stay ahead."},
  "terraflow-matrix":{tagline:"Mobile landscaping, mowing, lawn care, and irrigation workflows.",category:"Field Tools",short:"Map. Manage. Grow."},
  orbitgather:{tagline:"Contractor lead intelligence and opportunity discovery.",category:"Business",short:"Find the next opportunity."},
  "hustle-first":{tagline:"Private community marketplace for buying, selling, trading, and services.",category:"Marketplace",short:"Buy. Sell. Build. Hustle together."}
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
  "acelynn-pro":"#9d4dff",
  noproblem:"#16d9ff",
  "fantasy-matrix":"#4ce37c",
  "first-bearing":"#f4bf62",
  rivetex:"#ff9838",
  pocketstomp:"#ff4fd8",
  machzero:"#47a8ff",
  "rapid-takeoff":"#447dff",
  ghostlane:"#8f76ff",
  scouttrace:"#00e6b8",
  "shadownex-prime":"#38bdf8",
  "terraflow-matrix":"#7ade55",
  orbitgather:"#4da7ff",
  "hustle-first":"#ff9f35"
};

function copyFor(app:StudioApp){
  return storefrontCopy[app.id]??{tagline:app.description,category:app.category,short:app.description};
}
function findApps(ids:string[]){return ids.map(id=>studioApps.find(app=>app.id===id)).filter(Boolean) as StudioApp[]}
function accentStyle(app:StudioApp){return {"--accent":cardAccent[app.id]??"#00f0b5"} as CSSProperties}

export default function StorefrontPage(){
  const[q,setQ]=useState("");
  const[category,setCategory]=useState("All Apps");
  const[recentIds,setRecentIds]=useState<string[]>([]);
  const[selected,setSelected]=useState<StudioApp|null>(null);
  const[demo,setDemo]=useState<StudioApp|null>(null);
  const[mobileSearch,setMobileSearch]=useState(false);
  const[showAll,setShowAll]=useState(false);

  useEffect(()=>{try{const raw=localStorage.getItem(RECENT_KEY);setRecentIds(raw?JSON.parse(raw):[])}catch{}},[]);

  const heroApp=studioApps.find(app=>app.id==="acelynn-pro")??studioApps[0];
  const featured=findApps(featuredIds);
  const more=findApps(moreIds);
  const recent=findApps(recentIds);
  const apps=useMemo(()=>studioApps.filter(app=>{
    const copy=copyFor(app);
    const haystack=`${app.name} ${app.shortName} ${copy.tagline} ${copy.category}`.toLowerCase();
    return (!q||haystack.includes(q.toLowerCase()))&&(category==="All Apps"||copy.category===category||app.category===category);
  }),[q,category]);
  const visibleApps=showAll||q||category!=="All Apps"?apps:apps.slice(0,8);

  function remember(app:StudioApp){
    const next=[app.id,...recentIds.filter(id=>id!==app.id)].slice(0,5);
    setRecentIds(next);try{localStorage.setItem(RECENT_KEY,JSON.stringify(next))}catch{}
  }
  function open(app:StudioApp){remember(app);if(app.url)window.open(app.url,"_blank","noopener,noreferrer")}
  function chooseCategory(name:string){setCategory(name);requestAnimationFrame(()=>document.getElementById("all-apps")?.scrollIntoView({behavior:"smooth",block:"start"}))}

  return <main className={styles.page}>
    <aside className={styles.brandRail}>
      <a className={styles.brandLockup} href="/" aria-label="CactusByte home">
        {cactusByteBrand.src&&<img src={cactusByteBrand.src} alt="" />}
        <span><b>CACTUSBYTE</b><small>STUDIOS</small></span>
      </a>
      <div className={styles.railStatement}>
        <span>BOLDER APPS</span><span>BRIGHTER</span><span>REAL WORLDS</span>
      </div>
      <nav className={styles.railNav} aria-label="CactusByte sections">
        <a className={styles.railOn} href="#home">⌂ <span>Home</span></a>
        <a href="#featured">◇ <span>Discover</span></a>
        <a href="#all-apps">▦ <span>Apps</span></a>
        <a href="#categories">◫ <span>Categories</span></a>
        <a href="/studio">✦ <span>Studio</span></a>
      </nav>
      <div className={styles.railPlaque}><span>APPS</span><span>PEOPLE</span><span>BUILD</span><span>REAL</span><span>THINGS</span><b>🌵</b></div>
    </aside>

    <div className={styles.shell}>
      <header className={styles.topbar}>
        <a className={styles.mobileBrand} href="/" aria-label="CactusByte home">
          {cactusByteBrand.src&&<img src={cactusByteBrand.src} alt="" />}
          <span><b>CactusByte Studios</b><small>Your apps. One launchpad.</small></span>
        </a>
        <label className={styles.search}><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search apps, tools, creators..." /></label>
        <div className={styles.topActions}>
          <a href="/studio#releases" aria-label="Updates">♢</a>
          <a href="/studio" aria-label="Profile">{cactusByteBrand.src&&<img src={cactusByteBrand.src} alt="" />}</a>
          <button className={styles.mobileSearchToggle} aria-label="Search apps" onClick={()=>setMobileSearch(v=>!v)}>⌕</button>
        </div>
      </header>

      {mobileSearch&&<label className={styles.mobileSearch}><span>⌕</span><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search apps..." /></label>}

      <section className={styles.hero} id="home" style={accentStyle(heroApp)}>
        <video className={styles.heroMedia} src={demoPaths[heroApp.id]} poster="/acelynn-beta-icon.png" autoPlay muted loop playsInline preload="metadata"/>
        <div className={styles.heroOverlay}/>
        <div className={styles.heroNoise}/>
        <div className={styles.heroCopy}>
          <span className={styles.featureBadge}>FEATURED APP</span>
          <div className={styles.heroIdentity}><BrandMark app={heroApp} large/><div><h1>{heroApp.shortName}</h1><p>{copyFor(heroApp).short}</p></div></div>
          <p className={styles.heroDescription}>{copyFor(heroApp).tagline}</p>
          <div className={styles.heroActions}>
            <button onClick={()=>open(heroApp)}>Open App <span>→</span></button>
            <button className={styles.secondaryButton} onClick={()=>setDemo(heroApp)}>▶ Watch Demo</button>
          </div>
          <div className={styles.heroFeatures}>
            <span>✦ Real-Time Analysis</span><span>✦ AI-Powered Tools</span><span>✦ Stunning Clarity</span><span>✦ Pro Audio Engine</span>
          </div>
        </div>
        <div className={styles.heroSlogan}><small>A CLEARER</small><b>WORLD</b><small>SOUNDS</small><b>BETTER</b></div>
      </section>

      <div className={styles.categoryStrip} id="categories">
        {categories.map(item=><button key={item.name} className={category===item.name?styles.categoryOn:""} onClick={()=>chooseCategory(item.name)}>{item.label}</button>)}
      </div>

      <section className={styles.section} id="featured">
        <SectionHead title="Featured Apps" subtitle="Powerful tools for real-world builders, creators, and doers." action="#all-apps"/>
        <div className={styles.featuredGrid}>{featured.map(app=><PosterCard key={app.id} app={app} open={open} details={setSelected}/>)}</div>
      </section>

      <section className={styles.section}>
        <SectionHead title="More from CactusByte Studios" subtitle="Different worlds. Same mission — premium tools for a bolder tomorrow." action="#all-apps"/>
        <div className={styles.moreGrid}>{more.map(app=><PosterCard key={app.id} app={app} open={open} details={setSelected} compact/>)}</div>
      </section>

      {recent.length>0&&<section className={styles.section}>
        <SectionHead title="Recently Opened" subtitle="Jump back into what you were using."/>
        <div className={styles.recentGrid}>{recent.slice(0,4).map(app=><PosterCard key={app.id} app={app} open={open} details={setSelected} compact/>)}</div>
      </section>}

      <section className={styles.section} id="all-apps">
        <SectionHead title={category==="All Apps"?"All Apps":category} subtitle={category==="All Apps"?"The complete CactusByte ecosystem.":`${apps.length} matching apps`}/>
        <div className={styles.allGrid}>{visibleApps.map(app=><PosterCard key={app.id} app={app} open={open} details={setSelected} compact/>)}</div>
        {!q&&category==="All Apps"&&apps.length>8&&<button className={styles.showAllButton} onClick={()=>setShowAll(v=>!v)}>{showAll?"Show Less":"View All Apps"} <span>{showAll?"↑":"↓"}</span></button>}
      </section>

      <footer className={styles.footer}>
        <div><b>CACTUSBYTE STUDIOS</b><small>APPS FOR A BRIGHTER TOMORROW</small></div>
        <span>v{STOREFRONT_VERSION}</span>
      </footer>
    </div>

    <nav className={styles.bottomNav} aria-label="CactusByte navigation">
      <a className={styles.navOn} href="#home"><span>⌂</span>Home</a>
      <a href="#all-apps"><span>▦</span>My Apps</a>
      <a href="/studio#releases"><span>◌</span>Updates</a>
      <a href="#featured"><span>◇</span>Explore</a>
      <a href="#categories"><span>◫</span>Categories</a>
      <a href="/studio"><span>⚙</span>Settings</a>
    </nav>

    {selected&&<div className={styles.backdrop} onClick={()=>setSelected(null)}>
      <section className={styles.detail} data-app={selected.id} style={accentStyle(selected)} onClick={e=>e.stopPropagation()}>
        <button className={styles.close} aria-label="Close details" onClick={()=>setSelected(null)}>×</button>
        <div className={styles.detailGlow}/>
        <div className={styles.detailHero}><BrandMark app={selected} large/><div><span>{copyFor(selected).category}</span><h2>{selected.name}</h2><p>{copyFor(selected).short}</p></div></div>
        <p className={styles.detailDescription}>{copyFor(selected).tagline}</p>
        <div className={styles.detailMeta}><span>{selected.version}</span><span>{selected.platform}</span><span>{selected.status}</span></div>
        <div className={styles.detailActions}><button onClick={()=>open(selected)}>Open App</button>{demoPaths[selected.id]&&<button className={styles.secondaryButton} onClick={()=>setDemo(selected)}>▶ Watch Demo</button>}</div>
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

function SectionHead({title,subtitle,action}:{title:string;subtitle:string;action?:string}){
  return <div className={styles.sectionHead}><div><h2>{title}</h2><p>{subtitle}</p></div>{action&&<a href={action}>View All →</a>}</div>
}

function PosterCard({app,open,details,compact=false}:{app:StudioApp;open:(app:StudioApp)=>void;details:(app:StudioApp)=>void;compact?:boolean}){
  const copy=copyFor(app),video=demoPaths[app.id];
  return <article className={compact?styles.posterCardCompact:styles.posterCard} data-app={app.id} style={accentStyle(app)}>
    <button className={styles.posterHit} aria-label={`Open ${app.name}`} onClick={()=>open(app)}/>
    {video&&<video className={styles.posterMedia} src={video} muted loop autoPlay playsInline preload="metadata"/>}
    <div className={styles.posterArt}/>
    <div className={styles.posterShade}/>
    <div className={styles.posterTop}><BrandMark app={app}/><span>{copy.category}</span></div>
    <div className={styles.posterBody}><h3>{app.shortName}</h3><p>{copy.short}</p></div>
    <button className={styles.posterDetails} aria-label={`Details for ${app.name}`} onClick={()=>details(app)}>›</button>
  </article>
}

function BrandMark({app,large=false}:{app:StudioApp;large?:boolean}){
  const brand=verifiedBrandAsset(app.id);
  if(!brand)return <div className={large?styles.wordmarkLarge:styles.wordmark} aria-label={`${app.shortName} official logo pending recovery`}><span>{large?app.shortName:"LOGO"}</span><small>{large?"Official logo pending recovery":"Pending"}</small></div>;
  return <div className={large?styles.logoLarge:styles.logo}><img src={brand.src!} alt={`${app.shortName} official logo`}/></div>;
}
