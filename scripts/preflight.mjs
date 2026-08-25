import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const exists=p=>fs.existsSync(path.join(root,p));
const pass=[];
const warn=[];
const fail=[];
const check=(ok,message)=>{(ok?pass:fail).push(message)};

const pkg=JSON.parse(read("package.json"));
const page=read("src/app/page.tsx");
const apps=read("src/data/apps.ts");
const apiManifest=read("src/app/api/manifest/route.ts");
const core=read("src/app/api/core/route.ts");
const firebase=read("src/lib/firebase.ts");
const gitignore=read(".gitignore");

const pageVersion=page.match(/const V="([^"]+)"/)?.[1];
const manifestVersion=apiManifest.match(/version:"([^"]+)"/)?.[1];
const coreVersion=core.match(/studioVersion:\s*"([^"]+)"/)?.[1];

check(pageVersion===pkg.version,`UI version matches package.json (${pkg.version})`);
check(manifestVersion===pkg.version,`Manifest API version matches package.json (${pkg.version})`);
check(coreVersion===pkg.version,`Core API studioVersion matches package.json (${pkg.version})`);

check(firebase.includes("NEXT_PUBLIC_FIREBASE_API_KEY"),"Firebase browser key is loaded from NEXT_PUBLIC_FIREBASE_API_KEY");
check(!/AIza[0-9A-Za-z_-]{20,}/.test(firebase),"No Firebase API key is hard-coded in src/lib/firebase.ts");
check(gitignore.includes(".env*"),"Environment files are ignored by Git");
check(!/serviceWorker\.register\s*\(/.test(page),"CactusByte does not register a service worker");

const ids=[...apps.matchAll(/\{id:"([^"]+)"/g)].map(m=>m[1]);
check(ids.length>0,"App registry contains records");
check(new Set(ids).size===ids.length,"App registry IDs are unique");

const records=apps.split("\n").filter(line=>line.trim().startsWith("{id:"));
for(const line of records){
 const id=line.match(/id:"([^"]+)"/)?.[1]||"unknown";
 const status=line.match(/status:"([^"]+)"/)?.[1];
 const version=line.match(/version:"([^"]+)"/)?.[1];
 const logo=line.match(/logo:"([^"]+)"/)?.[1];
 const repo=line.match(/repo:"([^"]+)"/)?.[1];
 const url=line.match(/url:"([^"]+)"/)?.[1];
 const checkout=line.match(/checkoutUrl:"([^"]+)"/)?.[1];
 check(Boolean(version),`${id}: version is present`);
 check(Boolean(logo),`${id}: logo is present`);
 check(Boolean(repo&&repo.startsWith("https://github.com/")),`${id}: GitHub repository URL is present`);
 if(logo?.startsWith("/"))check(exists(`public${logo}`),`${id}: local logo asset exists`);
 if(status==="Live")check(Boolean(url&&url.startsWith("https://")),`${id}: live app has an HTTPS launch URL`);
 if(checkout)check(checkout.startsWith("https://buy.stripe.com/"),`${id}: Stripe checkout uses buy.stripe.com`);
 if(status==="Repository")warn.push(`${id}: production link still pending`);
}

const fantasy=records.find(line=>line.includes('id:"fantasy-matrix"'))||"";
const fantasyVersion=fantasy.match(/version:"v?([^"]+)"/)?.[1];
const fantasyUrl=fantasy.match(/url:"([^"]+)"/)?.[1]||"";
check(!fantasyVersion||fantasyUrl.includes(`v=${fantasyVersion}`),"Fantasy Matrix launch query matches its registered version");

const terraflow=records.find(line=>line.includes('id:"terraflow-matrix"'))||"";
check(terraflow.includes('logo:"/terraflow-mark.svg"'),"TerraFlow uses its approved Concept 2 brand mark");
check(exists("public/terraflow-mark.svg"),"Approved TerraFlow local brand asset exists");
check(!terraflow.includes('logo:"/logo2.png"'),"TerraFlow no longer falls back to the CactusByte logo");

console.log(`\nCactusByte atomic preflight v${pkg.version}`);
for(const x of pass)console.log(`✓ ${x}`);
for(const x of warn)console.log(`! ${x}`);
for(const x of fail)console.error(`✗ ${x}`);
console.log(`\n${pass.length} passed · ${warn.length} warnings · ${fail.length} failed`);
if(fail.length)process.exit(1);
