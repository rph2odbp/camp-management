import React, { useEffect, useRef } from 'react';
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { AdyenCheckout } from '@adyen/adyen-web';

function AdyenDropIn({ paymentData, onPaymentResult }) {
  const dropinRef = useRef(null);

  useEffect(() => {
    async function setupDropIn() {
      // Call backend to get payment session
      const createSession = httpsCallable(functions, 'createAdyenPaymentSession');
      const response = await createSession(paymentData);

      const configuration = {
        environment: 'test', // switch to 'live' in production
        clientKey: response.data.clientKey, // from backend
        session: response.data.session, // from backend
        onPaymentCompleted: (result, component) => {
          onPaymentResult(result);
        },
        onError: (error, component) => {
          onPaymentResult({ error });
        },
      };

      const checkout = await AdyenCheckout(configuration);
      if (dropinRef.current) {
        checkout.create('dropin').mount(dropinRef.current);
      }
    }

    setupDropIn();
  }, [paymentData, onPaymentResult]);

  return <div ref={dropinRef} />;
}

export default AdyenDropIn;
