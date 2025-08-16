import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

// Health check
export const ping = functions.https.onRequest((_req, res) => {
  res.status(200).json({ ok: true, now: new Date().toISOString() });
});

// Create a minimal user profile on signup
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const db = admin.database();
  await db.ref(`users/${user.uid}`).set({
    uid: user.uid,
    email: user.email ?? null,
    createdAt: admin.database.ServerValue.TIMESTAMP
  });
});

// Maintain a denormalized index: registrationsByUser
export const onRegistrationWrite = functions.database
  .ref("/registrations/{campId}/{regId}")
  .onWrite(async (change, context) => {
    const db = admin.database();
    const { regId } = context.params as { regId: string };

    if (!change.after.exists()) {
      const before = change.before.val();
      if (before?.userId) {
        await db.ref(`registrationsByUser/${before.userId}/${regId}`).remove();
      }
      return;
    }

    const after = change.after.val();
    if (after?.userId) {
      await db.ref(`registrationsByUser/${after.userId}/${regId}`).set(true);
    }
  });

// Admin-only example: set a role for a user (for demo, guarded by a header key)
export const setUserRole = functions.https.onRequest(async (req, res) => {
  const key = req.headers["x-admin-key"] as string | undefined;
  if (key !== process.env.ADMIN_KEY) {
    res.status(403).json({ error: "forbidden" });
    return;
  }

  const { uid, role, enabled } = req.body || {};
  if (!uid || !role) {
    res.status(400).json({ error: "uid and role required" });
    return;
  }

  const db = admin.database();
  await db.ref(`roles/${uid}/${role}`).set(Boolean(enabled));
  res.status(200).json({ ok: true });
});
