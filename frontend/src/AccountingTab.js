import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, query, onSnapshot, orderBy, doc } from 'firebase/firestore';

function AccountingTab({ camper }) {
    const [payments, setPayments] = useState([]);
    const [totalCharges, setTotalCharges] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);

        // Fetch camper document for total charges
        const camperRef = doc(db, 'campers', camper.id);
        const unsubCamper = onSnapshot(camperRef, (docSnap) => {
            if (docSnap.exists()) {
                setTotalCharges(docSnap.data().totalCharges || 0);
            }
        });

        const paymentsQuery = query(collection(db, `campers/${camper.id}/payments`), orderBy('createdAt', 'desc'));
        const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
            const paymentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPayments(paymentsData);
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch payments.');
            setLoading(false);
        });

        return () => {
            unsubCamper();
            unsubPayments();
        };
    }, [camper.id]);

    if (loading) return <p>Loading payment history...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    const totalPaid = payments.reduce((acc, payment) => acc + payment.amount, 0);
    const balance = totalCharges - totalPaid;

    return (
        <div>
            <h4>Accounting Summary</h4>
            <div className="accounting-summary">
                <p><strong>Total Charges:</strong> ${totalCharges.toFixed(2)}</p>
                <p><strong>Total Paid:</strong> ${totalPaid.toFixed(2)}</p>
                <p><strong>Balance Due:</strong> ${balance.toFixed(2)}</p>
            </div>
            
            {payments.length > 0 ? (
                <>
                    <h4>Payment History</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(payment => (
                                <tr key={payment.id}>
                                    <td>{payment.createdAt?.toDate().toLocaleDateString()}</td>
                                    <td>{payment.type}</td>
                                    <td>${payment.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : (
                <p>No payment history yet.</p>
            )}
        </div>
    );
}

export default AccountingTab;
