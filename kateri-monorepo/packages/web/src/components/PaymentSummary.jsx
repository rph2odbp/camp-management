import React from 'react';

function PaymentSummary({ session, outstanding, onSelectPlan }) {
  // Example plans: deposit, full, custom payment
  const depositAmount = Math.round(outstanding * 0.2);
  return (
    <div>
      <h2>Payment Summary</h2>
      <p>Outstanding Balance: ${outstanding / 100}</p>
      <div>
        <button onClick={() => onSelectPlan({ type: 'deposit', amount: depositAmount })}>
          Pay Deposit (${depositAmount / 100})
        </button>
        <button onClick={() => onSelectPlan({ type: 'full', amount: outstanding })}>
          Pay Full Amount (${outstanding / 100})
        </button>
        {/* Add more custom plans if needed */}
      </div>
    </div>
  );
}

export default PaymentSummary;
