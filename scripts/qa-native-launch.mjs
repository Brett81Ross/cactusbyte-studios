import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const native=read("src/data/native-distribution.ts");
const launch=read("src/app/launch-bar.tsx");
const page=read("src/app/page.tsx");
const vercel=read("vercel.json");
const failures=[];
const check=(ok,msg)=>{if(!ok)failures.push(msg);else console.log(`✓ ${msg}`)};

const ids=[...native.matchAll(/appId:"([^"]+)"/g)].map(m=>m[1]);
check(ids.length===13,"Native distribution registry tracks 12 apps plus the CactusByte hub");
check(new Set(ids).size===ids.length,"Native distribution app IDs are unique");
for(const id of ["cactusbyte-studios","noproblem","machzero","rapid-takeoff","acelynn-pro","pocketstomp","ghostlane","first-bearing","fantasy-matrix","scouttrace","shadownex-prime","terraflow-matrix","orbitgather"])check(ids.includes(id),`${id}: native distribution record exists`);

const urls=[...native.matchAll(/legacyDirectUrl:`\$\{RELEASE_BASE\}\/([^`]+)`/g)].map(m=>m[1]);
check(urls.length===13,"All native records have a current supported Direct APK asset");
check(native.includes('RELEASE_BASE="https://github.com/Brett81Ross/cactusbyte-studios/releases/download/android-latest"'),"Native Direct links remain on the approved android-latest public release");
check(!native.includes("android-release-v2-foundation")&&!native.includes("PERMANENT_KEYS_STAGED"),"Permanent-signing staging artifacts are not exposed as public downloads");
check([...native.matchAll(/playUrl:null/g)].length===13,"Google Play is not falsely presented as published");
check(native.includes('appId:"scouttrace"')&&native.includes('nativeRequiredFor:"full Android device-security scanning"'),"ScoutTrace clearly identifies the capability that requires native Android");

check(launch.includes('nativeDistributionByApp'),"LaunchBar uses the centralized native distribution registry");
check(launch.includes('minHeight:48'),"Native launch controls start at the locked 48px touch target");
check(launch.includes('CactusByteNative\\/1\\.0'),"Native router preserves the current installed-hub user-agent contract");
check(launch.includes('target.closest(".actions")&&isAndroid()'),"Android app-card Open App actions route through the Native Launch Router");
check(launch.includes('label==="Install"'),"Legacy header Install action routes through the Native Launch Router");
check(launch.includes('stopImmediatePropagation'),"Native router prevents competing install/open handlers from running after interception");
check(launch.includes('beforeinstallprompt')&&launch.includes('suppressLegacyPwa'),"Browser PWA install prompting is suppressed behind the native launch authority");
check(launch.includes('Open Web App')&&launch.includes('Download Android App'),"Android users receive explicit Web versus Direct choices");
check(launch.includes('Google Play: not published yet'),"Launch UI does not imply Play availability");
check(launch.includes('Permanent-signing cutover remains separate'),"Launch UI cannot be mistaken for signing cutover authorization");
check(!launch.includes('matchMedia')&&!launch.includes('600px'),"Native routing does not invent a Fold-specific APK choice");
check(page.includes('onClick={()=>void installApp()}'),"Existing header Install control remains compatible with router interception while staged");

check(vercel.includes('"deploymentEnabled":false'),"Vercel deployment remains disabled during Native Launch staging");

if(failures.length){for(const failure of failures)console.error(`✗ ${failure}`);console.error(`\n${failures.length} Native Launch QA failure(s)`);process.exit(1)}
console.log("\nCactusByte v1.6 Native Launch Router QA passed");
