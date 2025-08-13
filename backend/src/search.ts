// backend/src/search.ts
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { db } from "./firebase-admin";
import * as logger from "firebase-functions/logger";

interface SearchRequestData {
  query: string;
}

export const searchUsers = async (request: CallableRequest<SearchRequestData>) => {
  if (request.auth?.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can perform searches.");
  }

  const { query } = request.data;
  if (!query || query.trim().length < 3) {
    throw new HttpsError("invalid-argument", "A search query of at least 3 characters is required.");
  }

  const normalizedQuery = query.toLowerCase();

  try {
    const userResults: any[] = [];
    const camperResults: any[] = [];

    // Search in 'users' collection by email
    const usersByEmail = await db.collection("users")
      .where("email", ">=", normalizedQuery)
      .where("email", "<=", normalizedQuery + "\uf8ff")
      .get();
    usersByEmail.forEach((doc) => {
      userResults.push({ id: doc.id, ...doc.data(), type: "User" });
    });

    // Search in 'campers' collection by name (requires an index)
    const campersByName = await db.collection("campers")
      .where("firstName", ">=", normalizedQuery)
      .where("firstName", "<=", normalizedQuery + "\uf8ff")
      .get();
    campersByName.forEach((doc) => {
      camperResults.push({ id: doc.id, ...doc.data(), type: "Camper" });
    });

    const combined = [...userResults, ...camperResults].map((r) => ({
      id: r.id,
      name: r.type === "Camper" ? `${r.firstName} ${r.lastName}` : r.email,
      email: r.email,
      type: r.type,
    }));

    // Remove duplicates
    const uniqueResults = Array.from(new Map(combined.map((item) =>
      [item.id, item])).values());

    return { results: uniqueResults };
  } catch (error) {
    logger.error("Error during search:", error);
    throw new HttpsError("internal", "An unexpected error occurred during the search.");
  }
};
