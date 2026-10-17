import fs from "node:fs";

const page=fs.readFileSync("src/app/storefront/page.tsx","utf8");
const css=fs.readFileSync("src/app/storefront/storefront.module.css","utf8");
const vercel=JSON.parse(fs.readFileSync("vercel.json","utf8"));
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const studio=fs.readFileSync("src/app/studio/page.tsx","utf8");

const checks=[
 ["Premium storefront remains the root experience",fs.readFileSync("src/app/page.tsx","utf8").includes('export {default} from "./storefront/page"')],
 ["Studio command center remains separate",page.includes('href="/studio"')],
 ["Approved cinematic hero is present",page.includes("FEATURED APP")&&page.includes("heroIdentity")&&page.includes("heroActions")&&page.includes("heroFeatures")],
 ["Approved storefront shelves are present",page.includes("Featured Apps")&&page.includes("More from CactusByte Studios")&&page.includes("All Apps")],
 ["Actual verified brand assets remain wired",page.includes("verifiedBrandAsset(app.id)")&&page.includes("official logo")],
 ["PocketStomp unresolved-brand safeguard remains intact",page.includes('large?app.shortName:"LOGO"')&&page.includes("Official logo pending recovery")],
 ["Cinematic neon shell is explicit",css.includes("--neon:#21f2b6")&&css.includes(".hero{")&&css.includes(".posterCard")&&css.includes(".brandRail")],
 ["Hero shows local neon-audio illustration rather than unrelated portraits",page.includes("heroWaveform")&&page.includes("heroVinyl")&&css.includes('url("/posters/acelynn-pro.svg")')&&css.includes(".heroOverlay")&&!css.includes("images.unsplash.com")&&!page.includes("poster=\"/acelynn-beta-icon.png\"")],
 ["Category filters stay operational through original buttons and category tiles",page.includes("chooseCategory(item.name)")&&page.includes("data-category={t.id}")&&css.includes(".categoryTiles")],
 ["Desktop/Fold storefront keeps persistent brand rail",css.includes("@media(max-width:980px)")&&css.includes(".brandRail{left:12px")],
 ["Phone storefront switches to compact full-width shell",css.includes("@media(max-width:759px)")&&css.includes(".brandRail{display:none}")&&css.includes(".featuredGrid,.moreGrid,.recentGrid{display:flex;overflow-x:auto")],
 ["Bottom nav is persistent and mockup-aligned",page.includes('aria-label="CactusByte navigation"')&&css.includes(".bottomNav")],
 ["Updates and Settings destinations activate the intended Studio screens",page.includes('href="/studio#releases"')&&page.includes('href="/studio#settings"')&&studio.includes('hash==="releases"')&&studio.includes('hash==="settings"')],
 ["Unmatched search results receive a readable empty state",page.includes('role="status">No apps match your search or category.')&&css.includes(".emptyState")],
 ["Initial portfolio density remains capped",page.includes("apps.slice(0,8)")],
 ["Storefront display version matches the verified package release",page.includes(`STOREFRONT_VERSION="${pkg.version}"`)], 
 ["Studio UI version remains package-aligned",studio.includes(`const V="${pkg.version}"`)], 
 ["Storefront footer includes a tappable CactusByte home link and rights notice",page.includes('className={styles.footerBrand} href="/"')&&page.includes("Cactus🌵Byte Studios™")&&page.includes("All Rights Reserved")],
 ["Studio footer links back to CactusByte without duplicate brand names",studio.includes('<footer><a className="footerBrand" href="/">Cactus🌵Byte Studios™</a> · v{V} · All Rights Reserved</footer>')],
 ["North Star art-backed poster cards use real registry IDs and bundled imagery",css.includes('[data-app="noproblem"]')&&css.includes('[data-app="pocketstomp"]')&&css.includes("background-image:var(--localCardImage)")&&page.includes('src={`/posters/${app.id}.svg`}')],
 ["North Star featured row includes real SchismMatrix and no fictional apps",page.includes('"noproblem","fantasy-matrix"')&&!page.includes("firstep-kitchen")],
 ["Functional category tile shelf and recommendation shelf exist",page.includes("Explore Categories")&&page.includes("Recommended Apps")&&page.includes('data-category={t.id}')],
 ["Mobile bottom navigation exposes five usable links",css.includes(".bottomNav a:nth-child(3),.bottomNav a:nth-child(5){display:flex}")&&page.includes("Profile</a>")],
 ["Photo-free and app-logo-authentic SLB11 layout is explicit",!css.includes("images.unsplash.com")&&page.includes("Cactus🌵Byte")&&page.includes("heroTools")&&page.includes("heroAbout")&&page.includes("verifiedBrandAsset(app.id)")],
 ["All 14 app scenes are bundled as separate local vector assets",["acelynn-pro","noproblem","fantasy-matrix","first-bearing","rivetex","pocketstomp","shadownex-prime","scouttrace","rapid-takeoff","terraflow-matrix","machzero","orbitgather","ghostlane","hustle-first"].every(id=>fs.existsSync(`public/posters/${id}.svg`)&&fs.readFileSync(`public/posters/${id}.svg`,"utf8").includes('viewBox="0 0 600 780"')&&css.includes(`url("/posters/${id}.svg")`))],
 ["Photo-free mockup hero remains deterministic",!page.includes('<video className={styles.heroMedia}')&&!css.includes('images.unsplash.com')&&page.includes('styles.heroWaveform')],
 ["All original filters remain discoverable",page.includes('showCategoryFilters')&&page.includes('id="category-filter-options"')&&page.includes('More categories')&&css.includes('.categoryStrip:not([hidden]){display:flex')],
 ["Fold CactusByte wordmark does not disappear",css.includes('.brandLockup span{display:grid}')&&page.includes('<b>Cactus🌵Byte</b>')],
 ["Touch actions meet 44px tap target contract",css.includes('.posterDetails{width:44px;height:44px')&&css.includes('.close{width:44px;height:44px')&&css.includes('.heroActions button{min-height:44px}')],
 ["Phone catalog uses compact swipe cards",css.includes('.allGrid{display:flex;gap:8px;overflow-x:auto')&&css.includes('.allGrid .posterCardCompact{flex:0 0 calc((100% - 16px)/3)')],
 ["Saved app-history data is validated before rendering",page.includes("const saved:unknown=")&&page.includes("Array.isArray(saved)")&&page.includes("setRecentIds([...new Set(valid)]")],
 ["Closing mobile search cannot leave a hidden active filter",page.includes('if(mobileSearch)setQ("")')&&page.includes('aria-expanded={mobileSearch}')],
 ["Categories expose keyboard and screen-reader pressed state",page.includes("aria-pressed={category===t.id}")&&page.includes("aria-pressed={category===item.name}")&&css.includes('.categoryTile[aria-pressed="true"]')],
 ["Sticky header does not hide jumped-to catalog sections",css.includes('.section[id],.hero[id]{scroll-margin-top:88px}')&&css.includes('scroll-margin-top:80px')],
 ["Three-column phone cards reserve width for longer names and CTAs",css.includes('.posterBody{left:9px;right:9px;bottom:8px}')&&css.includes('overflow-wrap:anywhere')],
 ["Production deployment remains disabled",vercel?.git?.deploymentEnabled===false]
];

let failed=0;
for(const [name,ok] of checks){
 console.log(`${ok?"✓":"✗"} ${name}`);
 if(!ok)failed++;
}
console.log(`\n${checks.length-failed} passed · ${failed} failed`);
if(failed)process.exit(1);

// SLB10 approved-mockup fidelity contract.
