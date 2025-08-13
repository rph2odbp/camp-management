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
exports.seedDatabase = void 0;
// backend/src/seeding.ts
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("./firebase-admin");
const SESSIONS_DATA = [
    { name: "Session 1 (June 1-7)", startDate: "2025-06-01", endDate: "2025-06-07", capacity: 20 },
    { name: "Session 2 (June 8-14)", startDate: "2025-06-08", endDate: "2025-06-14", capacity: 20 },
    { name: "Session 3 (June 15-21)", startDate: "2025-06-15", endDate: "2025-06-21", capacity: 25 },
];
const MESSAGE_PACKAGES_DATA = [
    { name: "Bronze Package", price: 5.00, credits: 10 },
    { name: "Silver Package", price: 10.00, credits: 25 },
    { name: "Gold Package", price: 20.00, credits: 60 },
];
const seedDatabase = async (request) => {
    var _a;
    if (((_a = request.auth) === null || _a === void 0 ? void 0 : _a.token.role) !== "admin") {
        throw new https_1.HttpsError("permission-denied", "You must be an admin to seed the database.");
    }
    try {
        logger.info("Starting database seed process...");
        const sessionsCollection = firebase_admin_1.db.collection("sessions");
        for (const session of SESSIONS_DATA) {
            await sessionsCollection.add(session);
        }
        logger.info(`${SESSIONS_DATA.length} sessions have been added.`);
        const packagesCollection = firebase_admin_1.db.collection("message_packages");
        for (const pkg of MESSAGE_PACKAGES_DATA) {
            await packagesCollection.add(pkg);
        }
        logger.info(`${MESSAGE_PACKAGES_DATA.length} message packages have been added.`);
        return { status: "success", message: "Database seeded successfully!" };
    }
    catch (error) {
        logger.error("Error seeding database:", error);
        throw new https_1.HttpsError("internal", "Failed to seed the database.");
    }
};
exports.seedDatabase = seedDatabase;
//# sourceMappingURL=seeding.js.map