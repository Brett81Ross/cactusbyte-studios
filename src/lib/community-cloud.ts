import {addDocument,getSession,runQuery}from"./firebase-rest";
export type FeedbackRecord={id?:string;userId:string;appId:string;category:string;severity?:string|null;message:string;contact?:string|null;status:string;createdAt?:unknown};
export type IdeaRecord={id?:string;userId:string;title:string;problem?:string|null;audience?:string|null;details?:string|null;status:string;source:string;votes:number;createdAt?:unknown};
function uid(){const s=getSession();if(!s)throw new Error("Sign in with CactusByte ID™ first.");return s.uid}
export async function submitFeedback(input:{appId:string;category:string;severity?:string;message:string;contact?:string}){return addDocument("feedback",{userId:uid(),appId:input.appId,category:input.category,severity:input.severity||null,message:input.message,contact:input.contact||null,status:"New"})}
export async function myFeedback():Promise<FeedbackRecord[]>{return runQuery("feedback","userId",uid(),"createdAt") as Promise<FeedbackRecord[]>}
export async function submitIdea(input:{title:string;problem?:string;audience?:string;details?:string}){return addDocument("ideas",{userId:uid(),title:input.title,problem:input.problem||null,audience:input.audience||null,details:input.details||null,status:"New",source:"user",votes:1})}
export async function publicIdeas():Promise<IdeaRecord[]>{uid();return runQuery("ideas",undefined,undefined,"votes") as Promise<IdeaRecord[]>}
