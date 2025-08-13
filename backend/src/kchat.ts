// backend/src/kchat.ts
import { HttpsError } from "firebase-functions/v2/https";
import * as functions from "firebase-functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Generative AI model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// --- Main Chat Handler ---
export const handleChat = async (request: functions.https.CallableRequest) => {
  if (request.auth?.token.role !== "admin") {
    throw new HttpsError("permission-denied",
      "You must be an admin to use this feature.");
  }

  const { data } = request;
  const message = data?.message;
  if (!message) {
    throw new HttpsError("invalid-argument", "A 'message' is required.");
  }

  const result = await model.generateContent(message);
  const response = await result.response;
  const text = response.text();

  return { response: text };
};
