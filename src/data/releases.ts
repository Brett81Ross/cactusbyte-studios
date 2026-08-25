export type ReleaseRecord={appId:string;version:string;channel:"stable"|"beta"|"experimental";title:string;notes:string[];verified:boolean};
export const releases:ReleaseRecord[]=[
{appId:"cactusbyte-studios",version:"v1.4.0",channel:"stable",title:"Full connected command center",notes:["Restored My CactusByte™ personalization, pin/hide/reorder and grid/list layouts","Restored branded QR sharing and Release Center™","Expanded cloud Feedback Hub™, Idea Forge™ voting and CactusByte Pulse™ while preserving Firebase, Community Chat and ByteLink™"],verified:true},
{appId:"noproblem",version:"v1.0.0",channel:"stable",title:"Current registered release",notes:["Version verified from package.json"],verified:true},
{appId:"acelynn-pro",version:"v1.1.1",channel:"stable",title:"Current registered release",notes:["Version exposed by app source"],verified:true},
{appId:"first-bearing",version:"v2.6.0",channel:"stable",title:"Current registered release",notes:["Production version verified from app metadata"],verified:true},
{appId:"fantasy-matrix",version:"v1.4.5",channel:"stable",title:"Current registered release",notes:["Version sourced from repository VERSION record"],verified:true},
{appId:"scouttrace",version:"v1.1.0",channel:"stable",title:"Current registered release",notes:["PWA manifest exposes the current release version"],verified:true},
{appId:"terraflow-matrix",version:"v1.11.0",channel:"stable",title:"Repository release",notes:["Registry entry verified from TerraFlow repository","Production link and permanent app icon remain pending"],verified:true},
{appId:"orbitgather",version:"v0.3.1",channel:"beta",title:"Lead intelligence beta",notes:["Repository package version verified","Production link remains pending in the CactusByte registry"],verified:true}
];
