import {FieldValue} from "firebase-admin/firestore";
import {adminAuth,adminDb} from "../../../../lib/firebase-admin";

export const runtime="nodejs";
export const dynamic="force-dynamic";

function bearer(request:Request){
 const header=request.headers.get("authorization")||"";
 return header.toLowerCase().startsWith("bearer ")?header.slice(7).trim():"";
}

const EVENTS=new Set(["login","register","owner_auto"]);

export async function POST(request:Request){
 const token=bearer(request);
 if(!token)return new Response("Authentication required.",{status:401});
 let identity;
 try{identity=await adminAuth().verifyIdToken(token)}catch{return new Response("Invalid session.",{status:401})}
 let body:{event?:string};
 try{body=await request.json()}catch{body={}}
 const event=EVENTS.has(body.event||"")?String(body.event):"login";
 await adminDb().collection("authEvents").add({
  uid:identity.uid,
  email:identity.email||"",
  event,
  userAgent:(request.headers.get("user-agent")||"").slice(0,180),
  createdAt:FieldValue.serverTimestamp()
 });
 return Response.json({tracked:true},{headers:{"Cache-Control":"no-store"}});
}
