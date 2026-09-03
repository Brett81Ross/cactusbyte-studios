export type AndroidSigningState="legacy"|"backup-ready"|"restore-verified"|"cutover-ready"|"permanent";
export type AndroidPlayState="not-started"|"preparing"|"testing"|"published";
export type IosState="not-started"|"planned"|"testing"|"published";

export type ReleaseTruthRecord={
 appId:string;
 recordedWebVersion:string;
 stagedWebVersion?:string;
 productionDomain:string;
 vercelProjectId:string;
 recordedDeploymentId:string;
 recordedGitSha?:string;
 detectedSource?:string;
 verifiedAt:string;
 androidDirectVersion:string|null;
 androidDirectArtifact:string|null;
 androidSigningState:AndroidSigningState;
 androidPlayState:AndroidPlayState;
 iosState:IosState;
};

const base={androidDirectVersion:null,androidDirectArtifact:null,androidSigningState:"legacy" as const,androidPlayState:"not-started" as const,iosState:"planned" as const};

export const releaseTruthRecords:ReleaseTruthRecord[]=[
 {...base,appId:"cactusbyte-studios",recordedWebVersion:"v1.5.0",stagedWebVersion:"v1.6.0",productionDomain:"cactusbyte-studios.vercel.app",vercelProjectId:"prj_HpdpOFIx1cmEBH9EtoRGOSO4mu6t",recordedDeploymentId:"dpl_C5sknfxyQJo7vyckwPBZgTDnHg9M",recordedGitSha:"b67f0373203b1fa350d559f28d37dbc232d44029",detectedSource:"https://raw.githubusercontent.com/Brett81Ross/cactusbyte-studios/main/package.json",verifiedAt:"2026-09-03T16:33:14Z"},
 {...base,appId:"noproblem",recordedWebVersion:"v1.0.0",productionDomain:"noproblem-pws.vercel.app",vercelProjectId:"prj_YrxY2uClOcRRosWRM9XxsnLQL6ub",recordedDeploymentId:"dpl_5YpdwumeHjePxJhkFry5FqJbbdoa",detectedSource:"https://raw.githubusercontent.com/Brett81Ross/noproblem.pws/main/package.json",verifiedAt:"2026-08-29T00:00:00Z"},
 {...base,appId:"machzero",recordedWebVersion:"v1.4.1",productionDomain:"machzero-beta.vercel.app",vercelProjectId:"prj_XYq0gcllIPIhTXmKt60NHLBtZAdI",recordedDeploymentId:"dpl_5t8AKxs6k63T9mGHZEAPiZTBLsaP",detectedSource:"https://raw.githubusercontent.com/Brett81Ross/machzero/main/package.json",verifiedAt:"2026-08-29T00:00:00Z"},
 {...base,appId:"rapid-takeoff",recordedWebVersion:"v0.3.0",productionDomain:"blueprint-estimator.vercel.app",vercelProjectId:"prj_36uPer0iEWynE2MGOoUt9GXjbKTI",recordedDeploymentId:"dpl_9W2ZV2dzc5kRLivsQruRgAR4TyqC",detectedSource:"https://raw.githubusercontent.com/Brett81Ross/blueprint_estimator-/main/package.json",verifiedAt:"2026-08-29T00:00:00Z"},
 {...base,appId:"acelynn-pro",recordedWebVersion:"v1.2.0",stagedWebVersion:"v1.3.0",productionDomain:"acelynn.vercel.app",vercelProjectId:"prj_Xn9y0IBYD98SwznWT6PSQD5b5dUd",recordedDeploymentId:"dpl_7LUbYit3LkdPYBPdoLM7eMyCYUwj",recordedGitSha:"a055b68f09d1f3b0287d388543d2d6607a124312",detectedSource:"https://acelynn.vercel.app/",verifiedAt:"2026-09-03T15:44:00Z"},
 {...base,appId:"pocketstomp",recordedWebVersion:"v1.0.0",productionDomain:"pocketstomp-v2-brett81ross.vercel.app",vercelProjectId:"prj_E7VyXL58dv6XUC8vr738yrsngYqz",recordedDeploymentId:"dpl_9RozD8FT12vvssxbDeVG3AayDyEg",detectedSource:"https://pocketstomp-v2-brett81ross.vercel.app/",verifiedAt:"2026-08-29T00:00:00Z"},
 {...base,appId:"ghostlane",recordedWebVersion:"v1.7.4",productionDomain:"ghostlane-app.vercel.app",vercelProjectId:"prj_YmD5ihaDktgcauPwiHDyaXG9uAMO",recordedDeploymentId:"dpl_5BZVwAY5cYQPaxqGGSbCyRygABpE",detectedSource:"https://raw.githubusercontent.com/Brett81Ross/ghostlane-app/main/radar.html",verifiedAt:"2026-08-29T00:00:00Z"},
 {...base,appId:"first-bearing",recordedWebVersion:"v2.6.1",productionDomain:"first-bearing.vercel.app",vercelProjectId:"prj_LAp9YJUB04iMF6P6vP3wOeS8iEKV",recordedDeploymentId:"dpl_9HMRp4qv23LFLhTqvVcsXZCeZaiF",detectedSource:"https://first-bearing.vercel.app/",verifiedAt:"2026-08-29T00:00:00Z"},
 {...base,appId:"fantasy-matrix",recordedWebVersion:"v1.5.5",productionDomain:"fantasy-football-selector-matrix.vercel.app",vercelProjectId:"prj_OXIpOmCRdWVX6Tj1HJP9Ym7g9f89",recordedDeploymentId:"dpl_6NR9LmgNvA8xvsvmKj92oG4XnMqn",recordedGitSha:"f628d913c50a1f8fc8365762c2e32da642bba637",detectedSource:"https://raw.githubusercontent.com/Brett81Ross/fantasy-football-selector-matrix/main/VERSION",verifiedAt:"2026-09-03T17:05:00Z"},
 {...base,appId:"scouttrace",recordedWebVersion:"v1.2.1",productionDomain:"acelynn-scoutrace.vercel.app",vercelProjectId:"prj_im9qCXNv6reH73A8BDRHJcicfdua",recordedDeploymentId:"dpl_BYVPu6i8Xrbcts697rRCc1Mfpp7Q",detectedSource:"https://raw.githubusercontent.com/Brett81Ross/acelynn_scoutrace/main/manifest.webmanifest",verifiedAt:"2026-08-29T00:00:00Z"},
 {...base,appId:"shadownex-prime",recordedWebVersion:"v2.2.0",productionDomain:"shadownex-prime.vercel.app",vercelProjectId:"prj_9HhZynvdeJY9iqYsdO9Zm8cWWlTm",recordedDeploymentId:"dpl_DEn8svsz4WxeXpp5Pqz2i12JinnC",detectedSource:"https://raw.githubusercontent.com/Brett81Ross/shadownex-prime/main/package.json",verifiedAt:"2026-08-29T00:00:00Z"},
 {...base,appId:"terraflow-matrix",recordedWebVersion:"v1.7.0",stagedWebVersion:"v1.15.0",productionDomain:"terraflow-matrix.vercel.app",vercelProjectId:"prj_AdKMkeJhPwR6FEzEKvlnZ7oGbyAC",recordedDeploymentId:"dpl_784aR3rSMoze7BMFuweYc5fDE6AR",recordedGitSha:"6b00b427114c79be49ae46a8357e19c9f81474c1",detectedSource:"https://raw.githubusercontent.com/Brett81Ross/terraflow-matrix/main/cloud-release.js",verifiedAt:"2026-09-03T17:05:00Z"},
 {...base,appId:"orbitgather",recordedWebVersion:"v0.5.0",productionDomain:"orbitgather-wahh.vercel.app",vercelProjectId:"prj_OhecwVhm41xwopegc6aNyxEAi6sw",recordedDeploymentId:"dpl_7EWSQfWGDyJAGs2hJanjwC7LCt8E",detectedSource:"https://raw.githubusercontent.com/Brett81Ross/orbitgather/main/package.json",verifiedAt:"2026-08-29T00:00:00Z"}
];

export const releaseTruthByApp=new Map(releaseTruthRecords.map(record=>[record.appId,record] as const));
