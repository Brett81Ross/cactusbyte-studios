import fs from "node:fs";

const page=fs.readFileSync("src/app/storefront/page.tsx","utf8");
const css=fs.readFileSync("src/app/storefront/storefront.module.css","utf8");
const vercel=JSON.parse(fs.readFileSync("vercel.json","utf8"));
const checks=[
 ["Premium storefront remains the root experience",fs.readFileSync("src/app/page.tsx","utf8").includes('export {default} from "./storefront/page"')],
 ["Studio command center remains separate",page.includes('href="/studio"')],
 ["Approved hero hierarchy remains present",page.includes("FEATURED APP")&&page.includes("heroIdentity")&&page.includes("heroButtons")],
 ["Real app shelves remain present",page.includes("Our Apps")&&page.includes("Continue Using")&&page.includes("Categories")&&page.includes("New from Cactus🌵Byte")],
 ["SLB7 desktop hierarchy is explicit",css.includes("SLB7 — storefront mockup fidelity")&&css.includes(".heroCard{min-height:430px")],
 ["Featured desktop cards use denser mockup composition",css.includes(".appShelf .storeCard{min-height:224px;display:grid")],
 ["Phone storefront keeps horizontal featured shelf",css.includes("@media(max-width:759px)")&&css.includes(".appShelf{margin-inline:-2px")],
 ["Fold landscape receives explicit composition",css.includes("@media(min-width:700px) and (max-width:980px) and (orientation:landscape)")],
 ["SLB8 storefront polish is locked",page.includes('STOREFRONT_VERSION="1.8.0"')&&page.includes("View All Apps")&&page.includes("Explore Apps ↓")&&css.includes("SLB8 — premium storefront density")],
 ["Initial portfolio density is intentionally capped",page.includes("apps.slice(0,8)")],
 ["Production deployment remains disabled",vercel?.git?.deploymentEnabled===false]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?"✓":"✗"} ${name}`);if(!ok)failed++}
console.log(`\n${checks.length-failed} passed · ${failed} failed`);if(failed)process.exit(1);

// SLB8 final QA trigger — registry-aware responsive assertion.
