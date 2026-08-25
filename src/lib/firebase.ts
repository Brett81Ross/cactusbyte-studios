export const FIREBASE_API_KEY=(process.env.NEXT_PUBLIC_FIREBASE_API_KEY||"").trim();
export const FIREBASE_PROJECT_ID="cactusbyte-studios";
export const firebaseConfigured=FIREBASE_API_KEY.length>0;
export const FIRESTORE_BASE=`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
export const AUTH_BASE="https://identitytoolkit.googleapis.com/v1";
