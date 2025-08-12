// frontend/src/CamperRegistrationForm.js
import React, { useState, useEffect } from 'react';
import BasicInfoPage from './BasicInfoPage';
import MedicalSafetyPage from './MedicalSafetyPage';
import PaymentPage from './PaymentPage';
import { db, auth } from './firebase-config';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Accept isWaitlisted as a prop now
function CamperRegistrationForm({ sessionId, isWaitlisted, onRegistrationComplete }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ /* ... */ });

    // The problematic useEffect has been removed.
    
    const handleSubmit = async () => {
        const user = auth.currentUser;
        if (!user) { /* ... */ return; }

        try {
            await addDoc(collection(db, 'campers'), {
                ...formData,
                parentId: user.uid,
                sessionRegistrations: [{
                    sessionId: sessionId,
                    status: isWaitlisted ? 'waitlisted' : 'enrolled',
                    registeredAt: new Date(),
                }],
                createdAt: new Date(),
            });
            alert(`Registration successful! ${isWaitlisted ? 'You have been added to the waitlist.' : ''}`);
            onRegistrationComplete();
        } catch (error) {
            console.error("Error creating registration: ", error);
            alert("Failed to create registration.");
        }
    };
    
    // ... (rest of the component remains the same)
}

export default CamperRegistrationForm;
