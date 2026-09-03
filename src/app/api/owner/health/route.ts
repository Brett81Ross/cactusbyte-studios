import {releaseTruthRecords} from "../../../../data/release-truth";
import {adminAuth,adminDb} from "../../../../lib/firebase-admin";
import {ownerIdentity} from "../../../../lib/owner-access";
import {resolveReleaseTruth} from "../../../../lib/release-truth";
import {stripeServer} from "../../../../lib/stripe-server";

export const runtime="nodejs";
export const dynamic="force-dynamic";

type HealthState="ok"|"warn"|"error"|"unavailable";
type HealthCheck={id:string;label:string;state:HealthState;summary:string;detail?:string};
type WorkflowRun={status?:string;conclusion?:string|null;head_sha?:string;html_url?:string;created_at?:string;updated_at?:string};
type WorkflowResponse={workflow_runs?:WorkflowRun[]};
type SigningManifest={schemaVersion?:number;status?:string;apps?:unknown[]};

const noStore={"Cache-Control":"no-store, max-age=0"};

async function firebaseHealth():Promise<HealthCheck>{
 try{
  const[,entitlements]=await Promise.all([adminAuth().listUsers(1),adminDb().collection("entitlements").limit(1).get()]);
  return{id:"firebase",label:"Firebase + entitlement ledger",state:"ok",summary:"Server identity and entitlement ledger are reachable.",detail:`Entitlement probe completed (${entitlements.size} sample record${entitlements.size===1?"":"s"}).`};
 }catch(error){return{id:"firebase",label:"Firebase + entitlement ledger",state:"error",summary:"Server Firebase health probe failed.",detail:error instanceof Error?error.message:"Firebase health probe failed."}}
}

async function stripeHealth():Promise<HealthCheck>{
 if(!(process.env.STRIPE_SECRET_KEY||"").trim())return{id:"stripe",label:"Stripe",state:"unavailable",summary:"Stripe server credential is not configured."};
 try{
  await stripeServer().products.list({limit:1,active:true});
  const webhookConfigured=Boolean((process.env.STRIPE_WEBHOOK_SECRET||"").trim());
  return{id:"stripe",label:"Stripe",state:webhookConfigured?"ok":"warn",summary:webhookConfigured?"Stripe API is reachable and webhook verification is configured.":"Stripe API is reachable; webhook verification secret is not configured.",detail:"This verifies API connectivity/configuration only; it does not claim a recent webhook delivery."};
 }catch(error){return{id:"stripe",label:"Stripe",state:"error",summary:"Stripe API health probe failed.",detail:error instanceof Error?error.message:"Stripe health probe failed."}}
}

async function githubHealth():Promise<HealthCheck>{
 try{
  const response=await fetch("https://api.github.com/repos/Brett81Ross/cactusbyte-studios/actions/workflows/atomic-qa.yml/runs?branch=main&per_page=1",{headers:{Accept:"application/vnd.github+json","User-Agent":"CactusByte-Owner-Health/1.0"},cache:"no-store",signal:AbortSignal.timeout(5000)});
  if(!response.ok)return{id:"github",label:"GitHub Actions",state:"warn",summary:`GitHub Actions status returned ${response.status}.`};
  const run=(await response.json() as WorkflowResponse).workflow_runs?.[0];
  if(!run)return{id:"github",label:"GitHub Actions",state:"warn",summary:"No main-branch Atomic QA run was returned."};
  const success=run.status==="completed"&&run.conclusion==="success";
  const pending=run.status!=="completed";
  return{id:"github",label:"GitHub Actions",state:success?"ok":pending?"warn":"error",summary:success?"Latest main-branch Atomic QA passed.":pending?`Latest main-branch Atomic QA is ${run.status}.`:`Latest main-branch Atomic QA concluded ${run.conclusion||"without a conclusion"}.`,detail:[run.head_sha?`SHA ${run.head_sha.slice(0,12)}`:"",run.html_url||""].filter(Boolean).join(" · ")};
 }catch(error){return{id:"github",label:"GitHub Actions",state:"unavailable",summary:"GitHub Actions health probe is unavailable.",detail:error instanceof Error?error.message:"GitHub health probe failed."}}
}

async function androidSigningHealth(){
 try{
  const response=await fetch("https://raw.githubusercontent.com/Brett81Ross/cactusbyte-studios/android-release-v2-foundation/android-packager/signing-manifest.json",{headers:{"User-Agent":"CactusByte-Owner-Health/1.0"},cache:"no-store",signal:AbortSignal.timeout(5000)});
  if(!response.ok)return{check:{id:"android-signing",label:"Android signing",state:"warn" as const,summary:`Signing manifest returned ${response.status}.`},summary:{status:"UNVERIFIED",appCount:0,cutoverAuthorized:false,playPublished:false}};
  const manifest=await response.json() as SigningManifest;
  const appCount=Array.isArray(manifest.apps)?manifest.apps.length:0;
  const staged=manifest.status==="PERMANENT_KEYS_STAGED"&&appCount===releaseTruthRecords.length;
  return{check:{id:"android-signing",label:"Android signing",state:staged?"ok" as const:"warn" as const,summary:staged?`Permanent signing identities are staged for all ${appCount} Android apps.`:`Signing manifest is ${manifest.status||"unverified"} for ${appCount} app${appCount===1?"":"s"}.`,detail:"Staged signing readiness is not cutover authorization."},summary:{status:manifest.status||"UNVERIFIED",appCount,cutoverAuthorized:false,playPublished:false}};
 }catch(error){return{check:{id:"android-signing",label:"Android signing",state:"unavailable" as const,summary:"Signing readiness probe is unavailable.",detail:error instanceof Error?error.message:"Android signing probe failed."},summary:{status:"UNAVAILABLE",appCount:0,cutoverAuthorized:false,playPublished:false}}}
}

export async function GET(request:Request){
 const owner=await ownerIdentity(request);
 if(!owner)return Response.json({error:"OWNER_REQUIRED"},{status:403,headers:noStore});

 const[truthSettled,firebase,stripe,github,android]=await Promise.all([
  Promise.allSettled(releaseTruthRecords.map(record=>resolveReleaseTruth(record))),
  firebaseHealth(),stripeHealth(),githubHealth(),androidSigningHealth()
 ]);

 const truth=truthSettled.map((result,index)=>{
  if(result.status==="fulfilled")return result.value;
  const record=releaseTruthRecords[index];
  return{appId:record.appId,liveVersion:record.recordedWebVersion,recordedVersion:record.recordedWebVersion,detectedVersion:null,stagedVersion:record.stagedWebVersion||null,truthState:"recorded",state:"UNVERIFIED",sourceHealth:"degraded",deploymentVerification:"unavailable",deploymentId:record.recordedDeploymentId,latestDeploymentId:null,gitSha:record.recordedGitSha||null,checkedAt:new Date().toISOString(),recorded:{version:record.recordedWebVersion,source:"CactusByte production registry",checkedAt:record.verifiedAt,deploymentId:record.recordedDeploymentId,gitSha:record.recordedGitSha||null},detected:null,deployed:null,androidMigration:"LEGACY",androidDirectUrl:null,playUrl:null,iosUrl:null,issues:[result.reason instanceof Error?result.reason.message:"Release truth resolution failed"]};
 });
 const counts={live:truth.filter(x=>x.state==="LIVE").length,staged:truth.filter(x=>x.state==="STAGED").length,mismatch:truth.filter(x=>x.state==="MISMATCH").length,unverified:truth.filter(x=>x.state==="UNVERIFIED").length,total:truth.length};
 const systems=[firebase,stripe,github,android.check];
 const systemCounts={ok:systems.filter(x=>x.state==="ok").length,warn:systems.filter(x=>x.state==="warn").length,error:systems.filter(x=>x.state==="error").length,unavailable:systems.filter(x=>x.state==="unavailable").length};

 return Response.json({
  owner:true,
  generatedAt:new Date().toISOString(),
  releaseTruth:{counts,apps:truth},
  systems,
  systemCounts,
  android:android.summary,
  boundaries:{productionDeploymentAuthorized:false,permanentSigningCutoverAuthorized:false,googlePlayPublicationAuthorized:false}
 },{headers:noStore});
}
