import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import type { ByteLinkEnvelope } from "./bytelink";

export type StoredByteLinkMessage = {
  id: string;
  senderUserId: string;
  sourceApp: string;
  destinationApp: string;
  contentType: string;
  payload: unknown;
  protocolVersion: string;
  status: "queued" | "delivered" | "consumed" | "rejected";
  createdAt?: unknown;
  consumedAt?: unknown;
};

function requireUser() {
  if (!auth.currentUser) throw new Error("CactusByte ID™ is required for ByteLink™.");
  return auth.currentUser;
}

export async function enqueueByteLink(envelope: ByteLinkEnvelope) {
  const user = requireUser();
  return addDoc(collection(db, "byteLinkMessages"), {
    senderUserId: user.uid,
    sourceApp: envelope.sourceApp,
    destinationApp: envelope.destinationApp,
    contentType: envelope.contentType,
    payload: envelope.payload,
    protocolVersion: envelope.protocolVersion,
    status: "queued",
    createdAt: serverTimestamp(),
  });
}

export async function myByteLinkOutbox(): Promise<StoredByteLinkMessage[]> {
  const user = requireUser();
  const snap = await getDocs(query(
    collection(db, "byteLinkMessages"),
    where("senderUserId", "==", user.uid),
    orderBy("createdAt", "desc"),
    limit(100)
  ));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<StoredByteLinkMessage, "id">) }));
}

export async function destinationInbox(destinationApp: string): Promise<StoredByteLinkMessage[]> {
  requireUser();
  const snap = await getDocs(query(
    collection(db, "byteLinkMessages"),
    where("destinationApp", "==", destinationApp),
    orderBy("createdAt", "desc"),
    limit(50)
  ));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<StoredByteLinkMessage, "id">) }));
}

export async function markConsumed(id: string) {
  requireUser();
  await updateDoc(doc(db, "byteLinkMessages", id), {
    status: "consumed",
    consumedAt: serverTimestamp(),
  });
}
