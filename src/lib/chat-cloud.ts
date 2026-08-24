import { addDoc, collection, doc, limit, onSnapshot, query, serverTimestamp, setDoc, where, type Unsubscribe } from "firebase/firestore";
import { auth, db } from "./firebase";

export type ChatChannel = {
  id:string;
  label:string;
  appId?:string|null;
};

export type ChatMessage = {
  id:string;
  channelId:string;
  userId:string;
  displayName:string;
  body:string;
  replyTo?:string|null;
  hidden:boolean;
  createdAt?:unknown;
};

function requireUser() {
  if (!auth.currentUser) throw new Error("Sign in with CactusByte ID™ first.");
  return auth.currentUser;
}

export const defaultChannels:ChatChannel[] = [
  { id:"general", label:"General CactusByte" },
  { id:"app-ideas", label:"App Ideas" },
  { id:"ffm", label:"Fantasy Football Matrix", appId:"fantasy-matrix" },
  { id:"scouttrace", label:"ScoutTrace", appId:"scouttrace" },
  { id:"ghostlane", label:"GhostLane", appId:"ghostlane" },
];

export async function ensureDefaultChannels() {
  const user = requireUser();
  for (const channel of defaultChannels) {
    await setDoc(doc(db,"chatChannels",channel.id), {
      ...channel,
      isPublic:true,
      createdBy:user.uid,
      createdAt:serverTimestamp(),
    }, { merge:true });
  }
}

export function subscribeToMessages(
  channelId:string,
  callback:(messages:ChatMessage[])=>void,
  onError?:(error:Error)=>void
):Unsubscribe {
  requireUser();
  const q = query(collection(db,"chatMessages"), where("channelId","==",channelId), limit(100));
  return onSnapshot(q, snap => {
    const rows = snap.docs.map(d => ({ id:d.id, ...(d.data() as Omit<ChatMessage,"id">) }));
    rows.sort((a:any,b:any)=>(a.createdAt?.toMillis?.()??0)-(b.createdAt?.toMillis?.()??0));
    callback(rows);
  }, err => onError?.(err));
}

export async function sendMessage(input:{
  channelId:string;
  displayName:string;
  body:string;
  replyTo?:string|null;
}) {
  const user = requireUser();
  const body = input.body.trim();
  if (!body) throw new Error("Message cannot be empty.");
  if (body.length > 2000) throw new Error("Message is too long.");

  return addDoc(collection(db,"chatMessages"), {
    channelId:input.channelId,
    userId:user.uid,
    displayName:input.displayName || "CactusByte User",
    body,
    replyTo:input.replyTo || null,
    hidden:false,
    createdAt:serverTimestamp(),
  });
}

export async function reportMessage(messageId:string, reason:string) {
  const user = requireUser();
  return addDoc(collection(db,"chatReports"), {
    reporterId:user.uid,
    messageId,
    reason:reason.trim() || "Other",
    status:"New",
    createdAt:serverTimestamp(),
  });
}

export async function blockUser(blockedId:string) {
  const user = requireUser();
  if (blockedId === user.uid) throw new Error("You cannot block yourself.");
  return setDoc(doc(db,"chatBlocks",`${user.uid}_${blockedId}`), {
    blockerId:user.uid,
    blockedId,
    createdAt:serverTimestamp(),
  });
}
