import * as functions from 'firebase-functions';
import { Client, Config, CheckoutAPI } from '@adyen/api-library';

// Load config from Firebase environment variables
const ADYEN_API_KEY = functions.config().adyen?.api_key;
const ADYEN_MERCHANT_ACCOUNT = functions.config().adyen?.merchant_account;

if (!ADYEN_API_KEY || !ADYEN_MERCHANT_ACCOUNT) {
  throw new Error('Adyen API credentials are not set in Firebase Functions config.');
}

const config = new Config();
config.apiKey = ADYEN_API_KEY;
const client = new Client({ config });
client.setEnvironment('TEST'); // Change to 'LIVE' in production

const checkout = new CheckoutAPI(client);

// Cloud Function to create Adyen Payment Session
export const createAdyenPaymentSession = functions.https.onCall(async (data, context) => {
  // Optional: check authentication/authorization here
  // if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');

  const { amount, reference, returnUrl } = data;

  if (!amount || !reference || !returnUrl) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required payment session information.',
    );
  }

  try {
    const response = await checkout.paymentSession({
      amount: {
        currency: amount.currency,
        value: amount.value, // 1000 = 10.00
      },
      merchantAccount: ADYEN_MERCHANT_ACCOUNT,
      reference,
      returnUrl,
      // Add more Adyen parameters as needed
    });
    return response;
  } catch (error: any) {
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Adyen Payment Session Error',
    );
  }
});
