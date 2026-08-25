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
const releases=read("src/data/releases.ts");
const apiManifest=read("src/app/api/manifest/route.ts");
const core=read("src/app/api/core/route.ts");
const firebase=read("src/lib/firebase.ts");
const gitignore=read(".gitignore");
const layout=read("src/app/layout.tsx");
const workflow=read(".github/workflows/atomic-qa.yml");

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
check(exists("tsconfig.json"),"TypeScript configuration is tracked instead of generated during CI");
check(layout.includes("metadataBase"),"Metadata base is explicitly configured for share-image URL resolution");
check(layout.includes("VERCEL_PROJECT_PRODUCTION_URL"),"Metadata base can resolve from the Vercel production hostname");
check(workflow.includes("actions/checkout@v5"),"Atomic QA uses the Node 24-compatible checkout action");
check(workflow.includes("actions/setup-node@v5"),"Atomic QA uses the Node 24-compatible setup-node action");
check(/node-version:\s*24/.test(workflow),"Atomic QA runs on Node.js 24");

const ids=[...apps.matchAll(/\{id:"([^"]+)"/g)].map(m=>m[1]);
check(ids.length>0,"App registry contains records");
check(new Set(ids).size===ids.length,"App registry IDs are unique");

const records=apps.split("\n").filter(line=>line.trim().startsWith("{id:"));
const registryVersions=new Map();
for(const line of records){
 const id=line.match(/id:"([^"]+)"/)?.[1]||"unknown";
 const status=line.match(/status:"([^"]+)"/)?.[1];
 const version=line.match(/version:"([^"]+)"/)?.[1];
 const logo=line.match(/logo:"([^"]+)"/)?.[1];
 const repo=line.match(/repo:"([^"]+)"/)?.[1];
 const url=line.match(/url:"([^"]+)"/)?.[1];
 const syncSource=line.match(/syncSource:"([^"]+)"/)?.[1];
 const checkout=line.match(/checkoutUrl:"([^"]+)"/)?.[1];
 if(version)registryVersions.set(id,version);
 check(Boolean(version),`${id}: version is present`);
 check(Boolean(version&&version!=="Version not exposed"),`${id}: registry exposes a concrete version`);
 check(Boolean(logo),`${id}: logo is present`);
 check(Boolean(repo&&repo.startsWith("https://github.com/")),`${id}: GitHub repository URL is present`);
 if(logo?.startsWith("/"))check(exists(`public${logo}`),`${id}: local logo asset exists`);
 if(status==="Live")check(Boolean(url&&url.startsWith("https://")),`${id}: live app has an HTTPS launch URL`);
 if(status==="Repository"){
  warn.push(`${id}: production link still pending`);
  check(Boolean(syncSource&&syncSource.startsWith("https://")),`${id}: repository-only app has a live version sync source`);
 }
 if(checkout)check(checkout.startsWith("https://buy.stripe.com/"),`${id}: Stripe checkout uses buy.stripe.com`);
}

const releaseRecords=[...releases.matchAll(/\{appId:"([^"]+)",version:"([^"]+)"/g)].map(m=>({appId:m[1],version:m[2]}));
check(releaseRecords.length>0,"Release Center contains versioned records");
check(new Set(releaseRecords.map(r=>r.appId)).size===releaseRecords.length,"Release Center app IDs are unique");
check(releaseRecords.some(r=>r.appId==="cactusbyte-studios"),"Release Center includes CactusByte Studios");
check(ids.every(id=>releaseRecords.some(r=>r.appId===id)),"Every registry app has a Release Center record");
check(releaseRecords.length===ids.length+1,"Release Center has exactly one record per app plus CactusByte Studios");
for(const release of releaseRecords){
 if(release.appId==="cactusbyte-studios"){
  check(release.version.replace(/^v/,"")===pkg.version,"CactusByte Release Center version matches package.json");
  continue;
 }
 const registered=registryVersions.get(release.appId);
 check(Boolean(registered),`${release.appId}: Release Center app exists in registry`);
 if(registered)check(registered===release.version,`${release.appId}: Release Center version matches registry (${registered})`);
}

const fantasy=records.find(line=>line.includes('id:"fantasy-matrix"'))||"";
const fantasyVersion=fantasy.match(/version:"v?([^"]+)"/)?.[1];
const fantasyUrl=fantasy.match(/url:"([^"]+)"/)?.[1]||"";
check(!fantasyVersion||fantasyUrl.includes(`v=${fantasyVersion}`),"Fantasy Matrix launch query matches its registered version");

const pocketstomp=records.find(line=>line.includes('id:"pocketstomp"'))||"";
check(pocketstomp.includes('repo:"https://github.com/Brett81Ross/pocketstomp-"'),"PocketStomp registry points to the current public app repository");
check(pocketstomp.includes('syncSource:"https://raw.githubusercontent.com/Brett81Ross/pocketstomp-/main/package.json"'),"PocketStomp version sync uses its current package source");

const terraflow=records.find(line=>line.includes('id:"terraflow-matrix"'))||"";
check(terraflow.includes('version:"v1.13.1"'),"TerraFlow registry tracks the current v1.13.1 branding release");
check(terraflow.includes('syncSource:"https://raw.githubusercontent.com/Brett81Ross/terraflow-matrix/main/cloud-release.js"'),"TerraFlow version sync is connected to its release surface");
check(terraflow.includes('logo:"/terraflow-mark.svg"'),"TerraFlow uses its approved Concept 2 brand mark");
check(exists("public/terraflow-mark.svg"),"Approved TerraFlow local brand asset exists");
check(!terraflow.includes('logo:"/logo2.png"'),"TerraFlow no longer falls back to the CactusByte logo");

console.log(`\nCactusByte atomic preflight v${pkg.version}`);
for(const x of pass)console.log(`✓ ${x}`);
for(const x of warn)console.log(`! ${x}`);
for(const x of fail)console.error(`✗ ${x}`);
console.log(`\n${pass.length} passed · ${warn.length} warnings · ${fail.length} failed`);
if(fail.length)process.exit(1);
