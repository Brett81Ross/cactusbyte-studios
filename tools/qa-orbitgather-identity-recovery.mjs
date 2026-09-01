import fs from "node:fs";

const read=p=>fs.readFileSync(p,"utf8");
const lib=read("src/lib/orbitgather-recovery.ts");
const issue=read("src/app/api/orbitgather/recovery/issue/route.ts");
const claim=read("src/app/api/orbitgather/recovery/confirm-claim/route.ts");
const begin=read("src/app/api/orbitgather/recovery/begin-restore/route.ts");
const finish=read("src/app/api/orbitgather/recovery/finish-restore/route.ts");
const page=read("src/app/orbitgather-recovery/page.tsx");
const env=read(".env.example");
const design=read("android-packager/ORBITGATHER_IDENTITY_RECOVERY_DESIGN.md");
const vercel=read("vercel.json");

function must(text,needle,label){if(!text.includes(needle))throw new Error(`Missing ${label}: ${needle}`)}
function before(text,a,b,label){const x=text.indexOf(a),y=text.indexOf(b);if(x<0||y<0||x>=y)throw new Error(`Ordering failed: ${label}`)}

must(lib,'ORBIT_RECOVERY_TOKEN_TTL_MS=5*60*1000',"five-minute token TTL");
must(lib,'RESTORE_LEASE_MS=2*60*1000',"restore lease");
must(lib,'RATE_LIMIT_MS=15*1000',"rate limit");
must(lib,'createHash("sha256")',"token hashing");
must(lib,'createHmac("sha256"',"bridge HMAC");
must(lib,'timingSafeEqual',"timing-safe HMAC comparison");
must(lib,'INSTALLATION_ALREADY_BOUND',"cross-account ownership rejection");
must(lib,'FieldValue.arrayUnion(installationId)',"multi-installation account binding");
must(lib,'status:"processing"',"restore processing lease state");
must(lib,'if(status==="processing"&&existingLeaseExpiresAtMs>now)',"same-operation processing retry");
must(lib,'if(status==="consumed")',"consumed restore replay state");
must(lib,'status==="consumed"&&success&&storedOperationId===operationId',"idempotent completion acknowledgement");
must(lib,'RESTORE_OPERATION_MISMATCH',"restore operation lock");
must(lib,'legacy_installation_claim',"claim audit source");
must(begin,'state:result.state',"restore lease state response");

before(issue,'testerIdentity(request)','issueOrbitRecoveryToken(',"authenticated issuance");
before(claim,'verifyOrbitBridgeAttestation("claim"','confirmOrbitLegacyClaim(',"claim HMAC before binding");
before(begin,'verifyOrbitBridgeAttestation("begin-restore"','beginOrbitRestore(',"begin HMAC before lease");
before(finish,'verifyOrbitBridgeAttestation("finish-restore"','finishOrbitRestore(',"finish HMAC before completion");

must(page,'Protect This OrbitGather Installation',"protect UI");
must(page,'Restore My OrbitGather Cloud Identity',"restore UI");
must(page,'No cloud rows are copied.',"no-row-copy disclosure");
must(design,'no Supabase DDL/schema migration is required',"schema decision");
must(design,'NO UNINSTALL / NO CUTOVER',"hard runtime gate");
must(env,'ORBITGATHER_RECOVERY_BRIDGE_SECRET=',"server secret placeholder");
if(env.includes('NEXT_PUBLIC_ORBITGATHER_RECOVERY_BRIDGE_SECRET'))throw new Error("OrbitGather bridge secret must not be public.");
if(!/"deploymentEnabled"\s*:\s*false/.test(vercel))throw new Error("Git deployment must remain disabled on the recovery branch.");

console.log("OrbitGather CactusByte recovery authority contract QA passed.");
