import {createHash} from "crypto";
import {FieldValue} from "firebase-admin/firestore";
import {NextRequest,NextResponse} from "next/server";
import {adminDb} from "../../../lib/firebase-admin";

const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME=80;
const MAX_EMAIL=254;
const MAX_INTEREST=80;

function clean(value:unknown,max:number){return String(value??"").trim().replace(/\s+/g," ").slice(0,max)}
function emailKey(email:string){return createHash("sha256").update(email).digest("hex")}

export async function POST(req:NextRequest){
 try{
  const body=await req.json().catch(()=>null) as null|{name?:unknown;email?:unknown;interest?:unknown;consent?:unknown;website?:unknown;source?:unknown};
  if(!body)return NextResponse.json({ok:false,error:"Invalid request."},{status:400});
  if(clean(body.website,200))return NextResponse.json({ok:true,joined:true});

  const name=clean(body.name,MAX_NAME);
  const email=clean(body.email,MAX_EMAIL).toLowerCase();
  const interest=clean(body.interest,MAX_INTEREST)||"CactusByte Studios";
  const source=clean(body.source,80)||"cactusbyte-hub";
  const consent=body.consent===true;

  if(name.length<2)return NextResponse.json({ok:false,error:"Enter your name."},{status:400});
  if(!EMAIL_RE.test(email))return NextResponse.json({ok:false,error:"Enter a valid email address."},{status:400});
  if(!consent)return NextResponse.json({ok:false,error:"Please confirm you want launch updates."},{status:400});

  const ref=adminDb().collection("launchWaitlist").doc(emailKey(email));
  const snap=await ref.get();
  if(snap.exists){
   return NextResponse.json({ok:true,joined:true,alreadyJoined:true,message:"You’re already on the CactusByte waitlist."});
  }

  await ref.create({
   name,
   email,
   interest,
   source,
   status:"waiting",
   consent:true,
   consentText:"CactusByte Studios Google Play launch and early-access updates",
   createdAt:FieldValue.serverTimestamp(),
   updatedAt:FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ok:true,joined:true,alreadyJoined:false,message:"You’re on the list. We’ll let you know when CactusByte hits Google Play."},{status:201});
 }catch(error){
  console.error("waitlist signup failed",error);
  return NextResponse.json({ok:false,error:"Waitlist signup is temporarily unavailable. Please try again."},{status:500});
 }
}
