const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.createUser = functions.https.onCall(async (data, context) => {
    // 1. Verify the user calling the function is an admin.
    if (context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError(
            'permission-denied', 
            'Only admins can create new users.'
        );
    }

    const { email, password, role } = data;

    if (!['parent', 'staff', 'admin'].includes(role)) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Invalid role specified.'
        );
    }

    try {
        // 2. Create the new user with the Firebase Admin SDK.
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
        });

        // 3. Set the custom user claim (role).
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: role });

        // 4. Create the user document in Firestore.
        await admin.firestore().collection('users').doc(userRecord.uid).set({
            email: email,
            role: role
        });

        return { result: `Successfully created user ${email} with role ${role}.` };

    } catch (error) {
        console.error('Error creating new user:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
