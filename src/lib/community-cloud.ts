import {addDocument,getSession,runQuery,setDocument}from"./firebase-rest";
export type FeedbackRecord={id?:string;userId:string;appId:string;category:string;severity?:string|null;message:string;contact?:string|null;status:string;createdAt?:unknown};
export type IdeaSource={title:string;url:string};
export type IdeaRecord={id?:string;userId:string;title:string;problem?:string|null;audience?:string|null;details?:string|null;status:string;source:string;votes:number;sources?:IdeaSource[];supportedByMe?:boolean;createdAt?:unknown};
type IdeaVoteRecord={id?:string;userId:string;ideaId:string;createdAt?:unknown};
function session(){const s=getSession();if(!s)throw new Error("Sign in with CactusByte ID™ first.");return s}
function uid(){return session().uid}
export async function submitFeedback(input:{appId:string;category:string;severity?:string;message:string;contact?:string}){return addDocument("feedback",{userId:uid(),appId:input.appId,category:input.category,severity:input.severity||null,message:input.message,contact:input.contact||null,status:"New"})}
export async function myFeedback():Promise<FeedbackRecord[]>{return runQuery("feedback","userId",uid(),"createdAt") as Promise<FeedbackRecord[]>}
export async function submitIdea(input:{title:string;problem?:string;audience?:string;details?:string}){return addDocument("ideas",{userId:uid(),title:input.title,problem:input.problem||null,audience:input.audience||null,details:input.details||null,status:"New",source:"user",votes:1})}
export async function supportIdea(ideaId:string){const s=session(),mine=await runQuery("ideaVotes","userId",s.uid) as IdeaVoteRecord[];if(mine.some(v=>v.ideaId===ideaId))return false;await setDocument("ideaVotes",`${ideaId}_${s.uid}`,{userId:s.uid,ideaId});return true}
export async function publicIdeas():Promise<IdeaRecord[]>{const s=session();const[ideas,votes]=await Promise.all([runQuery("ideas") as Promise<IdeaRecord[]>,runQuery("ideaVotes") as Promise<IdeaVoteRecord[]>]);const counts=new Map<string,number>();for(const v of votes)counts.set(v.ideaId,(counts.get(v.ideaId)||0)+1);return ideas.map(i=>({...i,votes:Number(i.votes||0)+(i.id?counts.get(i.id)||0:0),supportedByMe:!!i.id&&votes.some(v=>v.ideaId===i.id&&v.userId===s.uid)})).sort((a,b)=>b.votes-a.votes)}
