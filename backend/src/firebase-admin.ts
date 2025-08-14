// backend/src/firebase-admin.ts
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Initialize the Firebase Admin SDK only if it hasn't been initialized yet
if (!getApps().length) {
    initializeApp();
}

// Export the initialized services
export const db = getFirestore("kateri-db");
export const auth = getAuth();
