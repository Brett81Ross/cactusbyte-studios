import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const exists=p=>fs.existsSync(path.join(root,p));
const pass=[];
const fail=[];
const check=(ok,message)=>{(ok?pass:fail).push(message)};

const route=exists("src/app/api/owner/health/route.ts")?read("src/app/api/owner/health/route.ts"):"";
const dock=exists("src/app/account-dock.tsx")?read("src/app/account-dock.tsx"):"";
const truth=exists("src/lib/release-truth.ts")?read("src/lib/release-truth.ts"):"";
const env=read(".env.example");

check(Boolean(route),"Owner Health API exists");
check(route.includes("ownerIdentity(request)")&&route.includes('status:403'),"Owner Health fails closed to existing CactusByte owner authority");
check(route.includes("releaseTruthRecords")&&route.includes("resolveReleaseTruth"),"Owner Health consumes the central Release Truth Engine");
check(route.includes("adminAuth")&&route.includes("adminDb"),"Owner Health probes Firebase identity and the entitlement ledger server-side");
check(route.includes("stripeServer")&&route.includes("STRIPE_WEBHOOK_SECRET"),"Owner Health reports Stripe API connectivity and webhook configuration without client secrets");
check(route.includes("atomic-qa.yml")&&route.includes("branch=main"),"Owner Health reports canonical main-branch GitHub QA state");
check(route.includes("android-release-v2-foundation/android-packager/signing-manifest.json"),"Owner Health reads the staged Android signing manifest as evidence");
check(route.includes("cutoverAuthorized:false")&&route.includes("permanentSigningCutoverAuthorized:false")&&route.includes("googlePlayPublicationAuthorized:false"),"Owner Health cannot imply or authorize Android cutover or Play publication");
check(!route.includes("expectedSha256Fingerprint")&&!route.includes("FIREBASE_ADMIN_PRIVATE_KEY")&&!route.includes("VERCEL_ACCESS_TOKEN"),"Owner Health response logic does not surface signing fingerprints or server secret values");
check(dock.includes("CactusByte Owner Health Center™")&&dock.includes('/api/owner/health'),"Owner-only account dock exposes the Health Center");
check(dock.includes("INTERNAL RELEASE EVIDENCE")&&dock.includes("RELEASE TRUTH ATTENTION"),"Health Center clearly separates internal release evidence from the public hub");
check(dock.includes("Cutover: NOT AUTHORIZED")&&dock.includes("Owner Health is diagnostic only"),"Health Center states the deployment/cutover safety boundary in the UI");
check(truth.includes("recorded")&&truth.includes("detected")&&truth.includes("deployed"),"Owner Health is backed by recorded/detected/deployed release evidence");
check(env.includes("VERCEL_ACCESS_TOKEN")&&env.includes("VERCEL_TEAM_ID"),"Vercel production-verification credentials are documented as server-only configuration");
check(!/NEXT_PUBLIC_(VERCEL_ACCESS_TOKEN|STRIPE_SECRET_KEY|FIREBASE_ADMIN_PRIVATE_KEY|OWNER_DEVICE_SIGNING_SECRET)/.test(env+route+dock),"Owner Health keeps privileged credentials out of NEXT_PUBLIC configuration");

console.log("\nCactusByte Owner Health QA");
for(const x of pass)console.log(`✓ ${x}`);
for(const x of fail)console.error(`✗ ${x}`);
console.log(`\n${pass.length} passed · ${fail.length} failed`);
if(fail.length)process.exit(1);
