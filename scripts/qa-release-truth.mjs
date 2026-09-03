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

check(data.includes('appId:"acelynn-pro",recordedWebVersion:"v1.2.0"'),"Acelynn recorded live version is v1.2.0");
check(data.includes('appId:"fantasy-matrix",recordedWebVersion:"v1.5.5"'),"Fantasy recorded live version is v1.5.5");
check(data.includes('recordedDeploymentId:"dpl_6NR9LmgNvA8xvsvmKj92oG4XnMqn"'),"Fantasy latest verified production deployment is recorded");
check(data.includes('appId:"terraflow-matrix",recordedWebVersion:"v1.7.0",stagedWebVersion:"v1.15.0"'),"TerraFlow keeps v1.7.0 live and v1.15.0 staged");
check(data.includes('recordedDeploymentId:"dpl_784aR3rSMoze7BMFuweYc5fDE6AR"'),"TerraFlow verified production deployment is recorded");

const terraLine=apps.split("\n").find(line=>line.includes('id:"terraflow-matrix"'))||"";
check(terraLine.includes('version:"v1.7.0"'),"Public TerraFlow fallback remains verified live v1.7.0");
check(!terraLine.includes("syncSource:"),"Public app registry cannot promote TerraFlow repository v1.15.0 to live");

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
