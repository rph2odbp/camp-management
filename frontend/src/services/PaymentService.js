// frontend/src/services/PaymentService.js
import { auth } from '../firebase-config';

const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-cloud-function-url'
  : 'http://localhost:5001/kateri-fbc/us-central1/api';

/**
 * Creates a Helcim hosted payment page session.
 * @param {object} pkg - The message package object.
 * @returns {Promise<object>} - The JSON response from the server, containing the paymentUrl.
 */
export const createHelcimSession = async (pkg) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User is not authenticated.');
  }

  const idToken = await user.getIdToken();

  const response = await fetch(`${BASE_URL}/payments/create-helcim-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ packageId: pkg.id }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.error?.message || 'Failed to create Helcim session.');
  }

  return response.json();
};
