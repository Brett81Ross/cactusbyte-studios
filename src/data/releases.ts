export type ReleaseRecord={appId:string;version:string;channel:"stable"|"beta"|"experimental";title:string;notes:string[];verified:boolean};
export const releases:ReleaseRecord[]=[
{appId:"cactusbyte-studios",version:"v1.3.0",channel:"stable",title:"Connected CactusByte foundation",notes:["CactusByte ID™ with Firebase Authentication","Persistent Feedback Hub™ and Idea Forge™","Firestore-backed Community Chat™","Persistent ByteLink™ transport queue","Owner Console gated by Firestore role"],verified:true},
{appId:"noproblem",version:"v1.0.0",channel:"stable",title:"Current registered release",notes:["Version verified from package.json"],verified:true},
{appId:"acelynn-pro",version:"v1.1.1",channel:"stable",title:"Current registered release",notes:["Version exposed by app source"],verified:true},
{appId:"first-bearing",version:"v2.6.0",channel:"stable",title:"Current registered release",notes:["Production version verified from app metadata"],verified:true},
{appId:"fantasy-matrix",version:"v1.4.5",channel:"stable",title:"Current registered release",notes:["Version sourced from repository VERSION record"],verified:true},
{appId:"scouttrace",version:"v1.1.0",channel:"stable",title:"Current registered release",notes:["PWA manifest exposes the current release version"],verified:true}
];
