// SLB16: deterministic, network-free CactusByte storefront source contract.
// Cinematic binary art is separately certified with npm run qa:cinematic.
import {existsSync,statSync,readFileSync} from "node:fs";
import {join} from "node:path";
const read=p=>readFileSync(p,"utf8");
const page=read("src/app/storefront/page.tsx");
const registry=read("src/data/apps.ts");
const brand=read("src/data/brand-assets.ts");
const pkg=JSON.parse(read("package.json"));
const ids=[...registry.matchAll(/^\{id:"([^"]+)"/gm)].map(m=>m[1]);
const extract=(label,pattern)=>{
  const found=page.match(pattern);if(!found)throw Error("Missing source declaration: "+label);
  return [...found[1].matchAll(/"([^"]+)"/g)].map(m=>m[1]);
};
const featured=extract("Featured",/const featuredIds=\[([^\]]+)\]/);
const more=extract("More",/const moreIds=\[([^\]]+)\]/);
const cinematic=extract("Cinematic",/const approvedPosterIds=new Set\(\[([\s\S]*?)\]\)/);
const demos=extract("Demo paths",/const demoPaths:Record<string,string>=\{([\s\S]*?)\};/).filter(x=>x.startsWith("/demos/"));
const marks=[...brand.matchAll(/\bsrc:\s*"(\/[^"]+)"/g)].map(m=>m[1]);
const urls=[...registry.matchAll(/\burl:"([^"]+)"/g)].map(m=>m[1]);
const file=p=>existsSync(p)&&statSync(p).isFile()&&statSync(p).size>0;
const unique=x=>new Set(x).size===x.length;
const checks=[
  ["Registry keeps 14 unique app IDs",ids.length===14&&unique(ids)],
  ["Featured contains five real unique apps",featured.length===5&&unique(featured)&&featured.every(x=>ids.includes(x))],
  ["More contains six real unique apps",more.length===6&&unique(more)&&more.every(x=>ids.includes(x))],
  ["Featured and More remain distinct",featured.every(x=>!more.includes(x))],
  ["All 14 SVG fallback posters exist",ids.every(id=>file(join("public","posters",id+".svg")))],
  ["Only 13 approved cinematic app IDs are mapped",cinematic.length===13&&unique(cinematic)&&cinematic.every(x=>ids.includes(x))&&!cinematic.includes("orbitgather")],
  ["OrbitGather unapproved poster remains excluded",!existsSync("public/cinematic/orbitgather.webp")],
  ["Every referenced demo MP4 exists",demos.length===10&&unique(demos)&&demos.every(u=>file("public"+u))],
  ["Every local verified brand mark exists",unique(marks)&&marks.every(u=>file("public"+u))],
  ["All 14 app launch URLs are HTTPS",urls.length===ids.length&&urls.every(u=>{try{return new URL(u).protocol==="https:"}catch{return false}})],
  ["Root renders original storefront",read("src/app/page.tsx").includes('from "./storefront/page"')],
  ["Studio destinations exist",file("src/app/studio/page.tsx")&&page.includes('href="/studio#settings"')&&page.includes('href="/studio#releases"')],
  ["Catalog and detail metadata use real registry",page.includes("studioApps.filter(")&&page.includes("selected.version")],
  ["No Unsplash stock-photo references",!page.includes("unsplash.com")],
  ["Storefront version matches package",page.includes('STOREFRONT_VERSION="'+pkg.version+'"')],
  ["Cinematic SHA gate still available",pkg.scripts["qa:cinematic"]==="node scripts/qa-cinematic-assets.mjs"],
  ["Vercel Git auto-deployment disabled",JSON.parse(read("vercel.json")).git?.deploymentEnabled===false]
];
let failed=0;
for(const [name,ok] of checks){console.log((ok?"PASS ":"FAIL ")+name);if(!ok)failed++}
const pending=cinematic.filter(id=>!file(join("public","cinematic",id+".webp")));
if(pending.length)console.log("PENDING artwork release gate: "+pending.length+" of the approved WebP files are not installed.");
console.log("SLB16 storefront source QA: "+(checks.length-failed)+"/"+checks.length);
if(failed)process.exit(1);
