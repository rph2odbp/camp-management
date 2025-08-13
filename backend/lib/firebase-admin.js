"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = void 0;
// backend/src/firebase-admin.ts
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
// Initialize the Firebase Admin SDK only once
(0, app_1.initializeApp)();
// Export the initialized services
exports.db = (0, firestore_1.getFirestore)("kateri-db");
exports.auth = (0, auth_1.getAuth)();
//# sourceMappingURL=firebase-admin.js.map