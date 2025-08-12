import { getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as functions from 'firebase-functions';

const firestore = getFirestore("kateri-db");

const SESSIONS_DATA = [
  {name: "Session 1 (June 1-7)",
    startDate: "2025-06-01",
    endDate: "2025-06-07",
    capacity: 20},
  {name: "Session 2 (June 8-14)",
    startDate: "2025-06-08",
    endDate: "2025-06-14",
    capacity: 20},
  {name: "Session 3 (June 15-21)",
    startDate: "2025-06-15",
    endDate: "2025-06-21",
    capacity: 25},
];

const MESSAGE_PACKAGES_DATA = [
  {name: "Bronze Package", price: 5.00, credits: 10},
  {name: "Silver Package", price: 10.00, credits: 25},
  {name: "Gold Package", price: 20.00, credits: 60},
];

export const seedDatabase = async (request: {
    auth: { token: { admin: any; }; };
}) => {
  if (!request.auth || !request.auth.token.admin) {
    throw new HttpsError("permission-denied",
      "You must be an admin to seed the database.");
  }

  try {
    logger.info("Starting database seed process...");

    for (const session of SESSIONS_DATA) {
      await firestore.collection("sessions").add(session);
    }
    logger.info(`${SESSIONS_DATA.length} sessions have been added.`);

    for (const pkg of MESSAGE_PACKAGES_DATA) {
      await firestore.collection("message_packages").add(pkg);
    }
    logger.info(`${MESSAGE_PACKAGES_DATA.length} message packages have been added.`);

    return {status: "success", message: "Database seeded successfully!"};
  } catch (error) {
    logger.error("Error seeding database:", error);
    throw new HttpsError("internal", "Failed to seed the database.");
  }
};
