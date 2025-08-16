import * as functions from 'firebase-functions';

export const adyenWebhook = functions.https.onRequest(async (req, res) => {
  const event = req.body;
  // Verify webhook signature here (see Adyen docs)
  // Update payment status in your database
  // Example: if (event.eventCode === 'AUTHORISATION' && event.success) { ... }
  res.status(200).send('[accepted]');
});