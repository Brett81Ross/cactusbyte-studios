import {getSession,runQuery}from"./firebase-rest";
export type EntitlementRecord={id?:string;userId:string;appId:string;plan?:string|null;status?:string|null;source?:string|null;expiresAt?:unknown;createdAt?:unknown};
export async function myEntitlements():Promise<EntitlementRecord[]>{const s=getSession();if(!s)throw new Error("Sign in with CactusByte ID™ first.");return runQuery("entitlements","userId",s.uid,"createdAt") as Promise<EntitlementRecord[]>}
export function entitlementFor(appId:string,rows:EntitlementRecord[]){return rows.find(x=>x.appId===appId&&!["expired","revoked","canceled"].includes(String(x.status||"").toLowerCase()))||null}
