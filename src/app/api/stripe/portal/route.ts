import {adminAuth,adminDb} from "../../../../lib/firebase-admin";
import {stripeServer} from "../../../../lib/stripe-server";

export const runtime="nodejs";
export const dynamic="force-dynamic";

function bearer(request:Request){
 const header=request.headers.get("authorization")||"";
 return header.toLowerCase().startsWith("bearer ")?header.slice(7).trim():"";
}

function returnUrl(request:Request){
 const configured=(process.env.NEXT_PUBLIC_SITE_URL||process.env.VERCEL_PROJECT_PRODUCTION_URL||process.env.VERCEL_URL||"").trim();
 if(configured){
  const value=configured.startsWith("http://")||configured.startsWith("https://")?configured:`https://${configured}`;
  return new URL("/",value).toString();
 }
 return new URL("/",request.url).toString();
}

async function customerFor(uid:string,appId?:string){
 const db=adminDb();
 if(appId){
  const doc=await db.collection("entitlements").doc(`${uid}__${appId}`).get();
  const data=doc.data();
  if(data?.userId===uid&&typeof data.stripeCustomerId==="string"&&data.stripeCustomerId.startsWith("cus_"))return data.stripeCustomerId;
 }
 const snap=await db.collection("entitlements").where("userId","==",uid).limit(50).get();
 for(const doc of snap.docs){
  const customer=doc.data().stripeCustomerId;
  if(typeof customer==="string"&&customer.startsWith("cus_"))return customer;
 }
 return"";
}

async function portalConfiguration(){
 const configured=(process.env.STRIPE_PORTAL_CONFIGURATION_ID||"").trim();
 if(configured)return configured;
 const stripe=stripeServer();
 const existing=await stripe.billingPortal.configurations.list({active:true,limit:20});
 const found=existing.data.find(x=>x.business_profile?.headline==="CactusByte Subscription Manager");
 if(found)return found.id;
 const created=await stripe.billingPortal.configurations.create({
  business_profile:{headline:"CactusByte Subscription Manager"},
  features:{
   customer_update:{enabled:true,allowed_updates:["email"]},
   invoice_history:{enabled:true},
   payment_method_update:{enabled:true},
   subscription_cancel:{enabled:true,mode:"at_period_end"}
  }
 } as any);
 return created.id;
}

export async function POST(request:Request){
 const token=bearer(request);
 if(!token)return new Response("Sign in with CactusByte ID™ first.",{status:401});
 let identity;
 try{identity=await adminAuth().verifyIdToken(token)}catch{return new Response("Invalid CactusByte ID session.",{status:401})}
 let body:{appId?:string};
 try{body=await request.json()}catch{body={}}
 const customer=await customerFor(identity.uid,body.appId);
 if(!customer)return new Response("No Stripe subscription is linked to this CactusByte ID yet.",{status:404});
 const stripe=stripeServer();
 const configuration=await portalConfiguration();
 const session=await stripe.billingPortal.sessions.create({customer,configuration,return_url:returnUrl(request)});
 return Response.json({url:session.url},{headers:{"Cache-Control":"no-store"}});
}
