import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase web configuration is intentionally public client configuration.
// Security is enforced by Firebase Authentication + Firestore Security Rules.
const firebaseConfig = {
  apiKey: "AIzaSyCGkdhYgDvp8-OVxt0FWqeWppFMnt6ETuE",
  authDomain: "cactusbyte-studios.firebaseapp.com",
  projectId: "cactusbyte-studios",
  storageBucket: "cactusbyte-studios.firebasestorage.app",
  messagingSenderId: "920784878980",
  appId: "1:920784878980:web:0fabadac398893f9b4f1d1",
  measurementId: "G-9F4SNLFS35",
};

export const firebaseConfigured = true;
export const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
