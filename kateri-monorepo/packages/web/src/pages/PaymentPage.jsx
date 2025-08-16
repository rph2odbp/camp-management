import React, { useState, useContext } from 'react';
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import PaymentSummary from '../components/PaymentSummary';
import AdyenDropIn from '../components/AdyenDropIn';
import PaymentResult from '../components/PaymentResult';
import { PaymentContext } from '../context/PaymentContext';

function PaymentPage() {
  const { outstanding, session } = useContext(PaymentContext); // Provided by ParentPortal
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePaymentSubmit = async (paymentData) => {
    setLoading(true);
    setPaymentResult(null);
    try {
      const createSession = httpsCallable(functions, 'createAdyenPaymentSession');
      const response = await createSession(paymentData);
      setPaymentResult(response.data);
      // You may want to redirect to Adyen's payment page or use Drop-in here
    } catch (error) {
      setPaymentResult({ error: error.message || 'Payment failed' });
    }
    setLoading(false);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setPaymentResult(null);
  };

  const handleDropInPaymentResult = (result) => {
    setPaymentResult(result);
    // Optionally update backend/database here
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto' }}>
      {!selectedPlan && (
        <PaymentSummary
          session={session}
          outstanding={outstanding}
          onSelectPlan={handleSelectPlan}
        />
      )}
      {selectedPlan && (
        <AdyenDropIn
          paymentData={{
            amount: { value: selectedPlan.amount, currency: 'USD' },
            reference: session.reference,
            returnUrl: window.location.origin + '/parent/payment-result',
          }}
          onPaymentResult={handleDropInPaymentResult}
        />
      )}
      {paymentResult && <PaymentResult result={paymentResult} />}
      {/* If you want to keep the classic form as a fallback: */}
      {!selectedPlan && (
        <>
          <hr />
          <h3>Or enter a custom payment below:</h3>
          <PaymentForm onSubmit={handlePaymentSubmit} loading={loading} />
        </>
      )}
    </div>
  );
}

export default PaymentPage;
