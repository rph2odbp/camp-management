import React from 'react';

function PaymentResult({ result }) {
  if (!result) return null;
  return (
    <div>
      <h2>Payment Result</h2>
      <pre>{JSON.stringify(result, null, 2)}</pre>
      {/* You might want to display a success/failure message based on result */}
    </div>
  );
}

export default PaymentResult;