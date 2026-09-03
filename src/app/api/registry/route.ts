import {NextResponse} from "next/server";
import {studioApps} from "../../../data/apps";
import {releaseTruthByApp} from "../../../data/release-truth";
import {resolveReleaseTruth} from "../../../lib/release-truth";

export const revalidate=300;

type PublicRegistryRecord={
 id:string;
 version:string;
 status:"Live"|"Repository";
 synced:boolean;
 truthState:"verified"|"recorded"|"staged"|"mismatch"|"deployment-mismatch";
 detectedVersion:string|null;
 stagedVersion:string|null;
 sourceHealth:"ok"|"degraded"|"not-configured";
 deploymentVerification:"verified"|"mismatch"|"unavailable";
};

async function resolveApp(app:(typeof studioApps)[number]):Promise<PublicRegistryRecord>{
 const record=releaseTruthByApp.get(app.id);
 if(!record){
  return{id:app.id,version:app.version,status:app.status,synced:false,truthState:"recorded",detectedVersion:null,stagedVersion:null,sourceHealth:"not-configured",deploymentVerification:"unavailable"};
 }
 const truth=await resolveReleaseTruth(record);
 return{
  id:app.id,
  version:truth.liveVersion,
  status:app.status,
  synced:truth.sourceHealth==="ok"&&truth.detectedVersion===truth.liveVersion&&truth.truthState!=="deployment-mismatch",
  truthState:truth.truthState,
  detectedVersion:truth.detectedVersion,
  stagedVersion:truth.stagedVersion,
  sourceHealth:truth.sourceHealth,
  deploymentVerification:truth.deploymentVerification
 };
}

export async function GET(){
 const apps=await Promise.all(studioApps.map(resolveApp));
 return NextResponse.json({apps,syncedAt:new Date().toISOString(),truthModel:"recorded-detected-deployed-v1"},{headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=3600"}});
}
