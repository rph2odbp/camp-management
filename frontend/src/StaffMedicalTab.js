import React, { useState } from 'react';
import { db } from './firebase-config';
import { doc, updateDoc } from 'firebase/firestore';

function StaffMedicalTab({ staff }) {
    const [isEditing, setIsEditing] = useState(false);
    const [medicalData, setMedicalData] = useState({
        medicalConditions: staff.medicalConditions || '',
        allergies: staff.allergies || '',
        medications: staff.medications || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMedicalData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const staffRef = doc(db, 'staff', staff.id);
            await updateDoc(staffRef, medicalData);
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update medical information.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h4>Medical Information</h4>
            {isEditing ? (
                <form onSubmit={handleSave}>
                    <label>
                        Medical Conditions:
                        <textarea name="medicalConditions" value={medicalData.medicalConditions} onChange={handleChange} />
                    </label>
                    <label>
                        Allergies:
                        <textarea name="allergies" value={medicalData.allergies} onChange={handleChange} />
                    </label>
                    <label>
                        Current Medications:
                        <textarea name="medications" value={medicalData.medications} onChange={handleChange} />
                    </label>
                    <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                    <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </form>
            ) : (
                <div>
                    <p><strong>Medical Conditions:</strong> {staff.medicalConditions || 'N/A'}</p>
                    <p><strong>Allergies:</strong> {staff.allergies || 'N/A'}</p>
                    <p><strong>Current Medications:</strong> {staff.medications || 'N/A'}</p>
                    <button onClick={() => setIsEditing(true)}>Edit Medical Info</button>
                </div>
            )}
        </div>
    );
}

export default StaffMedicalTab;
