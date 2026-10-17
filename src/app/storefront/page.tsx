"use client";

import {useEffect,useMemo,useState,type CSSProperties,type MouseEvent} from "react";
import {studioApps,type StudioApp} from "../../data/apps";
import {brandAssets,cactusByteBrand,verifiedBrandAsset} from "../../data/brand-assets";
import styles from "./storefront.module.css";

const RECENT_KEY="cb-storefront-recent-v4";
const STOREFRONT_VERSION="1.7.0";

const featuredIds=["acelynn-pro","noproblem","fantasy-matrix","first-bearing","rivetex","pocketstomp"];
const moreIds=["shadownex-prime","scouttrace","rapid-takeoff","terraflow-matrix","machzero","orbitgather"];
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
  const[showCategoryFilters,setShowCategoryFilters]=useState(false);

  useEffect(()=>{
    if(!selected&&!demo)return;
    const dismiss=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){setSelected(null);setDemo(null)}
    };
    document.addEventListener("keydown",dismiss);
    return ()=>document.removeEventListener("keydown",dismiss);
  },[selected,demo]);

  useEffect(()=>{
    try{
      const raw=localStorage.getItem(RECENT_KEY);
      const saved:unknown=raw?JSON.parse(raw):[];
      if(!Array.isArray(saved))return;
      const valid=saved.filter((id):id is string=>typeof id==="string"&&studioApps.some(app=>app.id===id));
      setRecentIds([...new Set(valid)].slice(0,5));
    }catch{/* Invalid or unavailable browser storage must not block the storefront. */}
  },[]);

  const heroApp=studioApps.find(app=>app.id==="acelynn-pro")??studioApps[0];
  const featured=findApps(featuredIds);
  const more=findApps(moreIds);
  const recent=findApps(recentIds);
  const recommended=findApps(["noproblem","fantasy-matrix","first-bearing","rivetex","pocketstomp"]);
  const searchQuery=q.trim().toLowerCase();
  const searchMode=searchQuery.length>0;
  const apps=useMemo(()=>studioApps.filter(app=>{
    const copy=copyFor(app);
    const haystack=`${app.name} ${app.shortName} ${copy.tagline} ${copy.category}`.toLowerCase();
    return (!searchQuery||haystack.includes(searchQuery))&&(searchQuery.length>0||category==="All Apps"||(category==="Beta Labs"?app.channel==="beta":copy.category===category||app.category===category));
  }),[searchQuery,category]);
  const visibleApps=showAll||searchMode||category!=="All Apps"?apps:apps.slice(0,8);

  function remember(app:StudioApp){
    const next=[app.id,...recentIds.filter(id=>id!==app.id)].slice(0,5);
    setRecentIds(next);try{localStorage.setItem(RECENT_KEY,JSON.stringify(next))}catch{}
  }
  function open(app:StudioApp){remember(app);if(app.url)window.open(app.url,"_blank","noopener,noreferrer")}
  function chooseCategory(name:string){
    setCategory(name);setQ("");setMobileSearch(false);
    requestAnimationFrame(()=>document.getElementById("all-apps")?.scrollIntoView({behavior:"smooth",block:"start"}));
  }
  function browseFromSearch(event:MouseEvent<HTMLAnchorElement>,target:string){
    if(!searchMode)return;
    event.preventDefault();setQ("");setMobileSearch(false);
    requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById(target)?.scrollIntoView({behavior:"smooth",block:"start"})));
  }

  return <main className={styles.page}>
    <aside className={styles.brandRail}>
      <a className={styles.brandLockup} href="/" aria-label="CactusByte home">
        {cactusByteBrand.src&&<img src={cactusByteBrand.src} alt="" />}
        <span><b>Cactus🌵Byte</b><small>STUDIOS</small></span>
      </a>
      <div className={styles.railStatement}>
        <span>BOLDER APPS</span><span>BRIGHTER</span><span>REAL WORLDS</span>
      </div>
      <div className={styles.railArt} aria-hidden="true"><strong>Create<br/>Brighter<br/>Days.</strong><b>🌵</b></div>
      <nav className={styles.railNav} aria-label="CactusByte sections">
        <a className={styles.railOn} href="#home" onClick={e=>browseFromSearch(e,"home")}>⌂ <span>Home</span></a>
        <a href="#featured" onClick={e=>browseFromSearch(e,"featured")}>◇ <span>Discover</span></a>
        <a href="#all-apps">▦ <span>Apps</span></a>
        <a href="#categories" onClick={e=>browseFromSearch(e,"categories")}>◫ <span>Categories</span></a>
        <a href="/studio">✦ <span>Studio</span></a>
        <a href="/studio#releases">◌ <span>Updates</span></a>
        <a href="/studio#settings">♙ <span>Profile</span></a>
      </nav>
      <div className={styles.railPlaque}><span>APPS</span><span>PEOPLE</span><span>BUILD</span><span>REAL</span><span>THINGS</span><b>🌵</b></div>
    </aside>

    <div className={styles.shell}>
      <header className={styles.topbar}>
        <a className={styles.mobileBrand} href="/" aria-label="CactusByte home">
          {cactusByteBrand.src&&<img src={cactusByteBrand.src} alt="" />}
          <span><b>Cactus🌵Byte</b><small>STUDIOS · YOUR APPS. ONE LAUNCHPAD.</small></span>
        </a>
        <label className={styles.search}><span>⌕</span><input aria-label="Search apps" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search apps, tools, creators..." /></label>
        <div className={styles.topActions}>
          <a href="/studio#releases" aria-label="Updates">♢</a>
          <a href="/studio#settings" aria-label="Profile">{cactusByteBrand.src&&<img src={cactusByteBrand.src} alt="" />}</a>
          <button className={styles.mobileSearchToggle} aria-label={mobileSearch?"Close search":"Search apps"} aria-expanded={mobileSearch} onClick={()=>{if(mobileSearch)setQ("");setMobileSearch(v=>!v)}}>⌕</button>
        </div>
      </header>

      {mobileSearch&&<label className={styles.mobileSearch}><span>⌕</span><input aria-label="Search apps" autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search apps..." /></label>}

      {!searchMode&&<>
      <section className={styles.hero} id="home" style={accentStyle(heroApp)}>
        <div className={styles.heroPortrait} aria-hidden="true"><div className={styles.heroWaveform}><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div><div className={styles.heroVinyl}/></div>
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
        <div className={styles.heroSlogan}><small>MUSIC</small><b>FEELS</b><small>BETTER WHEN</small><b>IT’S CLEAR</b></div>
      </section>

      <section className={styles.heroTools} aria-label="Acelynn Pro capabilities">
        <div><span aria-hidden="true">≋</span><b>Analyze</b><small>Check your mix</small></div>
        <div><span aria-hidden="true">◫</span><b>A/B Compare</b><small>Compare versions</small></div>
        <div><span aria-hidden="true">▤</span><b>Save</b><small>Keep snapshots</small></div>
        <div><span aria-hidden="true">◈</span><b>Insights</b><small>Hear the difference</small></div>
      </section>
      <section className={styles.heroAbout} aria-label="About Acelynn Pro"><div><h2>About Acelynn Pro</h2><p>Audio diagnostics and mix guidance for better balance, clearer frequencies, and confident A/B comparisons.</p></div><button onClick={()=>setDemo(heroApp)} aria-label="Watch Acelynn Pro demo">Watch Demo →</button></section>

      <section className={styles.section} id="featured">
        <SectionHead title="Featured Apps" subtitle="Powerful tools. Real possibilities. Built by CactusByte Studios." action="#all-apps"/>
        <div className={styles.featuredGrid}>{featured.map(app=><PosterCard key={app.id} app={app} open={open} details={setSelected}/>)}</div>
      </section>

      {recent.length>0&&<section className={styles.section}>
        <SectionHead title="Continue Using" subtitle="Pick up where you left off." action="#all-apps"/>
        <div className={styles.recentGrid}>{recent.slice(0,4).map(app=><PosterCard key={app.id} app={app} open={open} details={setSelected} compact/>)}</div>
      </section>}

      <section className={styles.section} id="categories" aria-label="Explore categories">
        <SectionHead title="Explore Categories" subtitle="Find apps by what moves you." action="#all-apps"/>
        <div className={styles.categoryTiles}>
          {([{id:"Music & Audio",label:"Music",glyph:"♫",sub:"Hear more"},{id:"Business",label:"Business",glyph:"▣",sub:"Build & grow"},{id:"Field Tools",label:"Field Tools",glyph:"⚒",sub:"Get it done"},{id:"Sports",label:"Sports",glyph:"✦",sub:"Play smarter"},{id:"Beta Labs",label:"Beta Labs",glyph:"✳",sub:"Early access"},{id:"All Apps",label:"All Apps",glyph:"🌵",sub:"Explore everything"}] as const).map(t=><button className={styles.categoryTile} data-category={t.id} key={t.id} aria-pressed={category===t.id} onClick={()=>chooseCategory(t.id)}><span>{t.glyph}</span><b>{t.label}</b><small>{t.sub}</small></button>)}
        </div>
        <button className={styles.categoryMoreToggle} aria-controls="category-filter-options" aria-expanded={showCategoryFilters} onClick={()=>setShowCategoryFilters(v=>!v)}>{showCategoryFilters?"Hide categories":"More categories"} <span aria-hidden="true">{showCategoryFilters?"↑":"↓"}</span></button>
        <div className={styles.categoryStrip} id="category-filter-options" hidden={!showCategoryFilters}>
          {categories.map(item=><button key={item.name} className={category===item.name?styles.categoryOn:""} aria-pressed={category===item.name} onClick={()=>chooseCategory(item.name)}>{item.label}</button>)}
        </div>
      </section>

      <section className={styles.section}>
        <SectionHead title="More from CactusByte Studios" subtitle="Different worlds. Same mission — premium tools for a bolder tomorrow." action="#all-apps"/>
        <div className={styles.moreGrid}>{more.map(app=><PosterCard key={app.id} app={app} open={open} details={setSelected} compact/>)}</div>
      </section>

      <section className={styles.section}>
        <SectionHead title="Recommended Apps" subtitle="More tools from our verified app lineup." action="#all-apps"/>
        <div className={styles.recommendGrid}>{recommended.map(app=><PosterCard key={app.id} app={app} open={open} details={setSelected} compact/>)}</div>
      </section>
      </>}

      <section className={styles.section} id="all-apps" aria-label={searchMode?"App search results":undefined}>
        <SectionHead title={searchMode?"Search results":category==="All Apps"?"All Apps":category} subtitle={searchMode?`${apps.length} ${apps.length===1?"app":"apps"} matching “${q.trim()}”`:category==="All Apps"?"The complete CactusByte ecosystem.":`${apps.length} matching apps`}/>
        <div className={styles.allGrid}>{visibleApps.map(app=><PosterCard key={app.id} app={app} open={open} details={setSelected} compact/>)}</div>
        {visibleApps.length===0&&<p className={styles.emptyState} role="status">No apps match your search or category. Try another search or select All Apps.</p>}
        {!searchMode&&category==="All Apps"&&apps.length>8&&<button className={styles.showAllButton} onClick={()=>setShowAll(v=>!v)}>{showAll?"Show Less":"View All Apps"} <span>{showAll?"↑":"↓"}</span></button>}
      </section>

      <footer className={styles.footer}>
        <div><a className={styles.footerBrand} href="/" aria-label="CactusByte Studios app home">Cactus🌵Byte Studios™</a><small>All Rights Reserved</small></div>
        <span>v{STOREFRONT_VERSION}</span>
      </footer>
    </div>

    <nav className={styles.bottomNav} aria-label="CactusByte navigation">
      <a className={styles.navOn} href="#home" onClick={e=>browseFromSearch(e,"home")}><span>⌂</span>Home</a>
      <a href="#all-apps"><span>▦</span>Apps</a>
      <a href="/studio"><span>🌵</span>Studio</a>
      <a href="/studio#releases"><span>◌</span>Updates</a>
      <a href="/studio#settings"><span>♙</span>Profile</a>
    </nav>

    {selected&&<div className={styles.backdrop} onClick={()=>setSelected(null)}>
      <section className={styles.detail} data-app={selected.id} style={accentStyle(selected)} role="dialog" aria-modal="true" aria-labelledby={`detail-${selected.id}`} onClick={e=>e.stopPropagation()}>
        <button className={styles.close} aria-label="Close details" onClick={()=>setSelected(null)}>×</button>
        <div className={styles.detailGlow}/>
        <div className={styles.detailHero}><BrandMark app={selected} large/><div><span>{copyFor(selected).category}</span><h2 id={`detail-${selected.id}`}>{selected.name}</h2><p>{copyFor(selected).short}</p></div></div>
        <p className={styles.detailDescription}>{copyFor(selected).tagline}</p>
        <div className={styles.detailMeta}><span>{selected.version}</span><span>{selected.platform}</span><span>{selected.status}</span></div>
        <div className={styles.detailActions}><button onClick={()=>open(selected)}>Open App</button>{demoPaths[selected.id]&&<button className={styles.secondaryButton} onClick={()=>{setSelected(null);setDemo(selected)}}>▶ Watch Demo</button>}</div>
        {brandAssets[selected.id]?.status==="unresolved"&&<p className={styles.brandWarning}>Official logo pending recovery. No substitute artwork is being used.</p>}
      </section>
    </div>}

    {demo&&demoPaths[demo.id]&&<div className={styles.backdrop} onClick={()=>setDemo(null)}>
      <section className={styles.demoModal} role="dialog" aria-modal="true" aria-labelledby={`demo-${demo.id}`} onClick={e=>e.stopPropagation()}>
        <button className={styles.close} aria-label="Close demo" onClick={()=>setDemo(null)}>×</button>
        <div className={styles.demoTitle}><BrandMark app={demo}/><div><small>60-SECOND DEMO</small><h2 id={`demo-${demo.id}`}>{demo.name}</h2></div></div>
        <video src={demoPaths[demo.id]} controls autoPlay playsInline/>
      </section>
    </div>}
  </main>
}

function SectionHead({title,subtitle,action}:{title:string;subtitle:string;action?:string}){
  return <div className={styles.sectionHead}><div><h2>{title}</h2><p>{subtitle}</p></div>{action&&<a href={action}>View All →</a>}</div>
}

function PosterCard({app,open,details,compact=false}:{app:StudioApp;open:(app:StudioApp)=>void;details:(app:StudioApp)=>void;compact?:boolean}){
  const copy=copyFor(app);
  return <article className={compact?styles.posterCardCompact:styles.posterCard} data-app={app.id} style={accentStyle(app)}>
    <button className={styles.posterHit} aria-label={`Open ${app.name}`} onClick={()=>open(app)}/>
    {/* Avoid autoplaying a grid of demos; each real video remains available from app details. */}
    <div className={styles.posterArt} aria-hidden="true"><img src={`/posters/${app.id}.svg`} alt="" loading={compact?"lazy":"eager"} decoding="async"/></div>
    <div className={styles.posterShade}/>
    <div className={styles.posterTop}><BrandMark app={app}/><span>{copy.category}</span></div>
    <div className={styles.posterBody}><h3>{app.shortName}</h3><p>{copy.short}</p><span className={styles.posterCta} aria-hidden="true">{app.url?"Open":"Details"} ↗</span></div>
    <button className={styles.posterDetails} aria-label={`Details for ${app.name}`} onClick={()=>details(app)}>›</button>
  </article>
}

function BrandMark({app,large=false}:{app:StudioApp;large?:boolean}){
  const brand=verifiedBrandAsset(app.id);
  if(!brand)return <div className={large?styles.wordmarkLarge:styles.wordmark} aria-label={`${app.shortName} official logo pending recovery`}><span>{large?app.shortName:"LOGO"}</span><small>{large?"Official logo pending recovery":"Pending"}</small></div>;
  return <div className={large?styles.logoLarge:styles.logo}><img src={brand.src!} alt={`${app.shortName} official logo`}/></div>;
}
