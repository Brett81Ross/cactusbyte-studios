import fs from "node:fs";

const ownerAccess=fs.readFileSync("src/lib/owner-access.ts","utf8");
const cactusId=fs.readFileSync("src/lib/cactusbyte-id.ts","utf8");
const failures=[];
const check=(ok,msg)=>{if(!ok)failures.push(msg);else console.log(`✓ ${msg}`)};

check(ownerAccess.includes('const configured=configuredOwnerUid();')&&ownerAccess.includes('decoded.uid===configured'),"Configured OWNER_FIREBASE_UID is authoritative for a verified signed-in account");
check(ownerAccess.includes('doc(decoded.uid).set({uid:decoded.uid,role:"owner"},{merge:true})'),"Authoritative owner login self-heals a stale Firestore profile role");

const bootStart=cactusId.indexOf('const ownerSession=await restoreTrustedOwner();');
const bootVerify=cactusId.indexOf('const owner=Boolean(ownerSession)||await ownerVerified(s);',bootStart);
const bootUser=cactusId.indexOf('setUser({uid:s.uid,email:s.email});',bootVerify);
check(bootStart>=0&&bootVerify>bootStart&&bootUser>bootVerify,"Startup resolves trusted/server owner status before exposing the signed-in identity to the UI");

const loginStart=cactusId.indexOf('async function login(');
const loginVerify=cactusId.indexOf('const loaded=await profileFor(s);const owner=await ownerVerified(s);',loginStart);
const loginUser=cactusId.indexOf('setUser({uid:s.uid,email:s.email});',loginVerify);
check(loginStart>=0&&loginVerify>loginStart&&loginUser>loginVerify,"Email login resolves authoritative owner status before rendering the signed-in role");

const registerStart=cactusId.indexOf('async function register(');
const registerVerify=cactusId.indexOf('const loaded=await profileFor(s);const owner=await ownerVerified(s);',registerStart);
const registerUser=cactusId.indexOf('setUser({uid:s.uid,email:s.email});',registerVerify);
check(registerStart>=0&&registerVerify>registerStart&&registerUser>registerVerify,"Account registration resolves authoritative owner status before rendering the signed-in role");

if(failures.length){
 for(const failure of failures)console.error(`✗ ${failure}`);
 process.exit(1);
}
console.log("Owner authority regression QA passed.");
