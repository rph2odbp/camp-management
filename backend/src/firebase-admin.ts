// backend/src/firebase-admin.ts
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Initialize the Firebase Admin SDK only once
initializeApp();

// Export the initialized services
export const db = getFirestore("kateri-db");
export const auth = getAuth();
