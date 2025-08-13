import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { db } from './firebase-config';
import { doc, updateDoc } from 'firebase/firestore';
import HospitalVisitForm from './HospitalVisitForm';

function MedicalTab({ camper }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editableMedical, setEditableMedical] = useState({
        medicalConditions: camper.medicalConditions || '',
        medications: camper.medications || '',
        allergies: camper.allergies || '',
        dietaryRestrictions: camper.dietaryRestrictions || '',
        canSwim: camper.canSwim || false,
        needsArmFloats: camper.needsArmFloats || false,
        sunscreenAck: camper.sunscreenAck || false,
        contagiousAck: camper.contagiousAck || false
    });
    const [error, setError] = useState('');
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditableMedical(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        const camperRef = doc(db, 'campers', camper.id);
        try {
            await updateDoc(camperRef, editableMedical);
            setIsEditing(false);
            setError('');
        } catch (err) {
            console.error("Error updating medical info:", err);
            setError('Failed to save medical information.');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError('');
    };

    return (
        <div>
            <h4>Medical & Safety Information</h4>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            {isEditing ? (
                <div>
                    <label>Medical Conditions:</label>
                    <textarea name="medicalConditions" value={editableMedical.medicalConditions} onChange={handleInputChange} />
                    
                    <label>Medications:</label>
                    <textarea name="medications" value={editableMedical.medications} onChange={handleInputChange} />
                    
                    <label>Allergies:</label>
                    <textarea name="allergies" value={editableMedical.allergies} onChange={handleInputChange} />

                    <label>Dietary Restrictions:</label>
                    <textarea name="dietaryRestrictions" value={editableMedical.dietaryRestrictions} onChange={handleInputChange} />
                    
                    <h4>Swimming</h4>
                    <label><input type="checkbox" name="canSwim" checked={editableMedical.canSwim} onChange={handleInputChange} /> Can swim in deep end</label>
                    <label><input type="checkbox" name="needsArmFloats" checked={editableMedical.needsArmFloats} onChange={handleInputChange} /> Needs arm floats</label>
                    
                    <h4>Acknowledgements</h4>
                    <label><input type="checkbox" name="sunscreenAck" checked={editableMedical.sunscreenAck} onChange={handleInputChange} /> Sunscreen agreement</label>
                    <label><input type="checkbox" name="contagiousAck" checked={editableMedical.contagiousAck} onChange={handleInputChange} /> Contagious illness agreement</label>
                    
                    <div>
                        <button onClick={handleSave}>Save</button>
                        <button onClick={handleCancel}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div>
                    <p><strong>Medical Conditions:</strong> {camper.medicalConditions || 'None provided'}</p>
                    <p><strong>Medications:</strong> {camper.medications || 'None provided'}</p>
                    <p><strong>Allergies:</strong> {camper.allergies || 'None provided'}</p>
                    <p><strong>Dietary Restrictions:</strong> {camper.dietaryRestrictions || 'None provided'}</p>
                    <h4>Swimming</h4>
                    <p>Can swim in deep end: {camper.canSwim ? 'Yes' : 'No'}</p>
                    <p>Needs arm floats: {camper.needsArmFloats ? 'Yes' : 'No'}</p>
                    <h4>Acknowledgements</h4>
                    <p>Sunscreen agreement: {camper.sunscreenAck ? 'Yes' : 'No'}</p>
                    <p>Contagious illness agreement: {camper.contagiousAck ? 'Yes' : 'No'}</p>
                    <button onClick={() => setIsEditing(true)}>Edit Medical Info</button>
                </div>
            )}

            <button onClick={handlePrint}>Print Hospital Visit Form</button>
            <div style={{ display: 'none' }}>
                <div ref={componentRef}>
                    <HospitalVisitForm camper={camper} />
                </div>
            </div>
        </div>
    );
}

export default MedicalTab;
