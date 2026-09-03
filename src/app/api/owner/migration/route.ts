import {androidMigrationRecords,deriveAndroidMigrationState,nextAndroidMigrationGate} from "../../../../data/android-migration";
import {ownerIdentity} from "../../../../lib/owner-access";

export const runtime="nodejs";
export const dynamic="force-dynamic";

type SigningManifest={status?:string;apps?:{flavor?:string;packageId?:string}[]};
const noStore={"Cache-Control":"no-store, max-age=0"};

async function signingReadiness(){
 try{
  const response=await fetch("https://raw.githubusercontent.com/Brett81Ross/cactusbyte-studios/android-release-v2-foundation/android-packager/signing-manifest.json",{headers:{"User-Agent":"CactusByte-Migration-Center/1.0"},cache:"no-store",signal:AbortSignal.timeout(5000)});
  if(!response.ok)return{available:false,staged:false,status:`HTTP_${response.status}`,flavors:new Set<string>()};
  const manifest=await response.json() as SigningManifest;
  const flavors=new Set((manifest.apps||[]).map(app=>app.flavor).filter((x):x is string=>Boolean(x)));
  return{available:true,staged:manifest.status==="PERMANENT_KEYS_STAGED",status:manifest.status||"UNVERIFIED",flavors};
 }catch{return{available:false,staged:false,status:"UNAVAILABLE",flavors:new Set<string>()}}
}

export async function GET(request:Request){
 const owner=await ownerIdentity(request);
 if(!owner)return Response.json({error:"OWNER_REQUIRED"},{status:403,headers:noStore});
 const signing=await signingReadiness();
 const apps=androidMigrationRecords.map(record=>{
  const state=deriveAndroidMigrationState(record.evidence);
  const signingIdentityStaged=signing.staged&&signing.flavors.has(record.flavor);
  const backupGate=record.evidence.backupVerified?"VERIFIED":"NOT_VERIFIED";
  const restoreGate=record.evidence.restoreVerified?"VERIFIED":"NOT_VERIFIED";
  const cutoverReadinessGate=record.evidence.cutoverReadinessVerified?"VERIFIED":"NOT_VERIFIED";
  const canConsiderCutover=record.evidence.backupVerified&&record.evidence.restoreVerified&&record.evidence.cutoverReadinessVerified&&signingIdentityStaged;
  return{
   appId:record.appId,
   name:record.name,
   flavor:record.flavor,
   packageId:record.packageId,
   state,
   nextGate:nextAndroidMigrationGate(state),
   signingIdentityStaged,
   backupGate,
   restoreGate,
   cutoverReadinessGate,
   canConsiderCutover,
   cutoverAuthorized:false,
   canUninstallLegacy:false,
   playPublished:record.evidence.playPublished,
   instruction:state==="LEGACY"?"Keep the installed legacy app. Create and verify a local persistent-WebView backup before any migration step.":state==="BACKUP_READY"?"Keep the legacy app installed. Prove restore into the temporary permanent-signed migration build before advancing.":state==="RESTORE_VERIFIED"?"Restore is verified, but do not uninstall or cut over until CUTOVER_READY evidence and separate owner approval exist.":state==="CUTOVER_READY"?"Readiness is proven. Do not uninstall or cut over until the owner explicitly approves this app's signing migration.":state==="PERMANENT"?"Permanent signing is verified. Google Play remains a separate publication gate.":"Permanent signing and Google Play publication are verified."
  };
 });
 const counts={
  LEGACY:apps.filter(app=>app.state==="LEGACY").length,
  BACKUP_READY:apps.filter(app=>app.state==="BACKUP_READY").length,
  RESTORE_VERIFIED:apps.filter(app=>app.state==="RESTORE_VERIFIED").length,
  CUTOVER_READY:apps.filter(app=>app.state==="CUTOVER_READY").length,
  PERMANENT:apps.filter(app=>app.state==="PERMANENT").length,
  PLAY_READY:apps.filter(app=>app.state==="PLAY_READY").length
 };
 return Response.json({
  owner:true,
  checkedAt:new Date().toISOString(),
  stateMachine:["LEGACY","BACKUP_READY","RESTORE_VERIFIED","CUTOVER_READY","PERMANENT","PLAY_READY"],
  signingManifest:{available:signing.available,status:signing.status,permanentKeysStaged:signing.staged},
  counts,
  apps,
  safety:{cutoverAuthorized:false,uninstallAuthorized:false,googlePlayPublicationAuthorized:false,requiresExplicitPerAppOwnerApproval:true}
 },{headers:noStore});
}
