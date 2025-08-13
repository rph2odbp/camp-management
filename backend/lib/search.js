"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = void 0;
// backend/src/search.ts
const https_1 = require("firebase-functions/v2/https");
const firebase_admin_1 = require("./firebase-admin");
const logger = __importStar(require("firebase-functions/logger"));
const searchUsers = async (request) => {
    var _a;
    if (((_a = request.auth) === null || _a === void 0 ? void 0 : _a.token.role) !== "admin") {
        throw new https_1.HttpsError("permission-denied", "Only admins can perform searches.");
    }
    const { query } = request.data;
    if (!query || query.trim().length < 3) {
        throw new https_1.HttpsError("invalid-argument", "A search query of at least 3 characters is required.");
    }
    const normalizedQuery = query.toLowerCase();
    try {
        const userResults = [];
        const camperResults = [];
        // Search in 'users' collection by email
        const usersByEmail = await firebase_admin_1.db.collection("users")
            .where("email", ">=", normalizedQuery)
            .where("email", "<=", normalizedQuery + "\uf8ff")
            .get();
        usersByEmail.forEach((doc) => {
            userResults.push(Object.assign(Object.assign({ id: doc.id }, doc.data()), { type: "User" }));
        });
        // Search in 'campers' collection by name (requires an index)
        const campersByName = await firebase_admin_1.db.collection("campers")
            .where("firstName", ">=", normalizedQuery)
            .where("firstName", "<=", normalizedQuery + "\uf8ff")
            .get();
        campersByName.forEach((doc) => {
            camperResults.push(Object.assign(Object.assign({ id: doc.id }, doc.data()), { type: "Camper" }));
        });
        const combined = [...userResults, ...camperResults].map((r) => ({
            id: r.id,
            name: r.type === "Camper" ? `${r.firstName} ${r.lastName}` : r.email,
            email: r.email,
            type: r.type,
        }));
        // Remove duplicates
        const uniqueResults = Array.from(new Map(combined.map((item) => [item.id, item])).values());
        return { results: uniqueResults };
    }
    catch (error) {
        logger.error("Error during search:", error);
        throw new https_1.HttpsError("internal", "An unexpected error occurred during the search.");
    }
};
exports.searchUsers = searchUsers;
//# sourceMappingURL=search.js.map