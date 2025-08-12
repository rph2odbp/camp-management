// frontend/src/MedicalSafetyPage.js
import React, { useState } from 'react';
import LegalTermsModal from './LegalTermsModal';

function MedicalSafetyPage({ nextStep, prevStep, handleChange, values }) {
    const [medications, setMedications] = useState(values.medications || [{ name: '', dosage: '', time: 'morning' }]);
    const [showLegalModal, setShowLegalModal] = useState(false);
    const [termsAcknowledged, setTermsAcknowledged] = useState(false);

    const handleMedicationChange = (index, field, value) => {
        const newMeds = [...medications];
        newMeds[index][field] = value;
        setMedications(newMeds);
        // Pass the entire array up to the main form's state
        handleChange({ target: { name: 'medications', value: newMeds }});
    };

    const addMedication = () => {
        setMedications([...medications, { name: '', dosage: '', time: 'morning' }]);
    };
    
    const handleAcknowledgeTerms = () => {
        setTermsAcknowledged(true);
        setShowLegalModal(false);
    };

    const handleSign = () => {
        if (!values.eSignature) {
            alert('Please provide your full name as an electronic signature.');
            return;
        }
        alert('Thank you for signing.');
    };

    return (
        <div>
            {showLegalModal && <LegalTermsModal onAcknowledge={handleAcknowledgeTerms} />}
            <h3>Medical, Safety, and Legal</h3>
            
            <label>Medical Conditions: <textarea value={values.medicalConditions || ''} onChange={handleChange('medicalConditions')} /></label>
            
            <h4>Medications</h4>
            {medications.map((med, index) => (
                <div key={index}>
                    <input type="text" placeholder="Medication Name" value={med.name} onChange={(e) => handleMedicationChange(index, 'name', e.target.value)} />
                    <input type="text" placeholder="Dosage" value={med.dosage} onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)} />
                    <select value={med.time} onChange={(e) => handleMedicationChange(index, 'time', e.target.value)}>
                        <option value="morning">Morning</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="bedtime">Before Bedtime</option>
                    </select>
                </div>
            ))}
            <button type="button" onClick={addMedication}>Add Another Medication</button>

            <label>Other Medical Notes: <textarea value={values.otherMedicalNotes || ''} onChange={handleChange('otherMedicalNotes')} /></label>

            <h4>Emergency Contacts</h4>
            <label>Contact 1 Name: <input type="text" value={values.emergencyContact1Name || ''} onChange={handleChange('emergencyContact1Name')} required /></label>
            <label>Contact 1 Phone: <input type="tel" value={values.emergencyContact1Phone || ''} onChange={handleChange('emergencyContact1Phone')} required /></label>
            <br />
            <label>Contact 2 Name: <input type="text" value={values.emergencyContact2Name || ''} onChange={handleChange('emergencyContact2Name')} /></label>
            <label>Contact 2 Phone: <input type="tel" value={values.emergencyContact2Phone || ''} onChange={handleChange('emergencyContact2Phone')} /></label>
            
            <h4>Camper Departure</h4>
            <label>List anyone with permission to pick up your camper: <textarea value={values.pickupPermissions || ''} onChange={handleChange('pickupPermissions')} /></label>
            <label>Is there anyone who MUST NOT be allowed to pick up your camper? <input type="text" placeholder="List names here" value={values.pickupRestrictions || ''} onChange={handleChange('pickupRestrictions')} /></label>

            <h4>Acknowledgements</h4>
            <div>
                <p>Knowing your camper's swimming ability, do you feel that your child should wear a bracelet and not swim in the deep end of the pool?</p>
                <label><input type="radio" name="deepEndRestriction" value="yes" checked={values.deepEndRestriction === 'yes'} onChange={handleChange('deepEndRestriction')} required /> Yes</label>
                <label><input type="radio" name="deepEndRestriction" value="no" checked={values.deepEndRestriction === 'no'} onChange={handleChange('deepEndRestriction')} required /> No</label>
            </div>
            <br/>
            <div>
                <label><input type="checkbox" checked={values.armFloatsAck || false} onChange={handleChange('armFloatsAck')} required /> If you camper needs arm floats you will provide them.</label>
            </div>
            <div>
                <label><input type="checkbox" checked={values.sunscreenAck || false} onChange={handleChange('sunscreenAck')} required /> Please check here to indicate that you understand that you must provide a bottle of sunscreen with an SPF of 15 or greater for your child.</label>
            </div>
            <div>
                <label><input type="checkbox" checked={values.illnessAck || false} onChange={handleChange('illnessAck')} required /> Please check here to indicate that you understand that your child will be kept out of the pool if (s)he has a fever, flu like symptoms, cold, upset stomach, diarrhea, pink eye, runny nose, hepatitis A, or other contagious illness.</label>
            </div>

            <h4>Legal Terms</h4>
            <button type="button" onClick={() => setShowLegalModal(true)}>Read and Acknowledge Legal Terms</button>

            {termsAcknowledged && (
                <div style={{ marginTop: '10px' }}>
                    <label>Electronic Signature (Full Name):
                        <input type="text" value={values.eSignature || ''} onChange={handleChange('eSignature')} required placeholder="Enter your full name" />
                    </label>
                    <button type="button" onClick={handleSign}>Sign</button>
                </div>
            )}
            
            <div style={{ marginTop: '20px' }}>
                <button onClick={prevStep}>Back to Basic Info</button>
                <button onClick={nextStep} disabled={!termsAcknowledged || !values.eSignature}>Next: Payment</button>
            </div>
        </div>
    );
}

export default MedicalSafetyPage;
