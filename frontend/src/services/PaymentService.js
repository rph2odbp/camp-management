// frontend/src/services/PaymentService.js
import { db } from '../firebase-config';
import { doc, runTransaction, serverTimestamp, collection, addDoc } from 'firebase/firestore';

/**
 * Simulates processing a deposit payment for a camper.
 * @param {string} camperId - The ID of the camper.
 * @param {number} amount - The amount of the deposit.
 * @returns {Promise<void>}
 */
export const processDepositPayment = async (camperId, amount) => {
    // In a real application, you would integrate with a payment gateway here.
    console.log(`Simulating deposit payment of $${amount} for camper ${camperId}`);

    try {
        await runTransaction(db, async (transaction) => {
            const camperRef = doc(db, "campers", camperId);
            const paymentRef = doc(collection(db, `campers/${camperId}/payments`));

            transaction.update(camperRef, { registrationStatus: "active" });
            transaction.set(paymentRef, {
                amount: amount,
                type: 'deposit',
                createdAt: serverTimestamp()
            });
        });
        alert('Deposit paid successfully! Your spot is reserved.');
    } catch (error) {
        console.error("Deposit payment failed: ", error);
        alert('Deposit payment failed. Please try again.');
        throw error; // Re-throw the error to be handled by the caller
    }
};

/**
 * Simulates processing a general payment for a camper.
 * @param {string} camperId - The ID of the camper.
 * @param {number} amount - The amount of the payment.
 * @param {string} type - The type of payment (e.g., 'full', 'installment').
 * @returns {Promise<void>}
 */
export const processCamperPayment = async (camperId, amount, type = 'payment') => {
    // In a real application, you would integrate with a payment gateway here.
    console.log(`Simulating ${type} payment of $${amount} for camper ${camperId}`);

    try {
        const paymentRef = collection(db, `campers/${camperId}/payments`);
        await addDoc(paymentRef, {
            amount: amount,
            type: type,
            createdAt: serverTimestamp()
        });
        alert('Payment successful!');
    } catch (error) {
        console.error("Payment failed: ", error);
        alert('Payment failed. Please try again.');
        throw error; // Re-throw the error to be handled by the caller
    }
};
