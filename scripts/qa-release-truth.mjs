import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const data=read("src/data/release-truth.ts");
const engine=read("src/lib/release-truth.ts");
const route=read("src/app/api/registry/route.ts");
const apps=read("src/data/apps.ts");
const env=read(".env.example");
const failures=[];
const check=(ok,msg)=>{if(!ok)failures.push(msg);else console.log(`✓ ${msg}`)};

const records=[...data.matchAll(/appId:"([^"]+)"/g)].map(m=>m[1]);
check(records.length===13,"Release Truth tracks 12 apps plus the CactusByte hub");
check(new Set(records).size===records.length,"Release Truth app IDs are unique");
for(const id of ["cactusbyte-studios","noproblem","machzero","rapid-takeoff","acelynn-pro","pocketstomp","ghostlane","first-bearing","fantasy-matrix","scouttrace","shadownex-prime","terraflow-matrix","orbitgather"]){check(records.includes(id),`${id}: Release Truth record exists`)}

check(data.includes('appId:"cactusbyte-studios",recordedWebVersion:"v1.6.1"'),"CactusByte recorded web version remains v1.6.1");
check(data.includes('recordedDeploymentId:"dpl_Ehm4aLFQCc2BGD5v8PpQBbgEpA6x"'),"CactusByte approved production deployment is recorded");
check(data.includes('recordedGitSha:"69c0149f190cfe0ac0aa30508c24bde47bd40aac"'),"CactusByte approved production Git SHA is recorded");
check(data.includes('appId:"acelynn-pro",recordedWebVersion:"v1.2.0"'),"Acelynn recorded live version is v1.2.0");
check(data.includes('appId:"fantasy-matrix",recordedWebVersion:"v1.6.11"'),"Fantasy recorded live version is v1.6.11");
check(data.includes('recordedDeploymentId:"dpl_DKevZDEEBvQMgf9GRc2K5i8B5HKd"'),"Fantasy latest verified production deployment is recorded");
check(data.includes('recordedGitSha:"bcf15e26ea28948a3a165b18c683513cba1e34f6"'),"Fantasy latest verified production Git SHA is recorded");
check(data.includes('appId:"terraflow-matrix",recordedWebVersion:"v1.7.0",stagedWebVersion:"v1.15.0"'),"TerraFlow keeps v1.7.0 live and v1.15.0 staged");
check(data.includes('recordedDeploymentId:"dpl_784aR3rSMoze7BMFuweYc5fDE6AR"'),"TerraFlow verified production deployment is recorded");
check(data.includes('appId:"terraflow-matrix"')&&data.includes('detectedSource:"https://terraflow-matrix.vercel.app/"'),"TerraFlow detection uses its public production page");
check(data.includes('appId:"orbitgather"')&&data.includes('detectedSource:"https://orbitgather-wahh.vercel.app/"'),"OrbitGather detection uses its public production page");

const fantasyLine=apps.split("\n").find(line=>line.includes('id:"fantasy-matrix"'))||"";
check(fantasyLine.includes('version:"v1.6.11"'),"Public Fantasy fallback is updated to v1.6.11");
check(fantasyLine.includes('?v=1.6.11'),"Public Fantasy launch URL carries the current version marker");
const terraLine=apps.split("\n").find(line=>line.includes('id:"terraflow-matrix"'))||"";
check(terraLine.includes('version:"v1.7.0"'),"Public TerraFlow fallback remains verified live v1.7.0");
check(!terraLine.includes("syncSource:"),"Public app registry cannot promote TerraFlow repository v1.15.0 to live");
const orbitLine=apps.split("\n").find(line=>line.includes('id:"orbitgather"'))||"";
check(orbitLine.includes('syncSource:"https://orbitgather-wahh.vercel.app/"'),"OrbitGather public sync source avoids private GitHub raw access");
const pocketLine=apps.split("\n").find(line=>line.includes('id:"pocketstomp"'))||"";
check(pocketLine.includes('version:"v1.0.0"'),"PocketStomp remains unchanged pending its own version-marker fix");

check(engine.includes("liveVersion:record.recordedWebVersion"),"Reconciler always preserves recorded live version");
check(!engine.includes("liveVersion:detected.version"),"Detected versions cannot auto-promote themselves to live");
check(engine.includes('truthState="staged"'),"Detected staged versions are surfaced as staged");
check(engine.includes('truthState="deployment-mismatch"'),"Unexpected production deployments are surfaced as mismatches");
check(engine.includes("record.recordedDeploymentId"),"Deployment evidence is compared to the recorded production deployment");
check(engine.includes("VERCEL_ACCESS_TOKEN")&&engine.includes("VERCEL_TEAM_ID"),"Vercel deployment verification uses server-only environment credentials");
check(!engine.includes("NEXT_PUBLIC_VERCEL"),"Vercel verification credentials are never public client variables");
check(env.includes("VERCEL_ACCESS_TOKEN")&&env.includes("VERCEL_TEAM_ID"),"Environment template documents deployment verification configuration");

check(route.includes("releaseTruthByApp")&&route.includes("resolveReleaseTruth"),"Registry API is powered by Release Truth");
check(route.includes("truthModel:\"recorded-detected-deployed-v1\""),"Registry API identifies the v1.6 truth model");
check(route.includes("version:truth.liveVersion"),"Public registry returns reconciled liveVersion, not raw detected version");
check(route.includes("detectedVersion:truth.detectedVersion"),"Public registry can expose detected drift without promoting it");

if(failures.length){for(const failure of failures)console.error(`✗ ${failure}`);console.error(`\n${failures.length} Release Truth QA failure(s)`);process.exit(1)}
console.log("\nCactusByte v1.6 Release Truth QA passed");
