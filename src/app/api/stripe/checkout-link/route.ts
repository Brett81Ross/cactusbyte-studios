import {adminAuth} from "../../../../lib/firebase-admin";
import {createCheckoutReference} from "../../../../lib/stripe-checkout-ref";
import {studioApps} from "../../../../data/apps";

export const runtime="nodejs";
export const dynamic="force-dynamic";

function bearer(request:Request){
 const header=request.headers.get("authorization")||"";
 return header.toLowerCase().startsWith("bearer ")?header.slice(7).trim():"";
}

export async function POST(request:Request){
 const token=bearer(request);
 if(!token)return new Response("Sign in with CactusByte ID™ first.",{status:401});
 let identity;
 try{identity=await adminAuth().verifyIdToken(token)}catch{return new Response("Invalid CactusByte ID session.",{status:401})}
 let body:{appId?:string};
 try{body=await request.json()}catch{return new Response("Invalid checkout request.",{status:400})}
 const app=studioApps.find(x=>x.id===body.appId);
 const checkoutUrl=app?.monetization?.checkoutUrl;
 if(!app||!checkoutUrl)return new Response("This app does not have a CactusByte Pro checkout.",{status:404});
 const reference=createCheckoutReference(identity.uid,app.id);
 const url=new URL(checkoutUrl);
 url.searchParams.set("client_reference_id",reference);
 if(identity.email)url.searchParams.set("prefilled_email",identity.email);
 return Response.json({url:url.toString(),appId:app.id},{headers:{"Cache-Control":"no-store"}});
}
