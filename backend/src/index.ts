import { onCall } from 'firebase-functions/v2/https';
import * as functions from 'firebase-functions'; // Add this line back
import * as admin from 'firebase-admin';

admin.initializeApp();

// Define a type for the user data for better type safety
interface UserData {
  email: string;
  password?: string; // Password is only for creation, optional for other uses
  role: 'parent' | 'staff' | 'admin';
}

export const createUser = onCall((request) => {
    // 1. Verify the user calling the function is an admin.
    if (request.auth?.token.role !== 'admin') {
        throw new functions.https.HttpsError(
            'permission-denied', 
            'Only admins can create new users.'
        );
    }

    const { email, password, role } = request.data as UserData;

    // The password is required for user creation.
    if (!password) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Password is required.'
        );
    }

    if (!['parent', 'staff', 'admin'].includes(role)) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Invalid role specified.'
        );
    }

    return admin.auth().createUser({
        email: email,
        password: password,
    })
    .then(userRecord => {
        return admin.auth().setCustomUserClaims(userRecord.uid, { role: role })
            .then(() => {
                const userForFirestore: Omit<UserData, 'password'> = {
                    email: email,
                    role: role
                };
                return admin.firestore().collection('users').doc(userRecord.uid).set(userForFirestore);
            });
    })
    .then(() => {
        return { result: `Successfully created user ${email} with role ${role}.` };
    })
    .catch((error: any) => {
        console.error('Error creating new user:', error);
        throw new functions.https.HttpsError('internal', 'An unexpected error occurred.');
    });
});
