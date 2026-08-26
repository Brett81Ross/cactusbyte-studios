import {Timestamp,type QueryDocumentSnapshot} from "firebase-admin/firestore";
import {adminAuth,adminDb} from "../../../../lib/firebase-admin";
import {ownerIdentity} from "../../../../lib/owner-access";

export const runtime="nodejs";
export const dynamic="force-dynamic";

async function authUserSummary(){
 let pageToken:string|undefined;
 let totalUsers=0,newUsers7d=0,disabledUsers=0;
 const cutoff=Date.now()-7*24*60*60*1000;
 do{
  const page=await adminAuth().listUsers(1000,pageToken);
  totalUsers+=page.users.length;
  for(const user of page.users){
   if(user.disabled)disabledUsers++;
   const created=Date.parse(user.metadata.creationTime||"");
   if(Number.isFinite(created)&&created>=cutoff)newUsers7d++;
  }
  pageToken=page.pageToken;
 }while(pageToken);
 return{totalUsers,newUsers7d,disabledUsers};
}

function eventType(doc:QueryDocumentSnapshot){return String(doc.data().event||"login")}
function isUserAuth(doc:QueryDocumentSnapshot){const event=eventType(doc);return event==="login"||event==="register"}
function isOwnerRestore(doc:QueryDocumentSnapshot){return eventType(doc)==="owner_auto"}

export async function GET(request:Request){
 const owner=await ownerIdentity(request);
 if(!owner)return new Response("Owner access required.",{status:403});
 const db=adminDb();
 const now=Date.now();
 const cutoff24=Timestamp.fromMillis(now-24*60*60*1000);
 const cutoff7=Timestamp.fromMillis(now-7*24*60*60*1000);
 const [users,activeEntitlements,events24,events7,recent]=await Promise.all([
  authUserSummary(),
  db.collection("entitlements").where("active","==",true).get(),
  db.collection("authEvents").where("createdAt",">=",cutoff24).get(),
  db.collection("authEvents").where("createdAt",">=",cutoff7).get(),
  db.collection("authEvents").orderBy("createdAt","desc").limit(60).get()
 ]);
 const proUsers=new Set(activeEntitlements.docs.map(doc=>String(doc.data().userId||"")).filter(Boolean));
 const recentSignIns=recent.docs.filter(isUserAuth).slice(0,15).map(doc=>{
  const data=doc.data();
  const createdAt=data.createdAt?.toDate?.();
  return{email:String(data.email||""),event:String(data.event||"login"),createdAt:createdAt instanceof Date?createdAt.toISOString():null};
 });
 return Response.json({
  ownerSource:owner.source,
  registeredUsers:users.totalUsers,
  newUsers7d:users.newUsers7d,
  disabledUsers:users.disabledUsers,
  signIns24h:events24.docs.filter(isUserAuth).length,
  signIns7d:events7.docs.filter(isUserAuth).length,
  ownerRestores24h:events24.docs.filter(isOwnerRestore).length,
  ownerRestores7d:events7.docs.filter(isOwnerRestore).length,
  activeProUsers:proUsers.size,
  activeProEntitlements:activeEntitlements.size,
  recentSignIns
 },{headers:{"Cache-Control":"no-store"}});
}
