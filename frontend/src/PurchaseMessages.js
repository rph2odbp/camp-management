import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase-config';
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';

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
        const user = auth.currentUser;
        if (!user) {
            setError('You must be logged in to purchase.');
            setIsPurchasing(null);
            return;
        }

        // --- Placeholder for real payment processing ---
        // In a real app, you would integrate with Stripe, PayPal, etc. here.
        // For now, we'll just simulate a successful payment.
        console.log(`Simulating payment for ${pkg.name} for user ${user.uid}`);
        
        try {
            // On successful "payment", add a document to the user's message_credits subcollection.
            const creditDocRef = doc(collection(db, 'users', user.uid, 'message_credits'));
            await setDoc(creditDocRef, {
                packageId: pkg.id,
                packageName: pkg.name,
                credits: pkg.credits,
                purchasedAt: serverTimestamp(),
            });
            alert(`Successfully purchased ${pkg.name}!`);
        } catch (err) {
            setError('Failed to update credits after purchase.');
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
                <div key={pkg.id}>
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
