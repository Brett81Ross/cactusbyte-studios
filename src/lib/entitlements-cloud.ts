import {getSession,runQuery} from "./firebase-rest";

export type EntitlementRecord={
 id?:string;
 userId:string;
 appId:string;
 status?:string;
 active?:boolean;
 source?:string;
 plan?:string;
 expiresAt?:string|null;
 createdAt?:string;
 updatedAt?:string;
};

const ACTIVE_STATUSES=new Set(["active","trialing","granted","lifetime"]);

export function entitlementIsActive(record:EntitlementRecord){
 if(record.active===false)return false;
 const status=(record.status||"").trim().toLowerCase();
 const active=record.active===true||ACTIVE_STATUSES.has(status);
 if(!active)return false;
 if(record.expiresAt){
  const expiry=Date.parse(record.expiresAt);
  if(Number.isFinite(expiry)&&expiry<=Date.now())return false;
 }
 return true;
}

export async function myEntitlements():Promise<EntitlementRecord[]>{
 const session=getSession();
 if(!session)return[];
 const rows=await runQuery("entitlements","userId",session.uid);
 return rows as EntitlementRecord[];
}
