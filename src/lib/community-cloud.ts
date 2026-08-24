import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "./firebase";

function requireUser() {
  if (!auth.currentUser) throw new Error("Sign in with CactusByte ID™ first.");
  return auth.currentUser;
}

export type FeedbackRecord = {
  id?: string;
  userId: string;
  appId: string;
  category: string;
  severity?: string | null;
  message: string;
  contact?: string | null;
  status: string;
  createdAt?: unknown;
};

export type IdeaRecord = {
  id?: string;
  userId: string;
  title: string;
  problem?: string | null;
  audience?: string | null;
  details?: string | null;
  status: string;
  source: string;
  votes: number;
  createdAt?: unknown;
};

export async function submitFeedback(input:{
  appId:string;
  category:string;
  severity?:string;
  message:string;
  contact?:string;
}) {
  const user = requireUser();
  return addDoc(collection(db, "feedback"), {
    userId:user.uid,
    appId:input.appId,
    category:input.category,
    severity:input.severity || null,
    message:input.message,
    contact:input.contact || null,
    status:"New",
    createdAt:serverTimestamp(),
  });
}

export async function myFeedback(): Promise<FeedbackRecord[]> {
  const user = requireUser();
  const snap = await getDocs(query(
    collection(db, "feedback"),
    where("userId","==",user.uid),
    orderBy("createdAt","desc"),
    limit(100)
  ));
  return snap.docs.map(d => ({ id:d.id, ...(d.data() as Omit<FeedbackRecord,"id">) }));
}

export async function submitIdea(input:{
  title:string;
  problem?:string;
  audience?:string;
  details?:string;
}) {
  const user = requireUser();
  return addDoc(collection(db, "ideas"), {
    userId:user.uid,
    title:input.title,
    problem:input.problem || null,
    audience:input.audience || null,
    details:input.details || null,
    status:"New",
    source:"user",
    votes:1,
    createdAt:serverTimestamp(),
  });
}

export async function publicIdeas(): Promise<IdeaRecord[]> {
  const snap = await getDocs(query(
    collection(db, "ideas"),
    orderBy("votes","desc"),
    limit(100)
  ));
  return snap.docs.map(d => ({ id:d.id, ...(d.data() as Omit<IdeaRecord,"id">) }));
}
