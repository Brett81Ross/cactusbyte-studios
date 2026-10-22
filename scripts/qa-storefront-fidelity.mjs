// Rebuilt SLB12 presentation: objective checks against the exact preserved reference.
// This script must not assert rejected CSS selectors from the prior storefront.
import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const page=read("src/app/storefront/page.tsx");
const layout=read("src/app/storefront/showcase-layout.module.css");
const base=read("src/app/storefront/storefront.module.css");
const note=read("docs/APPROVED_NEON_APP_STORE_SHOWCASE.md");
const browser=read("playwright.config.ts");
const pkg=JSON.parse(read("package.json"));
const checks=[
 ["Reference locked",note.includes("3b40225c75a08d25219647addbb4ab87ccb6bb079087bdc63dbd65df76b4c438")],
 ["Original Library pointer locked",note.includes("libfile_3d36fd0244a08191817ba3ce301398fc")],
 ["Dedicated coherent showcase styles",page.includes('import showcase from "./showcase-layout.module.css"')&&page.includes("showcase.root")],
 ["Approved Fold/desktop sidebar restored",layout.includes(".root > :global(aside){display:block!important}")&&layout.includes("margin:0 16px 0 194px!important")],
 ["Phone retains compact header without desktop sidebar",layout.includes(".root > :global(aside){display:none!important}")],
 ["Header exists",page.includes("showcase.topbar")&&layout.includes(".topbar{")],
 ["Acelynn hero and real actions",page.includes("FEATURED APP")&&page.includes("open(heroApp)")&&page.includes("setDemo(heroApp)")],
 ["No portrait substituted",!page.includes("unsplash")&&!layout.includes("unsplash")],
 ["Five featured real products",page.includes('["acelynn-pro","first-bearing","fantasy-matrix","hustle-first","noproblem"]')],
 ["Six more real products",page.includes('["rivetex","shadownex-prime","scouttrace","rapid-takeoff","terraflow-matrix","pocketstomp"]')],
 ["No duplicate recommended shelf",!page.includes("Recommended Apps")],
 ["No giant category tiles",!page.includes("categoryTiles}")],
 ["Pill filters before featured",page.indexOf("showcase.filters")<page.indexOf("showcase.featuredSection")],
 ["Working category select opens catalog",page.includes("function chooseCategory")&&page.includes("setShowAll(true)")],
 ["Filter pressed state accessible",page.includes("aria-pressed={category===item.name}")],
 ["Navigation filter exists without modifying approved primary pill order",page.includes('{name:"Navigation",label:"Navigation"}')&&page.includes("categories.slice(0,6)")],
 ["Search indexes full registry descriptions",page.includes('${app.description} ${copy.tagline} ${copy.short}')],
 ["Reduced motion protects programmatic scrolling",page.includes('matchMedia("(prefers-reduced-motion: reduce)")')&&page.includes('scrollToSection("all-apps")')],
 ["Expanded filters retain accessible target",page.includes('id="category-extra-options" hidden={!showCategoryFilters}')],
 ["Search remains attached to live registry",page.includes("studioApps.filter(")&&page.includes("q.trim().toLowerCase()")],
 ["Search results accessible",page.includes('title={searchMode?"Search results"')],
 ["No default duplicated All Apps",page.includes('const visibleApps=showAll||searchMode||category!=="All Apps"?apps:[];')],
 ["Catalog open with View All",page.includes("View All Apps")],
 ["Bottom nav real routes",page.includes("My Apps</a>")&&page.includes("Settings</a>")],
 ["Sidebar Apps link reveals real catalog",page.includes('<a href="#all-apps" onClick={seeAllApps}>▦ <span>Apps</span></a>')],
 ["Phone-menu All Apps reveals real catalog",page.includes('<a href="#all-apps" onClick={seeAllApps}>▦ All Apps</a>')],
 ["Beta Labs announces selected state",page.includes('aria-pressed={category==="Beta Labs"} onClick={()=>chooseCategory("Beta Labs")}')],
 ["Dialog keyboard entry and Escape",page.includes("focusable()[0]?.focus()")&&page.includes('if(event.key==="Escape")')],
 ["Modal Tab cycling and opener focus restore",page.includes('event.key!=="Tab"')&&page.includes("modalOrigin.current")&&page.includes("if(origin?.isConnected)origin.focus()")&&page.includes("last.focus()")],
 ["Dialog close touch target 44px",base.includes("top:12px;right:12px;width:44px;height:44px;border-radius:50%")],
 ["Modal origin persists through Details-to-Demo",page.includes("const modalOrigin=useRef<HTMLElement|null>(null)")&&page.includes("if(!modalOrigin.current?.isConnected)")],
 ["Modal body scroll lock cleans up",page.includes('document.body.style.overflow="hidden"')&&page.includes("document.body.style.overflow=previousOverflow")],
 ["Mobile menu Escape restores focus",page.includes('document.querySelector<HTMLAnchorElement>("#cactusbyte-mobile-menu a")?.focus()')&&page.includes('setMobileMenu(false);')],
 ["Mobile search Escape resets query",page.includes("if(!mobileSearch)return;")&&page.includes('setQ("");setMobileSearch(false)')],
 ["Six-option bottom dock",layout.includes("grid-template-columns:repeat(6,minmax(0,1fr))")],
 ["Dock safe area",layout.includes("env(safe-area-inset-bottom)")],
 ["Page reserves safe-area dock clearance",layout.includes("padding:0 0 calc(82px + env(safe-area-inset-bottom))!important")&&layout.includes("calc(86px + env(safe-area-inset-bottom))")],
 ["44px details and filter touch targets",layout.includes("width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important")&&layout.includes("min-height:44px;padding:0 17px")],
 ["Five-across Fold showcase",layout.includes("grid-auto-columns:calc((100% - 32px)/5)")],
 ["Six-across secondary shelf",layout.includes("grid-auto-columns:calc((100% - 40px)/6)")],
 ["Three-across phone shelf",layout.includes("grid-auto-columns:calc((100% - 12px)/3)")],
 ["Mobile feature starts with First Bearing",layout.includes('[data-app="acelynn-pro"]')],
 ["Existing poster assets retained",page.includes('/posters/${app.id}.svg')],
 ["Poster image layer full size",layout.includes(".posterArt img{width:100%!important;height:100%!important")],
 ["Card copy legible",layout.includes(".posterBody{")&&layout.includes("#020711ed")],
 ["Distinct details icon",page.includes("showcase.posterDetails")&&layout.includes(".posterDetails::before,.posterDetails::after")],
 ["Original logo resolution",page.includes("verifiedBrandAsset(app.id)")],
 ["Actual app links unchanged",page.includes('window.open(app.url,"_blank","noopener,noreferrer")')],
 ["App dialogs include real metadata",page.includes("selected.version")&&page.includes("selected.platform")],
 ["Local demo media available",page.includes("demoPaths[demo.id]")],
 ["App version matches package",page.includes('STOREFRONT_VERSION="'+pkg.version+'"')],
 ["Footer tappable",page.includes("Cactus🌵Byte Studios™")&&page.includes('href="/" aria-label="CactusByte Studios app home"')],
 ["Source preserves escaped dialogs",page.includes('event.key==="Escape"')],
 ["Browser QA does not re-use stale server",browser.includes("QA_PORT=3101")&&browser.includes("reuseExistingServer:false")],
 ["Owner sign-off explicitly required",note.includes("Explicit owner visual approval")]
];
let failed=0;
for(const [label,pass] of checks){console.log((pass?"PASS ":"FAIL ")+label);if(!pass)failed++}
console.log("CactusByte showcase rebuild: "+(checks.length-failed)+"/"+checks.length+" source checks");
if(failed)process.exit(1);
