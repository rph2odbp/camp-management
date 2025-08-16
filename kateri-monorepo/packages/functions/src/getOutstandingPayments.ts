import * as functions from 'firebase-functions';

// Dummy function, replace with real DB logic
export const getOutstandingPayments = functions.https.onCall(async (data, context) => {
  const { parentId } = data;
  // Look up outstanding balance and session info for this parent
  return {
    outstanding: 50000, // in minor units, e.g. $500.00
    session: { id: 'sess123', name: 'Summer Camp', reference: 'parent123-camp2025' }
  };
});