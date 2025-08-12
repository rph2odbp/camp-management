// frontend/src/CamperMedicalRecord.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { doc, onSnapshot } from 'firebase/firestore';
import MedicalFiles from './MedicalFiles';
import HospitalVisitForm from './HospitalVisitForm'; // Import the form
import Charting from './Charting'; // A new component for charts

function CamperMedicalRecord({ camperId }) {
    const [camper, setCamper] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const docRef = doc(db, 'campers', camperId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setCamper({ id: docSnap.id, ...docSnap.data() });
            } else { setError('Camper data not found.'); }
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch camper details.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, [camperId]);

    if (loading) return <p>Loading details...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!camper) return null;

    return (
        <div style={{ padding: '15px' }}>
            <nav>
                <button onClick={() => setActiveTab('overview')}>Overview</button>
                <button onClick={() => setActiveTab('documents')}>Documents</button>
                <button onClick={() => setActiveTab('charting')}>Charting</button>
            </nav>
            <hr />
            {activeTab === 'overview' && (
                <div>
                    <h4>Medical Overview</h4>
                    <p><strong>Allergies:</strong> {camper.allergies || 'N/A'}</p>
                    <p><strong>Dietary Restrictions:</strong> {camper.dietaryRestrictions || 'N/A'}</p>
                    <p><strong>Medical History:</strong> {camper.medicalHistory || 'N/A'}</p>
                </div>
            )}
            {activeTab === 'documents' && (
                <MedicalFiles camperId={camperId} existingFiles={camper.otherMedicalFiles || []} />
            )}
            {activeTab === 'charting' && (
                <div>
                    <Charting camper={camper} />
                    <hr/>
                    <HospitalVisitForm camperId={camperId} camper={camper} />
                </div>
            )}
        </div>
    );
}

export default CamperMedicalRecord;
