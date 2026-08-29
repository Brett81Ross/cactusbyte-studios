import fs from "node:fs";

const firebase=fs.readFileSync("src/lib/firebase-rest.ts","utf8");
const identity=fs.readFileSync("src/lib/cactusbyte-id.ts","utf8");
const page=fs.readFileSync("src/app/page.tsx","utf8");

const checks=[
 [firebase.includes("securetoken.googleapis.com/v1/token"),"Firebase refresh-token endpoint is wired"],
 [firebase.includes('grant_type:"refresh_token"'),"Saved Firebase refresh token is exchanged"],
 [firebase.includes("export async function getFreshSession"),"Fresh-session helper exists"],
 [firebase.includes("headers:await h()"),"Firestore requests wait for a fresh token"],
 [identity.includes("await getFreshSession()"),"CactusByte ID hydration refreshes saved sessions"],
 [identity.includes("const ownerSession=await ownerAutoSession()"),"Trusted-owner auto session remains first priority"],
 [page.includes('id.busy?"Restoring ID…":"Sign In"'),"Header suppresses false Sign In while restoring"],
 [page.includes('id.busy?"Restoring CactusByte ID…":"Not signed in"'),"Identity panel suppresses false signed-out state"],
 [page.includes('id.busy?"Checking":"Sign-in"'),"Cloud status shows Checking during restoration"]
];

let failed=false;
for(const [ok,label] of checks){
 console.log(`${ok?"PASS":"FAIL"} ${label}`);
 if(!ok)failed=true;
}
if(failed)process.exit(1);
console.log("CactusByte auth persistence QA passed.");
