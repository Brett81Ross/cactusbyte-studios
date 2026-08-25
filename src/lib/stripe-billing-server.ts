import {createHmac,timingSafeEqual}from"crypto";
import {FIREBASE_API_KEY}from"./firebase";

export const STRIPE_PRICE_TO_APP:Record<string,string>={
  "price_1U7f9vPXpATFEF8kOfDVluoX":"rapid-takeoff",
  "price_1U7f9oPXpATFEF8ksIpDgGZn":"noproblem",
  "price_1U7fA0PXpATFEF8kebmd3av0":"machzero",
  "price_1U7fA4PXpATFEF8ksA60WCpO":"scouttrace",
  "price_1U7eGpPXpATFEF8ka8vR1vKa":"ghostlane",
  "price_1U7fA8PXpATFEF8k5LY8qFTl":"acelynn-pro",
  "price_1U7fADPXpATFEF8khw9BbUzS":"pocketstomp"
};
export const APP_TO_STRIPE_PRICE=Object.fromEntries(Object.entries(STRIPE_PRICE_TO_APP).map(([price,app])=>[app,price])) as Record<string,string>;

function stripeSecret(){const v=process.env.STRIPE_SECRET_KEY;if(!v)throw new Error("STRIPE_SECRET_KEY is not configured.");return v}
export function webhookSecret(){const v=process.env.STRIPE_WEBHOOK_SECRET;if(!v)throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");return v}

export async function verifyFirebaseIdToken(idToken:string){const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken}),cache:"no-store"});const j=await r.json();if(!r.ok||!j.users?.[0])throw new Error("Invalid CactusByte ID session.");return{uid:String(j.users[0].localId),email:String(j.users[0].email||"")}}

export async function createSubscriptionCheckout(input:{appId:string;userId:string;email:string;origin:string}){const price=APP_TO_STRIPE_PRICE[input.appId];if(!price)throw new Error("No live Stripe price is mapped for this app.");const body=new URLSearchParams();body.set("mode","subscription");body.set("line_items[0][price]",price);body.set("line_items[0][quantity]","1");body.set("success_url",`${input.origin}/billing?checkout=success`);body.set("cancel_url",`${input.origin}/billing?checkout=canceled`);body.set("client_reference_id",input.userId);body.set("customer_email",input.email);body.set("metadata[cactusbyte_user_id]",input.userId);body.set("metadata[cactusbyte_app_id]",input.appId);body.set("subscription_data[metadata][cactusbyte_user_id]",input.userId);body.set("subscription_data[metadata][cactusbyte_app_id]",input.appId);const r=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:`Bearer ${stripeSecret()}`,"Content-Type":"application/x-www-form-urlencoded"},body,cache:"no-store"});const j=await r.json();if(!r.ok)throw new Error(j?.error?.message||"Unable to create Stripe Checkout session.");return j as{url:string;id:string}}

export function verifyStripeSignature(payload:string,header:string){const parts=Object.fromEntries(header.split(",").map(x=>x.split("=") as[string,string]));const t=parts.t,v1=parts.v1;if(!t||!v1)return false;const expected=createHmac("sha256",webhookSecret()).update(`${t}.${payload}`,"utf8").digest("hex");try{return timingSafeEqual(Buffer.from(expected,"hex"),Buffer.from(v1,"hex"))}catch{return false}}

export async function stripeGet(path:string){const r=await fetch(`https://api.stripe.com/v1/${path}`,{headers:{Authorization:`Bearer ${stripeSecret()}`},cache:"no-store"});const j=await r.json();if(!r.ok)throw new Error(j?.error?.message||"Stripe API read failed.");return j}
