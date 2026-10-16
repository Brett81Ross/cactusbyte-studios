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
 ["Hero uses layered atmospheric media with approved artwork and text protection",css.includes(".heroMedia")&&css.includes("filter:blur(6px)")&&css.includes("filter:blur(7px)")&&css.includes('url("/acelynn-beta-icon.png")')&&css.includes("background-size:cover,auto 65%")&&css.includes("background-size:cover,auto 38%")&&css.includes(".heroOverlay")&&css.includes("box-shadow:0 30px 90px")],
 ["Category strip uses non-shrinking scrollable pills",css.includes(".categoryStrip")&&css.includes(".categoryOn")&&css.includes(".categoryStrip button{flex:0 0 auto")],
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
