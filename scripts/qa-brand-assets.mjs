import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const apps=read("src/data/apps.ts");
const brands=read("src/data/brand-assets.ts");
const storefront=read("src/app/storefront/page.tsx");
const doc=read("docs/OFFICIAL_BRAND_ASSETS.md");
const fail=[];
const pass=[];
const check=(ok,msg)=>(ok?pass:fail).push(msg);

const ids=[...apps.matchAll(/\{id:"([^"]+)"/g)].map(m=>m[1]);
for(const id of ids)check(brands.includes(`appId: "${id}"`),`${id}: brand map entry exists`);
check(brands.includes('appId: "cactusbyte-studios"')&&brands.includes('src: "/logo2.png"'),"CactusByte uses the current canonical logo2.png asset");
check(brands.includes('appId: "fantasy-matrix"')&&brands.includes('src: "/ffm-user-logo.svg"'),"Fantasy Football Matrix uses the real source-controlled FFM user logo");
check(!brands.includes('src: "/ffm-mark.svg"'),"FFM storefront branding no longer uses the distorted SVG mark");
check(brands.includes('appId: "pocketstomp"')&&brands.includes('status: "unresolved"'),"PocketStomp is explicitly unresolved");
check(!brands.includes('pocketstomp-v2-brett81ross.vercel.app/pocketstomp-icon.png'),"Rejected PocketStomp production icon cannot enter the verified brand map");
check(doc.includes("No AI-generated substitute logos."),"Brand inventory documents the no-fake-logo rule");
check(storefront.includes("verifiedBrandAsset"),"Storefront renders app branding through the verified brand map");
check(storefront.includes("Official logo pending recovery"),"Storefront has an honest unresolved-logo treatment");
check(!storefront.includes("diagnostic tool"),"Storefront UI does not present itself as a diagnostic tool");
check(storefront.includes("Your apps")||storefront.includes("ONE LAUNCHPAD"),"Storefront uses launchpad/product language");

console.log("\nCactusByte brand asset QA");
for(const x of pass)console.log("✓",x);
for(const x of fail)console.error("✗",x);
console.log(`\n${pass.length} passed · ${fail.length} failed`);
if(fail.length)process.exit(1);
