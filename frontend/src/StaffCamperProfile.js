// frontend/src/StaffCamperProfile.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { doc, onSnapshot } from 'firebase/firestore';
import AddNoteForm from './AddNoteForm';
import IncidentReportForm from './IncidentReportForm';
import Charting from './Charting'; // Reuse the charting component

function StaffCamperProfile({ camperId, onBack }) {
    const [camper, setCamper] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const docRef = doc(db, 'campers', camperId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setCamper({ id: docSnap.id, ...docSnap.data() });
            } else {
                setError('Camper data not found.');
            }
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch camper details.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, [camperId]);

    if (loading) return <p>Loading camper profile...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!camper) return null;

    return (
        <div>
            <button onClick={onBack}>&larr; Back to Cabin List</button>
            <h2>Profile: {camper.name}</h2>
            <p><strong>Date of Birth:</strong> {camper.dateOfBirth}</p>
            {/* Staff should only see limited info, not full medical history unless they have medical role */}
            <p><strong>Allergies:</strong> {camper.allergies || 'N/A'}</p>
            <p><strong>Dietary Restrictions:</strong> {camper.dietaryRestrictions || 'N/A'}</p>
            
            <hr />
            
            <AddNoteForm camperId={camperId} />
            
            <hr />
            
            <IncidentReportForm camperId={camperId} />
            
            <hr />
            
            {/* Display the camper's chart so staff can see recent notes/incidents */}
            <Charting camper={camper} />
        </div>
    );
}

export default StaffCamperProfile;
