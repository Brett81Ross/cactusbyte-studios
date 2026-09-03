const RELEASE_BASE="https://github.com/Brett81Ross/cactusbyte-studios/releases/download/android-latest";

export type NativeDistribution={
 appId:string;
 packageId:string;
 legacyDirectUrl:string;
 playUrl:string|null;
 nativeRequiredFor?:string;
 channelState:"legacy-public"|"cutover-ready"|"permanent-public";
};

export const nativeDistributions:NativeDistribution[]=[
 {appId:"cactusbyte-studios",packageId:"com.cactusbyte.studios",legacyDirectUrl:`${RELEASE_BASE}/CactusByte-Studios.apk`,playUrl:null,channelState:"legacy-public"},
 {appId:"noproblem",packageId:"com.cactusbyte.noproblem",legacyDirectUrl:`${RELEASE_BASE}/No-Problem-Pressure-Washing-Matrix.apk`,playUrl:null,channelState:"legacy-public"},
 {appId:"machzero",packageId:"com.cactusbyte.machzero",legacyDirectUrl:`${RELEASE_BASE}/MachZero.apk`,playUrl:null,channelState:"legacy-public"},
 {appId:"rapid-takeoff",packageId:"com.cactusbyte.rapidtakeoff",legacyDirectUrl:`${RELEASE_BASE}/Rapid-Takeoff.apk`,playUrl:null,channelState:"legacy-public"},
 {appId:"acelynn-pro",packageId:"com.cactusbyte.acelynnpro",legacyDirectUrl:`${RELEASE_BASE}/Acelynn-Pro.apk`,playUrl:null,channelState:"legacy-public"},
 {appId:"pocketstomp",packageId:"com.cactusbyte.pocketstomp",legacyDirectUrl:`${RELEASE_BASE}/PocketStomp.apk`,playUrl:null,channelState:"legacy-public"},
 {appId:"ghostlane",packageId:"com.cactusbyte.ghostlane",legacyDirectUrl:`${RELEASE_BASE}/GhostLane.apk`,playUrl:null,channelState:"legacy-public"},
 {appId:"first-bearing",packageId:"com.cactusbyte.firstbearing",legacyDirectUrl:`${RELEASE_BASE}/First-Bearing.apk`,playUrl:null,channelState:"legacy-public"},
 {appId:"fantasy-matrix",packageId:"com.cactusbyte.fantasyfootballmatrix",legacyDirectUrl:`${RELEASE_BASE}/Fantasy-Football-Matrix.apk`,playUrl:null,channelState:"legacy-public"},
 {appId:"scouttrace",packageId:"com.cactusbyte.scouttrace",legacyDirectUrl:`${RELEASE_BASE}/Acelynn-ScoutTrace.apk`,playUrl:null,nativeRequiredFor:"full Android device-security scanning",channelState:"legacy-public"},
 {appId:"shadownex-prime",packageId:"com.cactusbyte.shadownexprime",legacyDirectUrl:`${RELEASE_BASE}/ShadowNex-Prime.apk`,playUrl:null,channelState:"legacy-public"},
 {appId:"terraflow-matrix",packageId:"com.cactusbyte.terraflow",legacyDirectUrl:`${RELEASE_BASE}/TerraFlow-Matrix.apk`,playUrl:null,channelState:"legacy-public"},
 {appId:"orbitgather",packageId:"com.cactusbyte.orbitgather",legacyDirectUrl:`${RELEASE_BASE}/OrbitGather.apk`,playUrl:null,channelState:"legacy-public"}
];

export const nativeDistributionByApp=new Map(nativeDistributions.map(item=>[item.appId,item] as const));
