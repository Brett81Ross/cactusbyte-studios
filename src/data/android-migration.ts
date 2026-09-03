import type {AndroidMigrationState} from "../lib/release-truth";

export type AndroidMigrationEvidence={
 backupVerified:boolean;
 restoreVerified:boolean;
 cutoverReadinessVerified:boolean;
 permanentInstallVerified:boolean;
 playPublished:boolean;
};

export type AndroidMigrationRecord={
 appId:string;
 name:string;
 flavor:string;
 packageId:string;
 evidence:AndroidMigrationEvidence;
};

const none:AndroidMigrationEvidence={backupVerified:false,restoreVerified:false,cutoverReadinessVerified:false,permanentInstallVerified:false,playPublished:false};
const legacy=(appId:string,name:string,flavor:string,packageId:string):AndroidMigrationRecord=>({appId,name,flavor,packageId,evidence:{...none}});

export const androidMigrationRecords:AndroidMigrationRecord[]=[
 legacy("cactusbyte-studios","CactusByte Studios","cactusbyte","com.cactusbyte.studios"),
 legacy("noproblem","No Problem Pressure Washing Matrix","noproblem","com.cactusbyte.noproblem"),
 legacy("machzero","MachZero","machzero","com.cactusbyte.machzero"),
 legacy("rapid-takeoff","Rapid Takeoff","rapidtakeoff","com.cactusbyte.rapidtakeoff"),
 legacy("acelynn-pro","Acelynn Pro","acelynnpro","com.cactusbyte.acelynnpro"),
 legacy("pocketstomp","PocketStomp","pocketstomp","com.cactusbyte.pocketstomp"),
 legacy("ghostlane","GhostLane","ghostlane","com.cactusbyte.ghostlane"),
 legacy("first-bearing","First Bearing","firstbearing","com.cactusbyte.firstbearing"),
 legacy("fantasy-matrix","Fantasy Football Matrix","fantasy","com.cactusbyte.fantasyfootballmatrix"),
 legacy("scouttrace","Acelynn's ScoutTrace","scouttrace","com.cactusbyte.scouttrace"),
 legacy("shadownex-prime","ShadowNex Prime","shadownex","com.cactusbyte.shadownexprime"),
 legacy("terraflow-matrix","TerraFlow Matrix","terraflow","com.cactusbyte.terraflow"),
 legacy("orbitgather","OrbitGather","orbitgather","com.cactusbyte.orbitgather")
];

export function deriveAndroidMigrationState(evidence:AndroidMigrationEvidence):AndroidMigrationState{
 if(evidence.playPublished)return"PLAY_READY";
 if(evidence.permanentInstallVerified)return"PERMANENT";
 if(evidence.cutoverReadinessVerified)return"CUTOVER_READY";
 if(evidence.restoreVerified)return"RESTORE_VERIFIED";
 if(evidence.backupVerified)return"BACKUP_READY";
 return"LEGACY";
}

export function nextAndroidMigrationGate(state:AndroidMigrationState){
 switch(state){
  case"LEGACY":return"BACKUP_READY";
  case"BACKUP_READY":return"RESTORE_VERIFIED";
  case"RESTORE_VERIFIED":return"CUTOVER_READY";
  case"CUTOVER_READY":return"PERMANENT";
  case"PERMANENT":return"PLAY_READY";
  case"PLAY_READY":return null;
 }
}
