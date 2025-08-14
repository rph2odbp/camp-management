// frontend/src/MedicalPanel.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, onSnapshot } from 'firebase/firestore';
import CamperMedicalRecord from './CamperMedicalRecord'; // A new component for the detailed view

function MedicalPanel() {
    const [campers, setCampers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeCamperId, setActiveCamperId] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'campers'), (snapshot) => {
            const campersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCampers(campersData);
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch campers.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredCampers = campers.filter(camper =>
        camper.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleCamperView = (camperId) => {
        setActiveCamperId(activeCamperId === camperId ? null : camperId);
    };

    if (loading) return <p>Loading camper records...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h3>Camper Medical Records</h3>
            <input
                type="text"
                placeholder="Search for a camper by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <div>
                {filteredCampers.map(camper => (
                    <div key={camper.id} style={{ border: '1px solid #eee', marginBottom: '5px' }}>
                        <button onClick={() => toggleCamperView(camper.id)} style={{ width: '100%', textAlign: 'left', padding: '10px', background: '#f7f7f7' }}>
                            {camper.name}
                        </button>
                        {activeCamperId === camper.id && (
                            <CamperMedicalRecord camperId={camper.id} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MedicalPanel;
