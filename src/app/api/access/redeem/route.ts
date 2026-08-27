import {createHash,timingSafeEqual}from"crypto";
import {NextRequest,NextResponse}from"next/server";
import {FIREBASE_API_KEY}from"../../../../lib/firebase";
import {writeEntitlement}from"../../../../lib/firestore-admin-rest";
export const dynamic="force-dynamic";
const CODE_HASH="e417fa10302ba65f2f9496df859ccd0f759e77f776b828ca8579984b0e2695aa";
function validCode(code:string){const a=Buffer.from(createHash("sha256").update(code.trim().toUpperCase()).digest("hex")),b=Buffer.from(CODE_HASH);return a.length===b.length&&timingSafeEqual(a,b)}
async function firebaseUser(idToken:string){const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken}),cache:"no-store"});const j=await r.json();if(!r.ok||!j?.users?.[0]?.localId)throw new Error("Your CactusByte ID™ session is invalid or expired. Sign in again.");return j.users[0]}
export async function POST(req:NextRequest){try{const auth=req.headers.get("authorization")||"",token=auth.startsWith("Bearer ")?auth.slice(7):"";if(!token)return NextResponse.json({error:"Sign in with CactusByte ID™ first."},{status:401});const user=await firebaseUser(token),body=await req.json(),code=String(body?.code||"");if(!validCode(code))return NextResponse.json({error:"That All-Access code is not valid."},{status:400});await writeEntitlement({userId:user.localId,appId:"*",plan:"CactusByte All Access Pro",status:"active",source:"CactusByte ID All-Access Code",sourceEvent:"all_access_code_redeemed"});return NextResponse.json({ok:true,message:"CactusByte All Access Pro is active for this CactusByte ID™."})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to redeem code."},{status:500})}}
