import React, { useState } from 'react';
import BasicInfoPage from './BasicInfoPage';
import MedicalSafetyPage from './MedicalSafetyPage';
import PaymentPage from './PaymentPage';
import { db, auth } from './firebase-config';
import { collection, addDoc } from 'firebase/firestore';

function CamperRegistrationForm({ sessionId, isWaitlisted, onRegistrationComplete }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Basic Info
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        // Medical & Safety
        emergencyContactName: '',
        emergencyContactPhone: '',
        allergies: '',
        medications: '',
        // Payment Info (though we might handle this differently)
        paymentMethod: '', 
    });

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleChange = input => e => {
        setFormData({ ...formData, [input]: e.target.value });
    };

    const handleSubmit = async () => {
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to register a camper.");
            return;
        }

        if (!sessionId) {
            alert("No session selected. Please go back and select a session.");
            return;
        }

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
            if (onRegistrationComplete) {
                onRegistrationComplete();
            }
        } catch (error) {
            console.error("Error creating registration: ", error);
            alert("Failed to create registration. See console for details.");
        }
    };

    switch (step) {
        case 1:
            return (
                <BasicInfoPage
                    nextStep={nextStep}
                    handleChange={handleChange}
                    values={formData}
                />
            );
        case 2:
            return (
                <MedicalSafetyPage
                    nextStep={nextStep}
                    prevStep={prevStep}
                    handleChange={handleChange}
                    values={formData}
                />
            );
        case 3:
            return (
                <PaymentPage
                    prevStep={prevStep}
                    handleSubmit={handleSubmit}
                    isWaitlisted={isWaitlisted}
                />
            );
        default:
            return <div>Registration process finished or error.</div>;
    }
}

export default CamperRegistrationForm;