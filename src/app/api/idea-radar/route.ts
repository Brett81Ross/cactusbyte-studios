import {FieldValue} from "firebase-admin/firestore";
import {studioApps} from "../../../data/apps";
import {adminDb} from "../../../lib/firebase-admin";
import {ownerIdentity} from "../../../lib/owner-access";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=60;

type Source={title:string;url:string};
type RadarIdea={title:string;problem:string;audience:string;details:string;sources:Source[]};
type ResponseOutput={type?:string;content?:Array<{type?:string;text?:string;annotations?:Array<{type?:string;url?:string;title?:string}>}>};
type OpenAIResponse={output?:ResponseOutput[];error?:{message?:string}};

const IDEA_SCHEMA={
 type:"object",
 additionalProperties:false,
 properties:{ideas:{type:"array",minItems:3,maxItems:3,items:{
  type:"object",
  additionalProperties:false,
  properties:{
   title:{type:"string",minLength:4,maxLength:80},
   problem:{type:"string",minLength:20,maxLength:320},
   audience:{type:"string",minLength:3,maxLength:160},
   details:{type:"string",minLength:40,maxLength:900},
   sources:{type:"array",minItems:2,maxItems:4,items:{type:"object",additionalProperties:false,properties:{title:{type:"string"},url:{type:"string"}},required:["title","url"]}}
  },
  required:["title","problem","audience","details","sources"]
 }}},
 required:["ideas"]
} as const;

function canonical(value:string){return value.toLowerCase().replace(/[™®©]/g,"").replace(/[^a-z0-9]+/g," ").trim()}
function safeText(value:unknown,max:number){return String(value||"").replace(/\s+/g," ").trim().slice(0,max)}
function safeUrl(value:unknown){try{const url=new URL(String(value));return url.protocol==="https:"?url.toString():""}catch{return""}}

function outputText(response:OpenAIResponse){
 for(const item of response.output||[])for(const content of item.content||[])if(content.type==="output_text"&&content.text)return content.text;
 return"";
}

function citedUrls(response:OpenAIResponse){
 const urls=new Set<string>();
 for(const item of response.output||[])for(const content of item.content||[])for(const annotation of content.annotations||[]){
  if(annotation.type!=="url_citation")continue;
  const url=safeUrl(annotation.url);
  if(url)urls.add(url);
 }
 return urls;
}

async function researchIdeas(context:string){
 const apiKey=(process.env.OPENAI_API_KEY||"").trim();
 if(!apiKey)throw new Error("Idea Radar needs OPENAI_API_KEY in the Vercel project before live AI research can run.");
 const model=(process.env.OPENAI_IDEA_RADAR_MODEL||"gpt-5.5").trim();
 const response=await fetch("https://api.openai.com/v1/responses",{
  method:"POST",
  headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},
  body:JSON.stringify({
   model,
   tools:[{type:"web_search"}],
   max_output_tokens:5000,
   input:[
    {role:"system",content:"You are CactusByte Idea Radar, an evidence-first product researcher. Search the live web before proposing ideas. Find practical, buildable product opportunities that solve a specific pain point, fit a small independent app studio, and do not duplicate the supplied portfolio or existing ideas. Use current evidence, avoid hype, and return exactly three distinct concepts. Every concept must include two to four real HTTPS sources that support the problem or market gap."},
    {role:"user",content:`Research new opportunities using this current CactusByte portfolio, public app surfaces, existing Idea Forge titles, and anonymized feedback signals.\n\n${context}`}
   ],
   text:{format:{type:"json_schema",name:"cactusbyte_idea_radar",strict:true,schema:IDEA_SCHEMA}}
  }),
  signal:AbortSignal.timeout(48_000)
 });
 const data=await response.json() as OpenAIResponse;
 if(!response.ok)throw new Error(safeText(data.error?.message,240)||"The AI research provider rejected the Idea Radar request.");
 const text=outputText(data);
 if(!text)throw new Error("Idea Radar returned no research concepts.");
 const parsed=JSON.parse(text) as {ideas?:RadarIdea[]};
 const citations=citedUrls(data);
 const ideas=(parsed.ideas||[]).map(idea=>({
  title:safeText(idea.title,80),
  problem:safeText(idea.problem,320),
  audience:safeText(idea.audience,160),
  details:safeText(idea.details,900),
  sources:(idea.sources||[]).map(source=>({title:safeText(source.title,160),url:safeUrl(source.url)})).filter(source=>source.title&&source.url&&citations.has(source.url)).slice(0,4)
 })).filter(idea=>idea.title&&idea.problem&&idea.audience&&idea.details&&idea.sources.length>=2);
 if(!ideas.length)throw new Error("Idea Radar research did not return enough verifiable source links.");
 return{model,ideas};
}

export async function POST(request:Request){
 const owner=await ownerIdentity(request);
 if(!owner)return Response.json({ok:false,reason:"Owner access is required to run AI Idea Radar."},{status:403,headers:{"Cache-Control":"no-store"}});
 const apiKey=(process.env.OPENAI_API_KEY||"").trim();
 if(!apiKey)return Response.json({ok:false,state:"configuration-required",reason:"Idea Radar needs OPENAI_API_KEY in Vercel before live AI web research can run."},{status:503,headers:{"Cache-Control":"no-store"}});

 const db=adminDb();
 const runRef=db.collection("ideaRadarRuns").doc();
 await runRef.set({ownerUid:owner.uid,status:"running",source:"owner",startedAt:FieldValue.serverTimestamp()});

 try{
  const[ideasSnap,feedbackSnap]=await Promise.all([
   db.collection("ideas").orderBy("createdAt","desc").limit(100).get(),
   db.collection("feedback").orderBy("createdAt","desc").limit(40).get()
  ]);
  const existingTitles=ideasSnap.docs.map(doc=>safeText(doc.data().title,80)).filter(Boolean);
  const portfolio=studioApps.map(app=>({name:app.name,description:app.description,category:app.category,url:app.url||null}));
  const feedback=feedbackSnap.docs.map(doc=>{const data=doc.data();return{app:safeText(data.appId,60),category:safeText(data.category,60),message:safeText(data.message,300)}}).filter(row=>row.message);
  const context=JSON.stringify({portfolio,existingIdeaTitles:existingTitles,anonymizedFeedback:feedback},null,2);
  const research=await researchIdeas(context);
  const known=new Set(existingTitles.map(canonical));
  const created:{id:string;title:string;sources:Source[]}[]=[];
  const batch=db.batch();
  let skipped=0;

  for(const idea of research.ideas){
   const key=canonical(idea.title);
   if(!key||known.has(key)){skipped++;continue}
   known.add(key);
   const ideaRef=db.collection("ideas").doc();
   batch.set(ideaRef,{
    userId:owner.uid,title:idea.title,problem:idea.problem,audience:idea.audience,details:idea.details,
    status:"Researching",source:"radar",votes:0,sources:idea.sources,radarRunId:runRef.id,createdAt:FieldValue.serverTimestamp()
   });
   for(const source of idea.sources){
    const evidenceRef=db.collection("ideaRadarEvidence").doc();
    batch.set(evidenceRef,{ideaId:ideaRef.id,runId:runRef.id,title:source.title,url:source.url,createdAt:FieldValue.serverTimestamp()});
   }
   created.push({id:ideaRef.id,title:idea.title,sources:idea.sources});
  }

  batch.set(runRef,{status:"completed",model:research.model,created:created.length,skipped,completedAt:FieldValue.serverTimestamp()},{merge:true});
  await batch.commit();
  return Response.json({ok:true,state:"completed",created:created.length,skipped,ideas:created},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const reason=error instanceof Error?error.message:"Idea Radar failed.";
  await runRef.set({status:"failed",reason:safeText(reason,300),completedAt:FieldValue.serverTimestamp()},{merge:true}).catch(()=>{});
  return Response.json({ok:false,state:"failed",reason},{status:502,headers:{"Cache-Control":"no-store"}});
 }
}
