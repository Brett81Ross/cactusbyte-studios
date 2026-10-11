export type AndroidIdentityStatus="LEGACY_ARTIFACT_RECORDED"|"NATIVE_SOURCE_VERIFIED"|"PLAY_IDENTITY_LOCKED";

export type AndroidIdentityRecord={
 appId:string;
 intendedPackageId:string;
 status:AndroidIdentityStatus;
 evidence:string;
};

export const androidIdentityRecords:AndroidIdentityRecord[]=[
 {
  appId:"cactusbyte-studios",
  intendedPackageId:"com.cactusbyte.studios",
  status:"LEGACY_ARTIFACT_RECORDED",
  evidence:"android-latest release contains CactusByte-Studios.apk; current main has no native Android wrapper/package manifest, so package identity remains unverified for migration and Google Play."
 }
];

export function verifiedAndroidPackageId(record:AndroidIdentityRecord){
 return record.status==="NATIVE_SOURCE_VERIFIED"||record.status==="PLAY_IDENTITY_LOCKED"
  ?record.intendedPackageId
  :null;
}
