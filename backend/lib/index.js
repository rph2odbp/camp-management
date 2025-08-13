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
exports.searchUsers = exports.setUserRole = exports.getReportData = exports.kchat = exports.seedDatabase = exports.registerAsStaff = exports.registerAsParent = void 0;
// backend/src/index.ts
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("./firebase-admin");
const kchat_1 = require("./kchat");
const reporting_1 = require("./reporting");
const seeding_1 = require("./seeding");
const user_management_1 = require("./user-management");
const search_1 = require("./search"); // Import the new function
exports.registerAsParent = (0, https_1.onCall)({ cors: true }, async (request) => {
    const { email, password } = request.data;
    if (!email || !password) {
        throw new https_1.HttpsError("invalid-argument", "Email and password are required.");
    }
    try {
        const userRecord = await firebase_admin_1.auth.createUser({ email, password });
        await firebase_admin_1.auth.setCustomUserClaims(userRecord.uid, { role: "parent" });
        await firebase_admin_1.db.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: email,
            role: "parent",
            createdAt: new Date().toISOString(),
        });
        return { status: "success", uid: userRecord.uid };
    }
    catch (error) {
        logger.error("Error registering parent:", error);
        throw new https_1.HttpsError("internal", "Failed to register new parent.");
    }
});
exports.registerAsStaff = (0, https_1.onCall)({ cors: true }, async (request) => {
    const { email, password } = request.data;
    if (!email || !password) {
        throw new https_1.HttpsError("invalid-argument", "Email and password are required.");
    }
    try {
        const userRecord = await firebase_admin_1.auth.createUser({ email, password });
        await firebase_admin_1.auth.setCustomUserClaims(userRecord.uid, { role: "staff" });
        await firebase_admin_1.db.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: email,
            role: "staff",
            applicationStatus: "not_submitted",
            isHired: false,
            createdAt: new Date().toISOString(),
        });
        return { status: "success", uid: userRecord.uid };
    }
    catch (error) {
        logger.error("Error registering staff:", error);
        throw new https_1.HttpsError("internal", "Failed to register new staff member.");
    }
});
exports.seedDatabase = (0, https_1.onCall)({ cors: true }, seeding_1.seedDatabase);
exports.kchat = (0, https_1.onCall)({ cors: true }, kchat_1.handleChat);
exports.getReportData = (0, https_1.onCall)({ cors: true }, reporting_1.generateReport);
exports.setUserRole = (0, https_1.onCall)({ cors: true }, user_management_1.setUserRole);
exports.searchUsers = (0, https_1.onCall)({ cors: true }, search_1.searchUsers);
//# sourceMappingURL=index.js.map