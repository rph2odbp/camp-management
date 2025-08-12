import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, onSnapshot } from 'firebase/firestore';
import { createHelcimSession } from './services/PaymentService'; // Import the new service

function PurchaseMessages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPurchasing, setIsPurchasing] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'message_packages'), 
            (snapshot) => {
                const packagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPackages(packagesData);
                setLoading(false);
            },
            (err) => {
                setError('Failed to fetch packages.');
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const handlePurchase = async (pkg) => {
        setIsPurchasing(pkg.id);
        setError('');
        
        try {
            // 1. Create a Helcim session on the backend.
            const { paymentUrl } = await createHelcimSession(pkg);

            // 2. Redirect the user to the Helcim hosted payment page.
            window.location.href = paymentUrl;

        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setIsPurchasing(null);
        }
    };

    if (loading) return <p>Loading packages...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Purchase Message Credits</h2>
            {packages.map(pkg => (
                <div key={pkg.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                    <h3>{pkg.name}</h3>
                    <p>${pkg.price} for {pkg.credits} messages</p>
                    <button onClick={() => handlePurchase(pkg)} disabled={isPurchasing === pkg.id}>
                        {isPurchasing === pkg.id ? 'Processing...' : 'Purchase'}
                    </button>
                </div>
            ))}
        </div>
    );
}

export default PurchaseMessages;
