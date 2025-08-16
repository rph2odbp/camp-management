import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

function readEnv(key: string): string | undefined {
  // Works in Vite (import.meta.env) and Node (process.env)
  const vite = (typeof import.meta !== "undefined" && (import.meta as any).env) || {};
  return vite[key] ?? (process.env as any)?.[key];
}

const firebaseConfig = {
  apiKey: readEnv("VITE_FIREBASE_API_KEY") || "",
  authDomain: readEnv("VITE_FIREBASE_AUTH_DOMAIN") || "",
  databaseURL: readEnv("VITE_FIREBASE_DATABASE_URL") || "",
  projectId: readEnv("VITE_FIREBASE_PROJECT_ID") || "",
  storageBucket: readEnv("VITE_FIREBASE_STORAGE_BUCKET") || "",
  messagingSenderId: readEnv("VITE_FIREBASE_MESSAGING_SENDER_ID") || "",
  appId: readEnv("VITE_FIREBASE_APP_ID") || ""
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);