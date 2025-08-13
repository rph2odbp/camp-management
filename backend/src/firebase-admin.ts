// backend/src/firebase-admin.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import * as path from "path";

// Path to your service account key file
const serviceAccountKeyPath = path.join(__dirname, '..', 'adminsdk-credentials.json');

// Initialize the Firebase Admin SDK only if it hasn't been initialized yet
if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccountKeyPath),
        databaseURL: "https://kateri-fbc.firebaseio.com"
    });
}

// Export the initialized services
export const db = getFirestore("kateri-db");
export const auth = getAuth();
