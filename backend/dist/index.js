"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const https_1 = require("firebase-functions/v2/https");
const functions = require("firebase-functions"); // Add this line back
const admin = require("firebase-admin");
admin.initializeApp();
exports.createUser = (0, https_1.onCall)((request) => {
    var _a;
    // 1. Verify the user calling the function is an admin.
    if (((_a = request.auth) === null || _a === void 0 ? void 0 : _a.token.role) !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can create new users.');
    }
    const { email, password, role } = request.data;
    // The password is required for user creation.
    if (!password) {
        throw new functions.https.HttpsError('invalid-argument', 'Password is required.');
    }
    if (!['parent', 'staff', 'admin'].includes(role)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid role specified.');
    }
    return admin.auth().createUser({
        email: email,
        password: password,
    })
        .then(userRecord => {
        return admin.auth().setCustomUserClaims(userRecord.uid, { role: role })
            .then(() => {
            const userForFirestore = {
                email: email,
                role: role
            };
            return admin.firestore().collection('users').doc(userRecord.uid).set(userForFirestore);
        });
    })
        .then(() => {
        return { result: `Successfully created user ${email} with role ${role}.` };
    })
        .catch((error) => {
        console.error('Error creating new user:', error);
        throw new functions.https.HttpsError('internal', 'An unexpected error occurred.');
    });
});
//# sourceMappingURL=index.js.map