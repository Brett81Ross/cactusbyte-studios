"use client";

import {useEffect,useMemo,useState,type CSSProperties} from "react";
import {studioApps,type StudioApp} from "../../data/apps";
import {brandAssets,cactusByteBrand,verifiedBrandAsset} from "../../data/brand-assets";
import styles from "./storefront.module.css";

const RECENT_KEY="cb-storefront-recent-v4";
const STOREFRONT_VERSION="1.8.0";
const featuredIds=["acelynn-pro","first-bearing","fantasy-matrix","hustle-first","kitchen-bearing"];
const showcaseIds=["rivetex","shadownex-prime","scouttrace","rapid-takeoff","terraflow-matrix","pocketstomp"];
const categories=[
  {name:"All Apps",label:"All Apps"},
  {name:"Business",label:"Productivity"},
  {name:"Field Tools",label:"Field Tools"},
  {name:"Music & Audio",label:"Audio"},
  {name:"Sports",label:"Sports"},
  {name:"Recovery",label:"Recovery"},
  {name:"Security",label:"Security"},
  {name:"Marketplace",label:"Marketplace"}
];

const storefrontCopy:Record<string,{tagline:string;category:string;short:string}>={
  "acelynn-pro":{tagline:"Mix Check & A/B Compare with actionable audio guidance.",category:"Music & Audio",short:"Hear More. Know More."},
  noproblem:{tagline:"Property intelligence and guided field evidence for smarter service decisions.",category:"Field Tools",short:"Property intelligence, field ready."},
  "fantasy-matrix":{tagline:"Lineup, injury, waiver, and matchup decision support.",category:"Sports",short:"Smarter insights. Bigger wins."},
  "first-bearing":{tagline:"Private recovery tools for daily direction, connection, and support.",category:"Recovery",short:"Navigate further. Find your bearing."},
  "kitchen-bearing":{tagline:"Kitchen operations, menus, duties, and facility coordination.",category:"Field Tools",short:"Recipes. Direction. A better table."},
  "hustle-first":{tagline:"Private community marketplace for clients to sell, trade, give, and offer services.",category:"Marketplace",short:"Buy. Sell. Build. Hustle together."},
  rivetex:{tagline:"Field-service operations, verified work evidence, and job coordination.",category:"Business",short:"Built for the field. Backed by real work."},
  pocketstomp:{tagline:"Skate-session tracking, trick feedback, speed, and coaching.",category:"Sports",short:"Create. Ride. Take it anywhere."},
  machzero:{tagline:"Fast resale estimates and evidence-based pricing support.",category:"Business",short:"Know what it is worth."},
  "rapid-takeoff":{tagline:"Blueprint takeoffs and estimating for construction trades.",category:"Field Tools",short:"From plans to progress. Faster."},
  ghostlane:{tagline:"Privacy-focused route awareness and navigation.",category:"Navigation",short:"Route awareness with privacy first."},
  scouttrace:{tagline:"Mobile security and device-intelligence tools.",category:"Security",short:"Track. Identify. Protect."},
  "shadownex-prime":{tagline:"Live global situational intelligence from public spatial data.",category:"Field Tools",short:"See what others miss. Stay ahead."},
  "terraflow-matrix":{tagline:"Mobile landscaping, mowing, lawn care, and irrigation workflows.",category:"Field Tools",short:"Map. Manage. Grow."},
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
  "acelynn-pro":"#b74cff",
  noproblem:"#00d8ff",
  "fantasy-matrix":"#52f58b",
  "first-bearing":"#d4ad62",
  "kitchen-bearing":"#f1b96b",
  "hustle-first":"#ff9c2f",
  rivetex:"#ff8a3d",
  pocketstomp:"#ff47cf",
  machzero:"#4bb4ff",
  "rapid-takeoff":"#448dff",
  ghostlane:"#8f76ff",
  scouttrace:"#00efad",
  "shadownex-prime":"#5bc8ff",
  "terraflow-matrix":"#6fdf5f",
  orbitgather:"#4da7ff"
};

function copyFor(app:StudioApp){
  return storefrontCopy[app.id]??{tagline:app.description,category:app.category,short:app.description};
}
function findApps(ids:string[]){return ids.map(id=>studioApps.find(app=>app.id===id)).filter(Boolean) as StudioApp[]}
function accentStyle(app:StudioApp){return {"--accent":cardAccent[app.id]??"#00e8d4"} as CSSProperties}

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
  const showcase=findApps(showcaseIds);
  const recent=findApps(recentIds).slice(0,4);

  const apps=useMemo(()=>studioApps.filter(app=>{
    const copy=copyFor(app);
    const haystack=`${app.name} ${app.shortName} ${copy.tagline} ${copy.category}`.toLowerCase();
    const matchesCategory=category==="All Apps"||copy.category===category||app.category===category;
    return (!q||haystack.includes(q.toLowerCase()))&&matchesCategory;
  }),[q,category]);

  const visibleApps=showAll||q||category!=="All Apps"?apps:apps.slice(0,8);

  function remember(app:StudioApp){
    const next=[app.id,...recentIds.filter(id=>id!==app.id)].slice(0,5);
    setRecentIds(next);try{localStorage.setItem(RECENT_KEY,JSON.stringify(next))}catch{}
  }
  function open(app:StudioApp){remember(app);if(app.url)window.open(app.url,"_blank","noopener,noreferrer")}
  function chooseCategory(name:string){setCategory(name);requestAnimationFrame(()=>document.getElementById("all-apps")?.scrollIntoView({behavior:"smooth",block:"start"}))}

  return <main className={styles.page}>
    <div className={styles.ambientOne}/><div className={styles.ambientTwo}/>

    <div className={styles.shell}>
      <header className={styles.topChrome}>
        <a className={styles.brand} href="/" aria-label="CactusByte home">
          {cactusByteBrand.src&&<img src={cactusByteBrand.src} alt="" />}
          <span><b>Cactus<span>Byte</span> Studios</b><small>Your apps. One launchpad.</small></span>
        </a>

        <label className={styles.search}>
          <span>⌕</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search apps, tools, creators..." />
        </label>

        <div className={styles.headerActions}>
          <a href="/studio#releases" aria-label="Updates">♢</a>
          <a href="/studio" aria-label="Studio">{cactusByteBrand.src&&<img src={cactusByteBrand.src} alt="" />}</a>
          <button className={styles.mobileSearchButton} aria-label="Search apps" onClick={()=>setMobileSearch(v=>!v)}>⌕</button>
        </div>
      </header>

      {mobileSearch&&<label className={styles.mobileSearch}><span>⌕</span><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search apps..." /></label>}

      <section className={styles.heroStage} id="home">
        <div className={styles.heroMain} style={accentStyle(heroApp)}>
          <video className={styles.heroVideo} src={demoPaths[heroApp.id]} poster="/acelynn-beta-icon.png" autoPlay muted loop playsInline preload="auto"/>
          <div className={styles.heroVeil}/>
          <div className={styles.heroContent}>
            <span className={styles.featureBadge}>FEATURED APP</span>
            <div className={styles.heroIdentity}>
              <BrandMark app={heroApp} large/>
              <div><h1>{heroApp.shortName}</h1><p>{copyFor(heroApp).short}</p></div>
            </div>
            <p className={styles.heroDescription}>{copyFor(heroApp).tagline}</p>
            <div className={styles.heroButtons}>
              <button onClick={()=>open(heroApp)}>Open App <span>→</span></button>
              <button className={styles.outlineButton} onClick={()=>setDemo(heroApp)}>▶ Watch Demo</button>
            </div>
            <div className={styles.heroFeatures}>
              <span>◈ Real-Time Analysis</span><span>⬡ Pro Tools</span><span>◎ Stunning Clarity</span>
            </div>
          </div>
          <div className={styles.heroMessage}>CLEARER<br/>SOUNDS.<br/><b>BETTER MIXES.</b></div>
        </div>

        <aside className={styles.horizonPanel}>
          <div className={styles.horizonGlow}/>
          {cactusByteBrand.src&&<img src={cactusByteBrand.src} alt="" />}
          <span>SAME APPS</span><strong>BIGGER<br/>HORIZONS</strong><i/>
          <small>Built for real work.<br/>Designed to stand out.</small>
        </aside>
      </section>

      <nav className={styles.categoryBar} id="categories" aria-label="App categories">
        {categories.map(item=><button key={item.name} className={category===item.name?styles.categoryOn:""} onClick={()=>chooseCategory(item.name)}>{item.label}</button>)}
        <a href="#all-apps">More ↓</a>
      </nav>

      <StoreSection id="apps" title="Featured Apps" subtitle="Powerful tools for real-world builders, creators, and doers." action="#all-apps">
        <div className={styles.featuredGrid}>{featured.map(app=><PosterCard key={app.id} app={app} open={open} details={setSelected}/>)}</div>
      </StoreSection>

      {recent.length>0&&<StoreSection title="Continue Using" subtitle="Pick up exactly where you left off.">
        <div className={styles.recentStrip}>{recent.map(app=><RecentCard key={app.id} app={app} open={open}/>)}</div>
      </StoreSection>}

      <StoreSection title="More from CactusByte Studios" subtitle="Different worlds. Same mission — premium tools for a bolder tomorrow." action="#all-apps">
        <div className={styles.showcaseGrid}>{showcase.map(app=><PosterCard key={app.id} app={app} open={open} details={setSelected} compact/>)}</div>
      </StoreSection>

      <StoreSection id="all-apps" title={category==="All Apps"?"All Apps":category} subtitle="The complete CactusByte portfolio.">
        <div className={styles.portfolioHead}><span>{apps.length} available</span>{category!=="All Apps"&&<button onClick={()=>setCategory("All Apps")}>Clear filter</button>}</div>
        <div className={styles.allGrid}>{visibleApps.map(app=><PosterCard key={app.id} app={app} open={open} details={setSelected} compact/>)}</div>
        {!q&&category==="All Apps"&&apps.length>8&&<button className={styles.showAllButton} onClick={()=>setShowAll(v=>!v)}>{showAll?"Show Less":"View All Apps"} <span>{showAll?"↑":"↓"}</span></button>}
      </StoreSection>

      <footer className={styles.footer}>
        <div>{cactusByteBrand.src&&<img src={cactusByteBrand.src} alt="" />}<span>CactusByte Studios</span></div>
        <small>APPS FOR A BRIGHTER TOMORROW · v{STOREFRONT_VERSION}</small>
      </footer>
    </div>

    <nav className={styles.bottomDock} aria-label="CactusByte navigation">
      <a className={styles.navOn} href="#home"><span>⌂</span>Home</a>
      <a href="#all-apps"><span>▦</span>My Apps</a>
      <a href="/studio#releases"><span>◌</span>Updates</a>
      <a className={styles.dockBrand} href="#home" aria-label="CactusByte home">{cactusByteBrand.src&&<img src={cactusByteBrand.src} alt="" />}</a>
      <a href="#apps"><span>✣</span>Explore</a>
      <a href="#categories"><span>▱</span>Categories</a>
      <a href="/studio"><span>⚙</span>Settings</a>
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

function StoreSection({id,title,subtitle,action,children}:{id?:string;title:string;subtitle:string;action?:string;children:React.ReactNode}){
  return <section className={styles.section} id={id}><div className={styles.sectionHead}><div><h2>{title}</h2><p>{subtitle}</p></div>{action&&<a href={action}>View All →</a>}</div>{children}</section>
}

function PosterCard({app,open,details,compact=false}:{app:StudioApp;open:(app:StudioApp)=>void;details:(app:StudioApp)=>void;compact?:boolean}){
  const copy=copyFor(app),video=demoPaths[app.id];
  return <article className={`${styles.posterCard} ${compact?styles.posterCompact:""}`} data-app={app.id} style={accentStyle(app)}>
    <div className={styles.posterMedia}>
      {video&&<video src={video} muted loop autoPlay playsInline preload="metadata"/>}
      <div className={styles.posterPattern}/>
      <div className={styles.posterGhost}><BrandMark app={app}/></div>
      <div className={styles.posterShade}/>
    </div>
    <div className={styles.posterInfo}><BrandMark app={app}/><div><h3>{app.shortName}</h3><p>{copy.short}</p></div></div>
    <div className={styles.posterActions}><button onClick={()=>open(app)}>Open</button><button aria-label={`Details for ${app.name}`} onClick={()=>details(app)}>›</button></div>
  </article>
}

function RecentCard({app,open}:{app:StudioApp;open:(app:StudioApp)=>void}){
  const copy=copyFor(app);
  return <button className={styles.recentCard} style={accentStyle(app)} onClick={()=>open(app)}><BrandMark app={app}/><span><b>{app.shortName}</b><small>{copy.short}</small></span><i>→</i></button>
}

function BrandMark({app,large=false}:{app:StudioApp;large?:boolean}){
  const brand=verifiedBrandAsset(app.id);
  if(!brand)return <div className={large?styles.wordmarkLarge:styles.wordmark} aria-label={`${app.shortName} official logo pending recovery`}><span>{large?app.shortName:"LOGO"}</span><small>{large?"Official logo pending recovery":"Pending"}</small></div>;
  return <div className={large?styles.logoLarge:styles.logo}><img src={brand.src!} alt={`${app.shortName} official logo`}/></div>;
}
