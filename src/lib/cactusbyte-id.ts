import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, firebaseConfigured } from "./firebase";

export type CactusByteRole = "user" | "tester" | "moderator" | "owner";
export type CactusByteProfile = { uid:string; email?:string|null; displayName?:string|null; role:CactusByteRole };
const googleProvider = new GoogleAuthProvider();

async function ensureProfile(user:User):Promise<CactusByteProfile> {
  const ref = doc(db,"profiles",user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as CactusByteProfile;
  const created:CactusByteProfile = {
    uid:user.uid, email:user.email,
    displayName:user.displayName || user.email?.split("@")[0] || "CactusByte User",
    role:"user"
  };
  await setDoc(ref,{...created,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
  return created;
}

export function useCactusByteId() {
  const [user,setUser] = useState<User|null>(null);
  const [profile,setProfile] = useState<CactusByteProfile|null>(null);
  const [busy,setBusy] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured) { setBusy(false); return; }
    return onAuthStateChanged(auth, async nextUser => {
      setBusy(true); setUser(nextUser);
      if (!nextUser) { setProfile(null); setBusy(false); return; }
      try { setProfile(await ensureProfile(nextUser)); }
      finally { setBusy(false); }
    });
  },[]);

  async function register(email:string,password:string) {
    setBusy(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth,email,password);
      setProfile(await ensureProfile(credential.user));
      return credential.user;
    } finally { setBusy(false); }
  }
  async function login(email:string,password:string) {
    setBusy(true);
    try {
      const credential = await signInWithEmailAndPassword(auth,email,password);
      setProfile(await ensureProfile(credential.user));
      return credential.user;
    } finally { setBusy(false); }
  }
  async function loginWithGoogle() {
    setBusy(true);
    try {
      const credential = await signInWithPopup(auth,googleProvider);
      setProfile(await ensureProfile(credential.user));
      return credential.user;
    } finally { setBusy(false); }
  }
  async function logout() { await signOut(auth); setProfile(null); }

  return { configured:firebaseConfigured,user,profile,busy,isOwner:profile?.role==="owner",register,login,loginWithGoogle,logout };
}
