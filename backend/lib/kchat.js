"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChat = void 0;
// backend/src/kchat.ts
const https_1 = require("firebase-functions/v2/https");
const generative_ai_1 = require("@google/generative-ai");
// Initialize the Generative AI model
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
// --- Main Chat Handler ---
const handleChat = async (request) => {
    var _a;
    if (((_a = request.auth) === null || _a === void 0 ? void 0 : _a.token.role) !== "admin") {
        throw new https_1.HttpsError("permission-denied", "You must be an admin to use this feature.");
    }
    const { data } = request;
    const message = data === null || data === void 0 ? void 0 : data.message;
    if (!message) {
        throw new https_1.HttpsError("invalid-argument", "A 'message' is required.");
    }
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    return { response: text };
};
exports.handleChat = handleChat;
//# sourceMappingURL=kchat.js.map