import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const exists=p=>fs.existsSync(path.join(root,p));
const pass=[];
const fail=[];
const check=(ok,message)=>{(ok?pass:fail).push(message)};

const data=exists("src/data/android-migration.ts")?read("src/data/android-migration.ts"):"";
const route=exists("src/app/api/owner/migration/route.ts")?read("src/app/api/owner/migration/route.ts"):"";
const dock=exists("src/app/account-dock.tsx")?read("src/app/account-dock.tsx"):"";
const apps=exists("src/data/apps.ts")?read("src/data/apps.ts"):"";
const vercel=JSON.parse(read("vercel.json"));

const states=["LEGACY","BACKUP_READY","RESTORE_VERIFIED","CUTOVER_READY","PERMANENT","PLAY_READY"];
check(Boolean(data)&&Boolean(route),"Android Migration Center data and owner API exist");
check(states.every(state=>data.includes(`"${state}"`)||route.includes(`"${state}"`)),"Locked six-state Android migration model is represented exactly");
const ecosystemIds=[...apps.matchAll(/\{id:"([^"]+)"/g)].map(match=>match[1]);
const migrationIds=[...data.matchAll(/legacy\("([^"]+)"/g)].map(match=>match[1]);
const expectedIds=["cactusbyte-studios",...ecosystemIds];
check(expectedIds.length===migrationIds.length&&expectedIds.every(id=>migrationIds.includes(id)),"Migration registry covers CactusByte Studios plus every ecosystem app exactly once");
check(data.includes('legacy("hustle-first","Hustle First","hustlefirst",null)')&&data.includes('legacy("rivetex","RIVETEX","rivetex",null)'),"Unverified Hustle First and RIVETEX Android package IDs fail closed instead of being invented");
check(data.includes('legacy("cactusbyte-studios","CactusByte Studios","cactusbyte",null)'),"CactusByte Android package identity fails closed until a native wrapper or signed package manifest verifies it");
check(data.includes("backupVerified:false")&&data.includes("restoreVerified:false")&&data.includes("cutoverReadinessVerified:false"),"No app is advanced without recorded backup, restore, and cutover-readiness evidence");
check(data.includes('return"LEGACY"')&&data.indexOf('if(evidence.backupVerified)')<data.indexOf('return"LEGACY"'),"Migration state is derived from evidence and fails closed to LEGACY");
check(route.includes("ownerIdentity(request)")&&route.includes('status:403'),"Migration Center is restricted to existing owner authority");
check(route.includes("PERMANENT_KEYS_STAGED")&&route.includes("android-release-v2-foundation/android-packager/signing-manifest.json"),"Permanent-signing staging is treated as evidence, not as migration completion");
check(route.includes("cutoverAuthorized:false")&&route.includes("canUninstallLegacy:false")&&route.includes("googlePlayPublicationAuthorized:false"),"Migration API cannot authorize uninstall, signing cutover, or Google Play publication");
check(route.includes("Keep the installed legacy app")&&route.includes("separate owner approval"),"Migration guidance explicitly preserves the legacy install until evidence and owner approval exist");
check(!/adb\s+uninstall|pm\s+uninstall|location\.assign\([^)]*permanent/i.test(route+dock),"Migration Center contains no automatic uninstall or permanent-build launch path");
check(dock.includes("ANDROID MIGRATION CENTER")&&dock.includes('/api/owner/migration'),"Owner Health UI exposes the read-only Migration Center");
check(dock.includes("UNINSTALL AUTHORIZATION: NO")&&dock.includes("SIGNING CUTOVER AUTHORIZATION: NO"),"Owner UI displays the cutover safety boundary");
check(vercel?.git?.deploymentEnabled===false,"Vercel deployment remains disabled while migration work is staged");

console.log("\nCactusByte Android Migration Center QA");
for(const x of pass)console.log(`✓ ${x}`);
for(const x of fail)console.error(`✗ ${x}`);
console.log(`\n${pass.length} passed · ${fail.length} failed`);
if(fail.length)process.exit(1);
