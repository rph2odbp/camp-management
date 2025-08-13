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
// backend/src/make-admin.ts
const firebase_admin_1 = require("./firebase-admin");
const logger = __importStar(require("firebase-functions/logger"));
/**
 * Gives a user the 'admin' role in Firebase Auth and Firestore.
 * @param {string} email The email address of the user to make an admin.
 */
async function makeAdmin(email) {
    var _a;
    if (!email) {
        logger.error("Error: Email address is required.");
        process.exit(1);
    }
    try {
        logger.info(`Attempting to make ${email} an admin...`);
        const userRecord = await firebase_admin_1.auth.getUserByEmail(email);
        const { uid } = userRecord;
        await firebase_admin_1.auth.setCustomUserClaims(uid, { role: "admin" });
        logger.info(`Set custom claim for UID: ${uid}. Now verifying...`);
        const updatedUserRecord = await firebase_admin_1.auth.getUser(uid);
        if (((_a = updatedUserRecord.customClaims) === null || _a === void 0 ? void 0 : _a.role) === "admin") {
            logger.info("✅ Verification successful! User has admin privileges.");
        }
        else {
            const claims = JSON.stringify(updatedUserRecord.customClaims);
            throw new Error(`Verification failed. The admin role was not applied correctly. Claims: ${claims}`);
        }
        await firebase_admin_1.db.collection("users").doc(uid).update({ role: "admin" });
        logger.info(`Updated Firestore document for UID: ${uid}.`);
        logger.info(`✅✅✅ Successfully made ${email} an admin.`);
        process.exit(0);
    }
    catch (error) {
        if (error.code === "auth/user-not-found") {
            logger.error(`Error: User with email ${email} not found.`);
        }
        else {
            logger.error("An unexpected error occurred:", error);
        }
        process.exit(1);
    }
}
const emailArg = process.argv[2];
makeAdmin(emailArg);
//# sourceMappingURL=make-admin.js.map