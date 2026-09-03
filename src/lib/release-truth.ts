import type {ReleaseTruthRecord} from "../data/release-truth";

export type TruthState="verified"|"recorded"|"staged"|"mismatch"|"deployment-mismatch";
export type DetectedSignal={ok:boolean;version:string|null;source:string|null;reason?:string};
export type DeploymentSignal={available:boolean;id:string|null;gitSha:string|null;createdAt:number|null;reason?:string};
export type ResolvedReleaseTruth={
 appId:string;
 liveVersion:string;
 recordedVersion:string;
 detectedVersion:string|null;
 stagedVersion:string|null;
 truthState:TruthState;
 sourceHealth:"ok"|"degraded"|"not-configured";
 deploymentVerification:"verified"|"mismatch"|"unavailable";
 deploymentId:string;
 latestDeploymentId:string|null;
 gitSha:string|null;
 checkedAt:string;
};

function normalizeVersion(value:string){
 const clean=value.trim().replace(/^version\s*/i,"").replace(/^v/i,"");
 return /^\d+\.\d+\.\d+$/.test(clean)?`v${clean}`:null;
}

export function extractDetectedVersion(source:string):string|null{
 const plain=normalizeVersion(source.trim());
 if(plain)return plain;
 const applicationVersion=source.match(/<meta[^>]*name=["']application-version["'][^>]*content=["']([^"']+)["'][^>]*>/i)?.[1]
  ??source.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']application-version["'][^>]*>/i)?.[1];
 if(applicationVersion){const normalized=normalizeVersion(applicationVersion);if(normalized)return normalized}
 const json=source.match(/["']version["']\s*:\s*["'](\d+\.\d+\.\d+)["']/i)?.[1];
 if(json)return `v${json}`;
 const visible=source.match(/\bv(\d+\.\d+\.\d+)\b/i)?.[1];
 return visible?`v${visible}`:null;
}

export async function fetchDetectedSignal(record:ReleaseTruthRecord):Promise<DetectedSignal>{
 if(!record.detectedSource)return{ok:false,version:null,source:null,reason:"No detection source configured"};
 try{
  const response=await fetch(record.detectedSource,{headers:{"user-agent":"CactusByte-Release-Truth/1.0"},cache:"no-store",signal:AbortSignal.timeout(4500)});
  if(!response.ok)return{ok:false,version:null,source:record.detectedSource,reason:`Detection source returned ${response.status}`};
  const version=extractDetectedVersion(await response.text());
  return version?{ok:true,version,source:record.detectedSource}:{ok:false,version:null,source:record.detectedSource,reason:"No version marker detected"};
 }catch(error){return{ok:false,version:null,source:record.detectedSource,reason:error instanceof Error?error.message:"Detection failed"}}
}

type VercelDeployment={uid?:string;id?:string;created?:number;createdAt?:number;meta?:{githubCommitSha?:string}};
type VercelDeploymentsResponse={deployments?:VercelDeployment[]};

export async function fetchVercelProductionSignal(record:ReleaseTruthRecord):Promise<DeploymentSignal>{
 const token=(process.env.VERCEL_ACCESS_TOKEN||"").trim();
 const teamId=(process.env.VERCEL_TEAM_ID||"").trim();
 if(!token||!teamId)return{available:false,id:null,gitSha:null,createdAt:null,reason:"Vercel deployment verification is not configured"};
 try{
  const params=new URLSearchParams({projectId:record.vercelProjectId,target:"production",state:"READY",limit:"1",teamId});
  const response=await fetch(`https://api.vercel.com/v7/deployments?${params}`,{headers:{Authorization:`Bearer ${token}`,Accept:"application/json"},cache:"no-store",signal:AbortSignal.timeout(5000)});
  if(!response.ok)return{available:false,id:null,gitSha:null,createdAt:null,reason:`Vercel API returned ${response.status}`};
  const data=await response.json() as VercelDeploymentsResponse;
  const latest=data.deployments?.[0];
  const id=latest?.uid||latest?.id||null;
  if(!id)return{available:false,id:null,gitSha:null,createdAt:null,reason:"Vercel returned no production deployment"};
  return{available:true,id,gitSha:latest?.meta?.githubCommitSha||null,createdAt:latest?.created??latest?.createdAt??null};
 }catch(error){return{available:false,id:null,gitSha:null,createdAt:null,reason:error instanceof Error?error.message:"Vercel verification failed"}}
}

export function reconcileReleaseTruth(record:ReleaseTruthRecord,detected:DetectedSignal,deployed:DeploymentSignal,now=new Date().toISOString()):ResolvedReleaseTruth{
 const deploymentMatches=deployed.available&&deployed.id===record.recordedDeploymentId&&(!record.recordedGitSha||!deployed.gitSha||deployed.gitSha===record.recordedGitSha);
 const deploymentMismatch=deployed.available&&!deploymentMatches;
 const detectedMatches=detected.ok&&detected.version===record.recordedWebVersion;
 const stagedDetected=detected.ok&&Boolean(record.stagedWebVersion)&&detected.version===record.stagedWebVersion;
 let truthState:TruthState="recorded";
 if(deploymentMismatch)truthState="deployment-mismatch";
 else if(stagedDetected)truthState="staged";
 else if(detected.ok&&!detectedMatches)truthState="mismatch";
 else if(deploymentMatches&&detectedMatches)truthState="verified";
 else if(deploymentMatches&&!detected.ok)truthState="verified";
 return{
  appId:record.appId,
  liveVersion:record.recordedWebVersion,
  recordedVersion:record.recordedWebVersion,
  detectedVersion:detected.version,
  stagedVersion:record.stagedWebVersion||null,
  truthState,
  sourceHealth:record.detectedSource?(detected.ok?"ok":"degraded"):"not-configured",
  deploymentVerification:deployed.available?(deploymentMatches?"verified":"mismatch"):"unavailable",
  deploymentId:record.recordedDeploymentId,
  latestDeploymentId:deployed.id,
  gitSha:deploymentMatches?(deployed.gitSha||record.recordedGitSha||null):(record.recordedGitSha||null),
  checkedAt:now
 };
}

export async function resolveReleaseTruth(record:ReleaseTruthRecord){
 const[detected,deployed]=await Promise.all([fetchDetectedSignal(record),fetchVercelProductionSignal(record)]);
 return reconcileReleaseTruth(record,detected,deployed);
}
