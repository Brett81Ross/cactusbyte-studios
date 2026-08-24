import {addDocument,getSession,patchDocument,runQuery}from"./firebase-rest";import type{ByteLinkEnvelope}from"./bytelink";
export type StoredByteLinkMessage={id:string;senderUserId:string;sourceApp:string;destinationApp:string;contentType:string;payload:unknown;protocolVersion:string;status:"queued"|"delivered"|"consumed"|"rejected";createdAt?:unknown;consumedAt?:unknown};
function uid(){const s=getSession();if(!s)throw new Error("CactusByte ID™ is required for ByteLink™.");return s.uid}
export async function enqueueByteLink(e:ByteLinkEnvelope){return addDocument("byteLinkMessages",{senderUserId:uid(),sourceApp:e.sourceApp,destinationApp:e.destinationApp,contentType:e.contentType,payload:e.payload,protocolVersion:e.protocolVersion,status:"queued"})}
export async function myByteLinkOutbox():Promise<StoredByteLinkMessage[]>{return runQuery("byteLinkMessages","senderUserId",uid(),"createdAt") as Promise<StoredByteLinkMessage[]>}
export async function destinationInbox(destinationApp:string):Promise<StoredByteLinkMessage[]>{uid();return runQuery("byteLinkMessages","destinationApp",destinationApp,"createdAt") as Promise<StoredByteLinkMessage[]>}
export async function markConsumed(id:string){uid();return patchDocument("byteLinkMessages",id,{status:"consumed",consumedAt:new Date().toISOString()})}
