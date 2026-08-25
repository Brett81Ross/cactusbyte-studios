import Stripe from "stripe";

let instance:Stripe|null=null;
export function stripeServer(){
 if(instance)return instance;
 const key=(process.env.STRIPE_SECRET_KEY||"").trim();
 if(!key)throw new Error("Stripe secret key is not configured.");
 instance=new Stripe(key);
 return instance;
}
