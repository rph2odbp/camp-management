// backend/src/make-admin.ts
import { auth, db } from "./firebase-admin";
import * as logger from "firebase-functions/logger";

/**
 * Gives a user the 'admin' role in Firebase Auth and Firestore.
 * @param {string} email The email address of the user to make an admin.
 */
async function makeAdmin(email: string) {
  if (!email) {
    logger.error("Error: Email address is required.");
    process.exit(1);
  }

  try {
    logger.info(`Attempting to make ${email} an admin...`);

    const userRecord = await auth.getUserByEmail(email);
    const { uid } = userRecord;

    await auth.setCustomUserClaims(uid, { role: "admin" });
    logger.info(`Set custom claim for UID: ${uid}. Now verifying...`);

    const updatedUserRecord = await auth.getUser(uid);
    if (updatedUserRecord.customClaims?.role === "admin") {
      logger.info("✅ Verification successful! User has admin privileges.");
    } else {
      const claims = JSON.stringify(updatedUserRecord.customClaims);
      throw new Error(
        `Verification failed. The admin role was not applied correctly. Claims: ${claims}`
      );
    }

    await db.collection("users").doc(uid).update({ role: "admin" });
    logger.info(`Updated Firestore document for UID: ${uid}.`);

    logger.info(`✅✅✅ Successfully made ${email} an admin.`);
    process.exit(0);
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      logger.error(`Error: User with email ${email} not found.`);
    } else {
      logger.error("An unexpected error occurred:", error);
    }
    process.exit(1);
  }
}

const emailArg = process.argv[2];
makeAdmin(emailArg);
