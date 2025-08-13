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
exports.setUserRole = void 0;
// backend/src/user-management.ts
const https_1 = require("firebase-functions/v2/https");
const firebase_admin_1 = require("./firebase-admin");
const logger = __importStar(require("firebase-functions/logger"));
const setUserRole = async (request) => {
    var _a;
    // 1. Verify the user making the request has the 'admin' role.
    if (((_a = request.auth) === null || _a === void 0 ? void 0 : _a.token.role) !== "admin") {
        throw new https_1.HttpsError("permission-denied", "Only admins can set user roles.");
    }
    const { uid, role } = request.data;
    if (!uid || !role) {
        throw new https_1.HttpsError("invalid-argument", "The function must be called with 'uid' and 'role' arguments.");
    }
    try {
        logger.info(`Setting role for user ${uid} to ${role}`);
        // 2. Set the custom claim on the user's auth record.
        await firebase_admin_1.auth.setCustomUserClaims(uid, { role });
        // 3. Update the user's role in the Firestore database for consistency.
        await firebase_admin_1.db.collection("users").doc(uid).update({ role });
        logger.info(`Successfully set role for user ${uid} to ${role}`);
        return { status: "success", message: `User role updated to ${role}.` };
    }
    catch (error) {
        logger.error(`Error setting user role for ${uid}:`, error);
        throw new https_1.HttpsError("internal", "An error occurred while setting the user role.");
    }
};
exports.setUserRole = setUserRole;
//# sourceMappingURL=user-management.js.map