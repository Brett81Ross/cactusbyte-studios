import fs from "node:fs";

const firebase=fs.readFileSync("src/lib/firebase-rest.ts","utf8");
const identity=fs.readFileSync("src/lib/cactusbyte-id.ts","utf8");
const authSurface=fs.readFileSync("src/app/cactusbyte-auth-surface.tsx","utf8");
const ownerAccess=fs.readFileSync("src/lib/owner-access.ts","utf8");
const ownerDevice=fs.readFileSync("src/lib/owner-device.ts","utf8");
const ownerStatus=fs.readFileSync("src/app/api/owner/status/route.ts","utf8");
const ownerBootstrap=fs.readFileSync("src/app/api/owner/bootstrap/route.ts","utf8");
const ownerDevicePage=fs.readFileSync("src/app/owner-device/page.tsx","utf8");
const page=fs.readFileSync("src/app/page.tsx","utf8");

const ownerRestore=identity.indexOf("const ownerSession=await restoreTrustedOwner()");
const firebaseFallback=identity.indexOf("if(!s)s=await getFreshSession()",ownerRestore);

const checks=[
 [firebase.includes("securetoken.googleapis.com/v1/token"),"Firebase refresh-token endpoint is wired"],
 [firebase.includes('grant_type:"refresh_token"'),"Saved Firebase refresh token is exchanged"],
 [firebase.includes("export async function getFreshSession"),"Fresh-session helper exists"],
 [firebase.includes("headers:await h()"),"Firestore requests wait for a fresh token"],
 [identity.includes("async function restoreTrustedOwner()"),"Trusted-owner restoration helper exists"],
 [identity.includes("const attempts=hasOwnerBackup()?3:2"),"Trusted owner restoration retries transient failures"],
 [identity.includes("ownerAutoSessionOnce()"),"Trusted-device custom-token session path is preserved"],
 [ownerRestore>=0&&firebaseFallback>ownerRestore,"Trusted-owner restore runs before Firebase saved-session fallback"],
 [identity.includes("await getFreshSession()"),"Firebase saved-session refresh remains available as fallback"],
 [page.includes('id.busy?"Restoring ID…":"Sign In"'),"Header suppresses false Sign In while restoring"],
 [page.includes('id.busy?"Restoring CactusByte ID…":"Not signed in"'),"Identity panel suppresses false signed-out state"],
 [page.includes('id.busy?"Checking":"Sign-in"'),"Cloud status shows Checking during restoration"],

 // Signing-key cutover / clean-install recovery gate. The legacy WebView's
 // localStorage and cookies are lost during the one-time certificate change,
 // so owner recovery must not depend on those values surviving uninstall.
 [firebase.includes("export async function emailLogin")&&identity.includes("const s=await emailLogin(email,password)"),"Clean install can recreate a CactusByte ID session with email/password"],
 [firebase.includes("export async function emailPasswordReset")&&authSurface.includes("await emailPasswordReset(cleanEmail)"),"Clean install exposes password-reset recovery"],
 [identity.includes("const loaded=await profileFor(s);const owner=await ownerVerified(s)"),"Fresh CactusByte ID login re-runs server owner verification"],
 [ownerAccess.includes('process.env.OWNER_FIREBASE_UID')&&ownerAccess.includes("adminAuth().verifyIdToken(token)"),"Owner authority can be re-established from a verified Firebase identity"],
 [ownerAccess.includes('profile.data()?.role!=="owner"'),"Server-side owner profile remains an owner-authority fallback"],
 [ownerStatus.includes('owner.source==="cactusbyte-id"')&&ownerStatus.includes("createOwnerDeviceToken()")&&ownerStatus.includes('"Set-Cookie":ownerCookieHeader(deviceToken)'),"Verified clean-install owner login receives a fresh trusted-device credential"],
 [ownerDevice.includes('process.env.OWNER_DEVICE_SIGNING_SECRET')&&ownerDevice.includes('process.env.OWNER_DEVICE_SETUP_SECRET'),"Trusted-device credentials remain server-secret-backed"],
 [ownerBootstrap.includes("verifyOwnerSetupSecret")&&ownerBootstrap.includes("createOwnerDeviceToken()"),"Private owner-device bootstrap can re-trust a clean install"],
 [ownerDevicePage.includes('localStorage.setItem(OWNER_BACKUP_KEY,token)')&&ownerDevicePage.includes('fetch("/api/owner/session"')&&ownerDevicePage.includes('fetch("/api/owner/status"'),"Owner-device bootstrap verifies the new session before declaring success"],
 [!ownerDevicePage.includes("OWNER_DEVICE_SETUP_SECRET")&&!ownerDevicePage.includes("OWNER_DEVICE_SIGNING_SECRET"),"Owner-device page does not embed server secrets in client source"]
];

let failed=false;
for(const [ok,label] of checks){
 console.log(`${ok?"PASS":"FAIL"} ${label}`);
 if(!ok)failed=true;
}
if(failed)process.exit(1);
console.log("CactusByte auth persistence and clean-install recovery QA passed.");
