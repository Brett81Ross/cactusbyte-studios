export type ReleaseRecord={appId:string;version:string;channel:"stable"|"beta"|"experimental";title:string;notes:string[];verified:boolean};
export const releases:ReleaseRecord[]=[
{appId:"cactusbyte-studios",version:"v1.4.0",channel:"stable",title:"Full connected command center + storefront",notes:["Restored My CactusByte™ personalization, pin/hide/reorder, category filtering and grid/list layouts","Restored branded QR sharing, install control, Release Center™ and the freemium storefront with live Stripe upgrade paths","Expanded cloud Feedback Hub™, Idea Forge™ voting, CactusByte Pulse™ and app-specific Community Chat channels while preserving Firebase and ByteLink™","Added an automated atomic preflight that checks version consistency, registry integrity, Firebase key hygiene, launch links and Stripe checkout records before production builds"],verified:true},
{appId:"noproblem",version:"v1.0.0",channel:"stable",title:"Current registered release",notes:["Version verified from package.json"],verified:true},
{appId:"acelynn-pro",version:"v1.1.1",channel:"stable",title:"Current registered release",notes:["Version exposed by app source"],verified:true},
{appId:"first-bearing",version:"v2.6.0",channel:"stable",title:"Current registered release",notes:["Production version verified from app metadata"],verified:true},
{appId:"fantasy-matrix",version:"v1.4.5",channel:"stable",title:"Current registered release",notes:["Version sourced from repository VERSION record"],verified:true},
{appId:"scouttrace",version:"v1.1.0",channel:"stable",title:"Current registered release",notes:["PWA manifest exposes the current release version"],verified:true},
{appId:"terraflow-matrix",version:"v1.11.0",channel:"stable",title:"Repository release",notes:["Registry entry verified from TerraFlow repository","Approved Concept 2 sprout + irrigation-orbit branding is now wired into the CactusByte registry","Production link remains pending"],verified:true},
{appId:"orbitgather",version:"v0.3.1",channel:"beta",title:"Lead intelligence beta",notes:["Repository package version verified","Production link remains pending in the CactusByte registry"],verified:true}
];
