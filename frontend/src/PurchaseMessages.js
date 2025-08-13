import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, onSnapshot } from 'firebase/firestore';
import { createHelcimSession } from './services/PaymentService';
import './PurchaseMessages.css'; // Import the CSS file

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
            const { paymentUrl } = await createHelcimSession(pkg);
            window.location.href = paymentUrl;
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setIsPurchasing(null);
        }
    };

    if (loading) return <p>Loading packages...</p>;

    return (
        <div className="purchase-messages-container">
            <h2>Purchase Message Credits</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="packages-list">
                {packages.map(pkg => (
                    <div key={pkg.id} className="package-item">
                        <h3>{pkg.name}</h3>
                        <p className="package-price">${pkg.price}</p>
                        <p className="package-credits">{pkg.credits} messages</p>
                        <button 
                            className="purchase-button"
                            onClick={() => handlePurchase(pkg)} 
                            disabled={isPurchasing === pkg.id}
                        >
                            {isPurchasing === pkg.id ? 'Processing...' : 'Purchase'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PurchaseMessages;
