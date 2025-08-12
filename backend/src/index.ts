
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin SDK
initializeApp();

/**
 * Creates a new user with a specified role and adds their data to Firestore.
 * This function can only be called by an authenticated user with the 'admin' custom claim.
 */
export const createUser = onCall(async (request) => {
    // 1. Authentication and Authorization Check
    //    Ensure the user calling the function is authenticated and is an admin.
    if (!request.auth || !request.auth.token.admin) {
        logger.error("Caller is not an admin.", { uid: request.auth?.uid });
        throw new HttpsError(
            "permission-denied",
            "You must be an admin to create new users."
        );
    }

    // 2. Input Validation
    //    Ensure the necessary data was passed in the request.
    const { email, password, role, firstName, lastName } = request.data;
    if (!email || !password || !role || !firstName || !lastName) {
        throw new HttpsError(
            "invalid-argument",
            "The function must be called with all required fields: email, password, role, firstName, lastName."
        );
    }

    try {
        logger.info(`Attempting to create user: ${email} with role ${role}`);

        // 3. Create User in Firebase Authentication
        const userRecord = await getAuth().createUser({
            email: email,
            password: password,
            displayName: `${firstName} ${lastName}`,
        });

        const userId = userRecord.uid;
        logger.info(`Successfully created user in Auth with UID: ${userId}`);

        // 4. Set Custom Claims for Role-Based Access Control (RBAC)
        await getAuth().setCustomUserClaims(userId, { role: role });
        logger.info(`Set custom claim 'role: ${role}' for user: ${userId}`);

        // 5. Create User Document in Firestore
        //    This stores additional user information.
        const userDoc = {
            uid: userId,
            email: email,
            role: role,
            firstName: firstName,
            lastName: lastName,
            createdAt: new Date().toISOString(),
        };
        await getFirestore().collection("users").doc(userId).set(userDoc);
        logger.info(`Successfully created user document in Firestore for user: ${userId}`);

        // 6. Return Success Response
        return {
            status: "success",
            message: `User ${email} created successfully with role ${role}.`,
            uid: userId,
        };
    } catch (error: any) {
        logger.error("Error creating new user:", error);

        // Map Firebase Auth errors to client-friendly messages.
        if (error.code === "auth/email-already-exists") {
            throw new HttpsError("already-exists", "The email address is already in use by another account.");
        }
        if (error.code === "auth/invalid-password") {
            throw new HttpsError("invalid-argument", "The password must be a string with at least 6 characters.");
        }

        // Generic error for other failures.
        throw new HttpsError("internal", "An unexpected error occurred while creating the user.");
    }
});
