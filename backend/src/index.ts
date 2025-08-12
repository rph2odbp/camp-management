import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall, CallableRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { handleChat } from "./kchat";
import { generateReport } from "./reporting";
import { seedDatabase } from "./seeding";
import * as express from 'express';
import * as cors from 'cors';

initializeApp();
const firestore = getFirestore("kateri-db");

const app = express();

const corsOptions = {
  origin: true,
  methods: ['GET', 'POST']
};

app.use(cors(corsOptions));

interface RegisterRequestData {
  email: string;
  password: string;
}

export const registerAsParent = onCall({ cors: true }, async (request: CallableRequest<RegisterRequestData>) => {
  const { email, password } = request.data;
  if (!email || !password) {
    throw new HttpsError("invalid-argument", "Email and password are required.");
  }
  try {
    const userRecord = await getAuth().createUser({ email, password });
    await getAuth().setCustomUserClaims(userRecord.uid, { role: "parent" });
    await firestore.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      role: "parent",
      createdAt: new Date().toISOString(),
    });
    return { status: "success", uid: userRecord.uid };
  } catch (error) {
    logger.error("Error registering parent:", error);
    throw new HttpsError("internal", "Failed to register new parent.");
  }
});

export const registerAsStaff = onCall({ cors: true }, async (request: CallableRequest<RegisterRequestData>) => {
  const { email, password } = request.data;
  if (!email || !password) {
    throw new HttpsError("invalid-argument", "Email and password are required.");
  }
  try {
    const userRecord = await getAuth().createUser({ email, password });
    await getAuth().setCustomUserClaims(userRecord.uid, { role: "staff" });
    await firestore.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      role: "staff",
      applicationStatus: "not_submitted",
      isHired: false,
      createdAt: new Date().toISOString(),
    });
    return { status: "success", uid: userRecord.uid };
  } catch (error) {
    logger.error("Error registering staff:", error);
    throw new HttpsError("internal", "Failed to register new staff member.");
  }
});

// --- Other Callable Functions ---
export const seedDatabase = onCall({ cors: true }, seedDatabase);
export const kchat = onCall({ cors: true }, handleChat);
export const getReportData = onCall({ cors: true }, generateReport);
