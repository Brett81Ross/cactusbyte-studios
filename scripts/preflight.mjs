import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const exists=p=>fs.existsSync(path.join(root,p));
const pass=[];
const warn=[];
const fail=[];
const check=(ok,message)=>{(ok?pass:fail).push(message)};

const pkg=JSON.parse(read("package.json"));
const page=read("src/app/page.tsx");
const apps=read("src/data/apps.ts");
const releases=read("src/data/releases.ts");
const apiManifest=read("src/app/api/manifest/route.ts");
const core=read("src/app/api/core/route.ts");
const firebase=read("src/lib/firebase.ts");
const cactusId=read("src/lib/cactusbyte-id.ts");
const firestoreRules=read("firestore.rules");
const gitignore=read(".gitignore");
const layout=read("src/app/layout.tsx");
const workflow=read(".github/workflows/atomic-qa.yml");
const envExample=read(".env.example");
const entitlementCloud=exists("src/lib/entitlements-cloud.ts")?read("src/lib/entitlements-cloud.ts"):"";
const firebaseAdmin=exists("src/lib/firebase-admin.ts")?read("src/lib/firebase-admin.ts"):"";
const stripeServer=exists("src/lib/stripe-server.ts")?read("src/lib/stripe-server.ts"):"";
const stripeWebhook=exists("src/app/api/stripe/webhook/route.ts")?read("src/app/api/stripe/webhook/route.ts"):"";
const checkoutRef=exists("src/lib/stripe-checkout-ref.ts")?read("src/lib/stripe-checkout-ref.ts"):"";
const checkoutRoute=exists("src/app/api/stripe/checkout-link/route.ts")?read("src/app/api/stripe/checkout-link/route.ts"):"";
const checkoutBridge=exists("src/app/secure-checkout-bridge.tsx")?read("src/app/secure-checkout-bridge.tsx"):"";
const ideaRadar=exists("src/app/api/idea-radar/route.ts")?read("src/app/api/idea-radar/route.ts"):"";
const communityCloud=exists("src/lib/community-cloud.ts")?read("src/lib/community-cloud.ts"):"";
const buttonPolish=exists("src/app/button-polish.css")?read("src/app/button-polish.css"):"";

const pageVersion=page.match(/const V="([^"]+)"/)?.[1];
const manifestVersion=apiManifest.match(/version:"([^"]+)"/)?.[1];
const coreVersion=core.match(/studioVersion:\s*"([^"]+)"/)?.[1];

check(pageVersion===pkg.version,`UI version matches package.json (${pkg.version})`);
check(manifestVersion===pkg.version,`Manifest API version matches package.json (${pkg.version})`);
check(coreVersion===pkg.version,`Core API studioVersion matches package.json (${pkg.version})`);

check(firebase.includes("NEXT_PUBLIC_FIREBASE_API_KEY"),"Firebase browser key is loaded from NEXT_PUBLIC_FIREBASE_API_KEY");
check(!/AIza[0-9A-Za-z_-]{20,}/.test(firebase),"No Firebase API key is hard-coded in src/lib/firebase.ts");
check(gitignore.includes(".env*"),"Environment files are ignored by Git");
check(!/serviceWorker\.register\s*\(/.test(page),"CactusByte does not register a service worker");
check(Boolean(buttonPolish),"Dedicated cross-device tappable-action styling is present");
check(buttonPolish.includes("button.primaryAction:not(:disabled)"),"Primary actions use the high-contrast raised treatment");
check(buttonPolish.includes(":focus-visible")&&buttonPolish.includes(":active"),"Buttons expose visible keyboard focus and pressed states");
check(buttonPolish.includes("prefers-reduced-motion"),"Button motion respects reduced-motion preferences");
check(!page.includes("RADAR_SEEDS"),"Hard-coded Idea Radar seeds are removed from the live Forge surface");
check(page.includes("Run AI Idea Radar")&&page.includes("AI web research + CactusByte signals"),"Idea Forge identifies the real AI research workflow");
check(page.includes('headers:{Authorization:`Bearer ${session.idToken}`}'),"Idea Radar sends verified CactusByte owner identity to the server");
check(communityCloud.includes("sources?:IdeaSource[]"),"Idea records retain clickable research evidence");
check(exists("tsconfig.json"),"TypeScript configuration is tracked instead of generated during CI");
check(layout.includes("metadataBase"),"Metadata base is explicitly configured for share-image URL resolution");
check(layout.includes("VERCEL_PROJECT_PRODUCTION_URL"),"Metadata base can resolve from the Vercel production hostname");
check(workflow.includes("actions/checkout@v5"),"Atomic QA uses the Node 24-compatible checkout action");
check(workflow.includes("actions/setup-node@v5"),"Atomic QA uses the Node 24-compatible setup-node action");
check(/node-version:\s*24/.test(workflow),"Atomic QA runs on Node.js 24");

check(Boolean(entitlementCloud),"Read-only entitlement cloud helper is present");
check(entitlementCloud.includes('runQuery("entitlements","userId"'),"Entitlements are queried only for the signed-in CactusByte ID");
check(!/setDocument\("entitlements"|addDocument\("entitlements"|patchDocument\("entitlements"/.test(entitlementCloud),"Client entitlement helper has no Firestore write path");
check(cactusId.includes("hasEntitlement"),"CactusByte ID exposes entitlement checks to app surfaces");
check(cactusId.includes("refreshEntitlements"),"CactusByte ID can refresh entitlement state after authentication");
const entitlementRule=firestoreRules.match(/match \/entitlements\/\{id\} \{([\s\S]*?)\n    \}/)?.[1]||"";
check(entitlementRule.includes("allow write: if false"),"Firestore entitlement writes remain blocked from clients");
check(core.includes('entitlementLedger: "read-only"'),"Core reports the entitlement ledger as read-only to clients");
check(core.includes('checkoutIdentityBinding: "signed-staged"'),"Core reports signed checkout identity binding as staged");
check(core.includes('entitlementProvisioning: "webhook-ready"'),"Core reports Stripe entitlement provisioning as webhook-ready, not falsely connected");

check(Boolean(firebaseAdmin),"Server-only Firebase Admin helper is present");
check(firebaseAdmin.includes("FIREBASE_ADMIN_PRIVATE_KEY"),"Firebase Admin uses a server-only private-key environment variable");
check(!firebaseAdmin.includes("NEXT_PUBLIC_FIREBASE_ADMIN"),"Firebase Admin credentials are never exposed through NEXT_PUBLIC variables");
check(Boolean(stripeServer),"Server-only Stripe helper is present");
check(stripeServer.includes("STRIPE_SECRET_KEY"),"Stripe server helper loads the secret key from server environment");
check(Boolean(stripeWebhook),"Stripe entitlement webhook route is present");
check(stripeWebhook.includes("constructEvent"),"Stripe webhook verifies Stripe signatures before processing events");
check(stripeWebhook.includes("verifyCheckoutReference"),"Stripe webhook verifies the server-signed checkout identity reference");
check(stripeWebhook.includes("reference.appId!==appId"),"Stripe webhook binds the signed identity to the paid app");
check(!stripeWebhook.includes("session.metadata?.cactusbyte_uid"),"Stripe webhook never trusts a client-supplied UID metadata fallback");
check(stripeWebhook.includes('event.type==="checkout.session.completed"'),"Stripe webhook provisions after completed Checkout sessions");
check(stripeWebhook.includes('event.type==="customer.subscription.updated"'),"Stripe webhook tracks subscription lifecycle updates");
check(stripeWebhook.includes('event.type==="customer.subscription.deleted"'),"Stripe webhook revokes access on subscription deletion");
check(stripeWebhook.includes('collection("entitlements")'),"Stripe webhook writes only through the privileged server entitlement path");
check(envExample.includes("STRIPE_WEBHOOK_SECRET")&&envExample.includes("FIREBASE_ADMIN_PRIVATE_KEY"),"Environment template documents webhook and Firebase Admin secrets");
check(envExample.includes("STRIPE_CHECKOUT_SIGNING_SECRET"),"Environment template documents the server-only checkout signing secret");
check(!/sk_(live|test)_[A-Za-z0-9]{16,}/.test(stripeServer+stripeWebhook),"No live Stripe secret key is hard-coded in server source");
check(!/whsec_[A-Za-z0-9]{16,}/.test(stripeServer+stripeWebhook),"No Stripe webhook signing secret is hard-coded in server source");
check(Boolean(ideaRadar),"AI Idea Radar route is present");
check(ideaRadar.includes("ownerIdentity(request)"),"Idea Radar is restricted to verified owner access");
check(ideaRadar.includes('tools:[{type:"web_search"}]'),"Idea Radar uses OpenAI live web search");
check(ideaRadar.includes('type:"json_schema"')&&ideaRadar.includes("IDEA_SCHEMA"),"Idea Radar requires schema-validated research output");
check(ideaRadar.includes("citedUrls(data)")&&ideaRadar.includes("citations.has(source.url)"),"Idea Radar saves only evidence links returned as web citations");
check(ideaRadar.includes("existingIdeaTitles")&&ideaRadar.includes("known.has(key)"),"Idea Radar compares against existing Forge titles and skips duplicates");
check(ideaRadar.includes("anonymizedFeedback")&&!ideaRadar.includes("data.contact"),"Idea Radar uses feedback signals without sending contact fields");
check(ideaRadar.includes('collection("ideas")')&&ideaRadar.includes('source:"radar"'),"AI concepts are persisted directly into Idea Forge");
check(ideaRadar.includes('collection("ideaRadarEvidence")')&&ideaRadar.includes('collection("ideaRadarRuns")'),"Radar runs and source evidence are retained for owner review");
check(envExample.includes("OPENAI_API_KEY")&&envExample.includes("OPENAI_IDEA_RADAR_MODEL"),"Environment template documents server-only Idea Radar credentials");
check(!/sk-[A-Za-z0-9_-]{20,}/.test(ideaRadar+envExample),"No OpenAI API key is hard-coded in source");
check(pkg.dependencies?.stripe,"Stripe server SDK is installed");
check(pkg.dependencies?.["firebase-admin"],"Firebase Admin SDK is installed");

check(Boolean(checkoutRef),"Server-side checkout-reference signer is present");
check(checkoutRef.includes('createHmac("sha256"'),"Checkout identity uses HMAC-SHA256 signing");
check(checkoutRef.includes("timingSafeEqual"),"Checkout identity verification uses timing-safe signature comparison");
check(Boolean(checkoutRoute),"Authenticated Stripe checkout-link route is present");
check(checkoutRoute.includes("adminAuth().verifyIdToken"),"Checkout launcher verifies the Firebase ID token server-side");
check(checkoutRoute.includes("createCheckoutReference"),"Checkout launcher creates a server-signed user/app reference");
check(checkoutRoute.includes("prefilled_email"),"Checkout launcher prefills the verified CactusByte ID email");
check(Boolean(checkoutBridge),"Secure checkout bridge is mounted in the client shell");
check(layout.includes("SecureCheckoutBridge"),"Root layout mounts the secure checkout bridge");
check(checkoutBridge.includes('/api/stripe/checkout-link'),"Storefront upgrade clicks route through the authenticated checkout launcher");
check(page.includes("✓ Pro Active"),"Storefront replaces upgrade CTA with Pro Active for entitled apps");
check(page.includes("Sign In to Upgrade"),"Storefront requires CactusByte ID before linked upgrades");
check(page.includes("Refresh Pro Access"),"Storefront exposes entitlement refresh after payment");

const ids=[...apps.matchAll(/\{id:"([^"]+)"/g)].map(m=>m[1]);
check(ids.length>0,"App registry contains records");
check(new Set(ids).size===ids.length,"App registry IDs are unique");

const records=apps.split("\n").filter(line=>line.trim().startsWith("{id:"));
const registryVersions=new Map();
for(const line of records){
 const id=line.match(/id:"([^"]+)"/)?.[1]||"unknown";
 const status=line.match(/status:"([^"]+)"/)?.[1];
 const version=line.match(/version:"([^"]+)"/)?.[1];
 const logo=line.match(/logo:"([^"]+)"/)?.[1];
 const repo=line.match(/repo:"([^"]+)"/)?.[1];
 const url=line.match(/url:"([^"]+)"/)?.[1];
 const syncSource=line.match(/syncSource:"([^"]+)"/)?.[1];
 const checkout=line.match(/checkoutUrl:"([^"]+)"/)?.[1];
 if(version)registryVersions.set(id,version);
 check(Boolean(version),`${id}: version is present`);
 check(Boolean(version&&version!=="Version not exposed"),`${id}: registry exposes a concrete version`);
 check(Boolean(logo),`${id}: logo is present`);
 check(Boolean(repo&&repo.startsWith("https://github.com/")),`${id}: GitHub repository URL is present`);
 if(logo?.startsWith("/"))check(exists(`public${logo}`),`${id}: local logo asset exists`);
 if(status==="Live")check(Boolean(url&&url.startsWith("https://")),`${id}: live app has an HTTPS launch URL`);
 if(status==="Repository"){
  warn.push(`${id}: production link still pending`);
  check(Boolean(syncSource&&syncSource.startsWith("https://")),`${id}: repository-only app has a live version sync source`);
 }
 if(checkout)check(checkout.startsWith("https://buy.stripe.com/"),`${id}: Stripe checkout uses buy.stripe.com`);
}

const releaseRecords=[...releases.matchAll(/\{appId:"([^"]+)",version:"([^"]+)"/g)].map(m=>({appId:m[1],version:m[2]}));
check(releaseRecords.length>0,"Release Center contains versioned records");
check(new Set(releaseRecords.map(r=>r.appId)).size===releaseRecords.length,"Release Center app IDs are unique");
check(releaseRecords.some(r=>r.appId==="cactusbyte-studios"),"Release Center includes CactusByte Studios");
check(ids.every(id=>releaseRecords.some(r=>r.appId===id)),"Every registry app has a Release Center record");
check(releaseRecords.length===ids.length+1,"Release Center has exactly one record per app plus CactusByte Studios");
for(const release of releaseRecords){
 if(release.appId==="cactusbyte-studios"){
  check(release.version.replace(/^v/,"")===pkg.version,"CactusByte Release Center version matches package.json");
  continue;
 }
 const registered=registryVersions.get(release.appId);
 check(Boolean(registered),`${release.appId}: Release Center app exists in registry`);
 if(registered)check(registered===release.version,`${release.appId}: Release Center version matches registry (${registered})`);
}

const fantasy=records.find(line=>line.includes('id:"fantasy-matrix"'))||"";
const fantasyVersion=fantasy.match(/version:"v?([^"]+)"/)?.[1];
const fantasyUrl=fantasy.match(/url:"([^"]+)"/)?.[1]||"";
check(!fantasyVersion||fantasyUrl.includes(`v=${fantasyVersion}`),"Fantasy Matrix launch query matches its registered version");

const pocketstomp=records.find(line=>line.includes('id:"pocketstomp"'))||"";
check(pocketstomp.includes('repo:"https://github.com/Brett81Ross/pocketstomp"'),"PocketStomp registry points to the advanced V2 source repository");
check(pocketstomp.includes('syncSource:"https://pocketstomp-v2-brett81ross.vercel.app/"'),"PocketStomp version sync stays on its verified production surface");

const terraflow=records.find(line=>line.includes('id:"terraflow-matrix"'))||"";
check(terraflow.includes('version:"v1.15.0"'),"TerraFlow registry tracks the current v1.15.0 branding release");
check(terraflow.includes('syncSource:"https://raw.githubusercontent.com/Brett81Ross/terraflow-matrix/main/cloud-release.js"'),"TerraFlow version sync is connected to its release surface");
check(terraflow.includes('logo:"/terraflow-mark.svg"'),"TerraFlow uses its approved Concept 2 brand mark");
check(exists("public/terraflow-mark.svg"),"Approved TerraFlow local brand asset exists");
check(!terraflow.includes('logo:"/logo2.png"'),"TerraFlow no longer falls back to the CactusByte logo");

console.log(`\nCactusByte atomic preflight v${pkg.version}`);
for(const x of pass)console.log(`✓ ${x}`);
for(const x of warn)console.log(`! ${x}`);
for(const x of fail)console.error(`✗ ${x}`);
console.log(`\n${pass.length} passed · ${warn.length} warnings · ${fail.length} failed`);
if(fail.length)process.exit(1);
