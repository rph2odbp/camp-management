// backend/src/index.ts
import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db, auth } from "./firebase-admin";
import { handleChat } from "./kchat";
import { generateReport } from "./reporting";
import { seedDatabase as seedDatabaseLogic } from "./seeding";
import { setUserRole as setUserRoleLogic } from "./user-management";
import { searchUsers as searchUsersLogic } from "./search"; // Import the new function

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
    const userRecord = await auth.createUser({ email, password });
    await auth.setCustomUserClaims(userRecord.uid, { role: "parent" });
    await db.collection("users").doc(userRecord.uid).set({
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
    const userRecord = await auth.createUser({ email, password });
    await auth.setCustomUserClaims(userRecord.uid, { role: "staff" });
    await db.collection("users").doc(userRecord.uid).set({
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

export const seedDatabase = onCall({ cors: true }, seedDatabaseLogic);
export const kchat = onCall({ cors: true }, handleChat);
export const getReportData = onCall({ cors: true }, generateReport);
export const setUserRole = onCall({ cors: true }, setUserRoleLogic);
export const searchUsers = onCall({ cors: true }, searchUsersLogic);
