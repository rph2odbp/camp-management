import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { doc, onSnapshot } from 'firebase/firestore';
import StaffMedicalTab from './StaffMedicalTab';
// Placeholders for future components
const ParentGuardianInfoTab = ({ camper }) => <div>Parent/Guardian Info for {camper.name}</div>;
const NotesTab = ({ camper }) => <div>Notes for {camper.name}</div>;


function StaffCamperProfile({ camperId, onBack }) {
    const [camper, setCamper] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('personal');

    useEffect(() => {
        const camperRef = doc(db, 'campers', camperId);
        const unsubscribe = onSnapshot(camperRef, (docSnap) => {
            if (docSnap.exists()) {
                setCamper({ id: docSnap.id, ...docSnap.data() });
            } else {
                setError('Camper not found.');
            }
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch camper data.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [camperId]);

    if (loading) return <p>Loading camper profile...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!camper) return <p>No camper data available.</p>;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'personal':
                return (
                    <div>
                        <h4>Personal Information</h4>
                        <p><strong>Name:</strong> {camper.name}</p>
                        <p><strong>Date of Birth:</strong> {camper.dateOfBirth}</p>
                        {/* Add other personal details here */}
                    </div>
                );
            case 'medical':
                return <StaffMedicalTab camper={camper} />;
            case 'parent-guardian':
                return <ParentGuardianInfoTab camper={camper} />;
            case 'notes':
                return <NotesTab camper={camper} />;
            default:
                return null;
        }
    };

    return (
        <div>
            <button onClick={onBack}>&larr; Back to All Campers</button>
            <h3>Camper: {camper.name}</h3>
            <nav>
                <button onClick={() => setActiveTab('personal')}>Personal</button>
                <button onClick={() => setActiveTab('medical')}>Medical</button>
                <button onClick={() => setActiveTab('parent-guardian')}>Parent/Guardian</button>
                <button onClick={() => setActiveTab('notes')}>Notes</button>
            </nav>
            <hr />
            {renderTabContent()}
        </div>
    );
}

export default StaffCamperProfile;
