import React, { useState } from 'react';

function PaymentForm({ onSubmit, loading }) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [reference, setReference] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      amount: {
        value: Math.round(parseFloat(amount) * 100), // convert to minor units
        currency,
      },
      reference,
      returnUrl: window.location.origin + '/payment-result',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Make a Payment</h2>
      <label>
        Amount:
        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
      </label>
      <label>
        Currency:
        <select value={currency} onChange={e => setCurrency(e.target.value)}>
          <option value="USD">USD</option>
          {/* Add more currencies if needed */}
        </select>
      </label>
      <label>
        Reference:
        <input type="text" value={reference} onChange={e => setReference(e.target.value)} required />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Pay'}
      </button>
    </form>
  );
}

export default PaymentForm;