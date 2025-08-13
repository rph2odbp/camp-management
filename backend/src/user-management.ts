// backend/src/user-management.ts
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { auth, db } from "./firebase-admin";
import * as logger from "firebase-functions/logger";

interface SetUserRoleData {
  uid: string;
  role: string;
}

export const setUserRole = async (request: CallableRequest<SetUserRoleData>) => {
  // 1. Verify the user making the request has the 'admin' role.
  if (request.auth?.token.role !== "admin") {
    throw new HttpsError(
      "permission-denied",
      "Only admins can set user roles."
    );
  }

  const { uid, role } = request.data;
  if (!uid || !role) {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with 'uid' and 'role' arguments."
    );
  }

  try {
    logger.info(`Setting role for user ${uid} to ${role}`);

    // 2. Set the custom claim on the user's auth record.
    await auth.setCustomUserClaims(uid, { role });

    // 3. Update the user's role in the Firestore database for consistency.
    await db.collection("users").doc(uid).update({ role });

    logger.info(`Successfully set role for user ${uid} to ${role}`);
    return { status: "success", message: `User role updated to ${role}.` };
  } catch (error) {
    logger.error(`Error setting user role for ${uid}:`, error);
    throw new HttpsError("internal", "An error occurred while setting the user role.");
  }
};
