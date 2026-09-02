import fs from "node:fs";

const read=p=>fs.readFileSync(p,"utf8");
const exists=p=>fs.existsSync(p);
const apps=read("src/data/apps.ts");
const releases=read("src/data/releases.ts");
const registry=read("PRODUCTION_REGISTRY.md");
const abl=read("ATOMIC_BUILD_LIST.md");
const page=read("src/app/page.tsx");
const registryRoute=read("src/app/api/registry/route.ts");
const manifestRoute=read("src/app/api/manifest/route.ts");
const vercel=read("vercel.json");

function must(text,needle,label){if(!text.includes(needle))throw new Error(`Missing ${label}: ${needle}`)}

must(apps,'export const internalStudioApps:StudioApp[]=[',"internal registry");
must(apps,'lifecycle?:AppLifecycle;customerVisible?:boolean',"lifecycle fields");
must(apps,'id:"orbitgather"',"OrbitGather internal record");
must(apps,'lifecycle:"shelved",customerVisible:false',"OrbitGather shelved visibility state");
must(apps,'export const studioApps:StudioApp[]=internalStudioApps.filter(a=>a.lifecycle!=="shelved"&&a.customerVisible!==false);',"customer-facing registry filter");
must(releases,'appId:"orbitgather"',"retained OrbitGather release record");
must(releases,'title:"Shelved internal release record"',"shelved release status");
must(registry,'OrbitGather™ | v0.5.0 · SHELVED',"internal production registry lifecycle");
must(registry,'production Supabase untouched',"production data preservation note");
must(abl,'**SHELVED 2026-09-01:** remove OrbitGather from the active Phase 7 runtime/device queue',"Phase 7 queue removal");
must(abl,'Move the active Phase 7 implementation focus to **Acelynn Pro™**',"next active target");
must(abl,'**DEFERRED WHILE SHELVED:**',"recovery runtime deferral");

if(page.includes("internalStudioApps"))throw new Error("Customer-facing hub must not import the internal registry.");
if(registryRoute.includes("internalStudioApps"))throw new Error("Public registry route must not expose shelved apps.");
if(manifestRoute.includes("internalStudioApps"))throw new Error("Public manifest route must not expose shelved apps.");

for(const path of [
 "src/lib/orbitgather-recovery.ts",
 "src/app/orbitgather-recovery/page.tsx",
 "src/app/api/orbitgather/recovery/issue/route.ts",
 "src/app/api/orbitgather/recovery/confirm-claim/route.ts",
 "src/app/api/orbitgather/recovery/begin-restore/route.ts",
 "src/app/api/orbitgather/recovery/finish-restore/route.ts",
 "android-packager/ORBITGATHER_IDENTITY_RECOVERY_DESIGN.md",
])if(!exists(path))throw new Error(`Shelving must retain recovery source: ${path}`);

if(!/"deploymentEnabled"\s*:\s*false/.test(vercel))throw new Error("Git deployment must remain disabled during shelving QA.");
console.log("OrbitGather shelving contract QA passed: hidden from customer surfaces, retained internally, recovery inactive and preserved.");
