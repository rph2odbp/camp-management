import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

function AccountingTab({ camper }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        const paymentsQuery = query(collection(db, `campers/${camper.id}/payments`), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(paymentsQuery, (snapshot) => {
            const paymentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPayments(paymentsData);
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch payments.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [camper.id]);

    if (loading) return <p>Loading payment history...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    const totalPaid = payments.reduce((acc, payment) => acc + payment.amount, 0);

    return (
        <div>
            <h4>Accounting Summary</h4>
            {payments.length > 0 ? (
                <>
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
                    <p><strong>Total Paid:</strong> ${totalPaid.toFixed(2)}</p>
                </>
            ) : (
                <p>No payment history yet.</p>
            )}
        </div>
    );
}

export default AccountingTab;
