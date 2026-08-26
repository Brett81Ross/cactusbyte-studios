import {FieldValue} from "firebase-admin/firestore";
import type Stripe from "stripe";
import {adminDb} from "../../../../lib/firebase-admin";
import {stripeServer} from "../../../../lib/stripe-server";
import {verifyCheckoutReference} from "../../../../lib/stripe-checkout-ref";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const APP_ALIASES:Record<string,string>={
 "no problem pressure washing matrix":"noproblem",noproblem:"noproblem",
 machzero:"machzero","rapid takeoff":"rapid-takeoff","rapid-takeoff":"rapid-takeoff",
 "acelynn pro":"acelynn-pro","acelynn-pro":"acelynn-pro",pocketstomp:"pocketstomp",
 ghostlane:"ghostlane","acelynn's scouttrace":"scouttrace","acelynn’s scouttrace":"scouttrace",scouttrace:"scouttrace"
};

function appIdFromMetadata(metadata:Stripe.Metadata|null|undefined){
 const raw=(metadata?.cactusbyte_app||metadata?.app||"").trim();
 if(!raw)return"";
 const key=raw.toLowerCase().replace(/™/g,"").trim();
 return APP_ALIASES[key]||key;
}

function subscriptionId(value:Stripe.Checkout.Session["subscription"]){
 if(!value)return"";
 return typeof value==="string"?value:value.id;
}

function customerId(value:Stripe.Checkout.Session["customer"]){
 if(!value)return"";
 return typeof value==="string"?value:value.id;
}

function expiryIso(subscription:Stripe.Subscription){
 const epoch=(subscription as Stripe.Subscription&{current_period_end?:number}).current_period_end;
 return typeof epoch==="number"?new Date(epoch*1000).toISOString():null;
}

function activeSubscriptionStatus(status:string){
 return status==="active"||status==="trialing";
}

async function provisionFromCheckout(session:Stripe.Checkout.Session){
 const reference=verifyCheckoutReference(session.client_reference_id||"");
 const appId=appIdFromMetadata(session.metadata);
 const subId=subscriptionId(session.subscription);
 if(!reference||!appId||reference.appId!==appId||!subId)return;
 const stripe=stripeServer();
 const subscription=await stripe.subscriptions.retrieve(subId);
 if(!activeSubscriptionStatus(subscription.status))return;
 const uid=reference.uid;
 const docId=`${uid}__${appId}`;
 await adminDb().collection("entitlements").doc(docId).set({
  userId:uid,
  appId,
  plan:session.metadata?.plan||subscription.metadata.plan||"pro",
  source:"stripe",
  status:subscription.status,
  active:true,
  stripeCustomerId:customerId(session.customer)||String(subscription.customer||""),
  stripeSubscriptionId:subscription.id,
  stripeCheckoutSessionId:session.id,
  expiresAt:expiryIso(subscription),
  updatedAt:FieldValue.serverTimestamp(),
  createdAt:FieldValue.serverTimestamp()
 },{merge:true});
}

async function updateSubscription(subscription:Stripe.Subscription,deleted=false){
 const snapshot=await adminDb().collection("entitlements").where("stripeSubscriptionId","==",subscription.id).get();
 if(snapshot.empty)return;
 const active=!deleted&&activeSubscriptionStatus(subscription.status);
 const batch=adminDb().batch();
 for(const doc of snapshot.docs)batch.set(doc.ref,{
  status:deleted?"canceled":subscription.status,
  active,
  expiresAt:expiryIso(subscription),
  updatedAt:FieldValue.serverTimestamp()
 },{merge:true});
 await batch.commit();
}

export async function POST(request:Request){
 const secret=(process.env.STRIPE_WEBHOOK_SECRET||"").trim();
 if(!secret)return new Response("Stripe webhook secret is not configured.",{status:503});
 const signature=request.headers.get("stripe-signature");
 if(!signature)return new Response("Missing Stripe signature.",{status:400});
 const body=await request.text();
 let event:Stripe.Event;
 try{event=stripeServer().webhooks.constructEvent(body,signature,secret)}catch{return new Response("Invalid Stripe signature.",{status:400})}
 try{
  if(event.type==="checkout.session.completed"||event.type==="checkout.session.async_payment_succeeded")await provisionFromCheckout(event.data.object as Stripe.Checkout.Session);
  else if(event.type==="customer.subscription.updated")await updateSubscription(event.data.object as Stripe.Subscription);
  else if(event.type==="customer.subscription.deleted")await updateSubscription(event.data.object as Stripe.Subscription,true);
  return Response.json({received:true});
 }catch(error){
  console.error("Stripe entitlement provisioning failed",error);
  return new Response("Webhook processing failed.",{status:500});
 }
}
