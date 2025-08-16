import * as functions from 'firebase-functions';
import { db } from '../firebase/firestoreSetup';

// Trigger for scheduled payment reminders
export const sendPaymentReminder = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  // Query balances and send reminders
});