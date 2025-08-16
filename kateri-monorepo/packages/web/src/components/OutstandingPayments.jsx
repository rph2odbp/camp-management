import React from 'react';

function OutstandingPayments({ payments, onPay }) {
  return (
    <div>
      <h2>Outstanding Payments</h2>
      <ul>
        {payments.map((p) => (
          <li key={p.sessionId}>
            {p.sessionName}: ${p.outstanding / 100}
            <button onClick={() => onPay(p)}>Pay</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OutstandingPayments;