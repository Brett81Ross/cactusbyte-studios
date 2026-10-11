import fs from "node:fs";

const identity=fs.readFileSync("src/data/android-identity.ts","utf8");
const migration=fs.readFileSync("src/data/android-migration.ts","utf8");
const native=fs.readFileSync("src/data/native-distribution.ts","utf8");
const vercel=JSON.parse(fs.readFileSync("vercel.json","utf8"));
const pass=[];const fail=[];
const check=(ok,msg)=>{(ok?pass:fail).push(msg)};

check(identity.includes('intendedPackageId:"com.cactusbyte.studios"'),"CactusByte intended Android namespace is explicitly reserved");
check(identity.includes('status:"LEGACY_ARTIFACT_RECORDED"'),"Existing APK is recorded as legacy artifact evidence, not native-source verification");
check(identity.includes('return record.status==="NATIVE_SOURCE_VERIFIED"||record.status==="PLAY_IDENTITY_LOCKED"'),"Package identity is exposed as verified only after native-source or Play identity proof");
check(migration.includes('legacy("cactusbyte-studios","CactusByte Studios","cactusbyte",null)'),"Migration registry remains fail-closed for CactusByte package identity");
check(native.includes('CactusByte-Studios.apk')&&native.includes('packageId:"com.cactusbyte.studios"'),"Legacy native distribution contract remains intact for installed/direct APK users");
check(!identity.includes("cutoverAuthorized:true")&&!identity.includes("playPublished:true"),"Identity reservation cannot authorize cutover or Play publication");
check(vercel?.git?.deploymentEnabled===false,"Vercel deployment remains disabled");

console.log("\nCactusByte Android Identity Contract QA");
for(const x of pass)console.log(`✓ ${x}`);
for(const x of fail)console.error(`✗ ${x}`);
console.log(`\n${pass.length} passed · ${fail.length} failed`);
if(fail.length)process.exit(1);
