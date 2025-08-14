// frontend/src/PaymentPage.js
import React from 'react';
import PurchaseMessages from './PurchaseMessages'; // Reuse the existing component

function PaymentPage({ prevStep, handleSubmit, values }) {
    return (
        <div>
            <h3>Payment</h3>

            <h4>Messaging Packages</h4>
            <PurchaseMessages />

            <hr />

            <h4>Registration Payment</h4>
            <div>
                <p><strong>Total Due:</strong> {/* Calculate total based on session price */}</p>
                
                <label>
                    <input type="checkbox" name="financialAid" />
                    I would like to request financial aid. (Admin will contact you)
                </label>

                <div>
                    <button>Make a Deposit ($100)</button>
                    <button>Pay in Full</button>
                    <button>Set Up a Payment Plan</button>
                </div>
                <p>All payments must be made one month before the camp session starts.</p>
            </div>

            <hr />

            <button onClick={prevStep}>Back to Medical & Safety</button>
            <button onClick={handleSubmit}>Complete Registration & Reserve Spot</button>
        </div>
    );
}

export default PaymentPage;
