export const BYTELINK_PROTOCOL_VERSION = "1.0-development";
export type ByteLinkEnvelope<T=unknown> = {
  protocol:"ByteLink"; protocolVersion:string; messageId:string; sourceApp:string; destinationApp:string;
  contentType:string; permissions:string[]; timestamp:string; payload:T;
};
export function createByteLinkEnvelope<T>(input:{sourceApp:string;destinationApp:string;contentType:string;permissions:string[];payload:T}):ByteLinkEnvelope<T>{
  return {protocol:"ByteLink",protocolVersion:BYTELINK_PROTOCOL_VERSION,messageId:globalThis.crypto?.randomUUID?.()??`bl-${Date.now()}`,timestamp:new Date().toISOString(),...input};
}
