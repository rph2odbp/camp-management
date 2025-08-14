import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, query, onSnapshot } from 'firebase/firestore';
import Charting from './Charting';

function MedicalStaffPanel() {
    const [campers, setCampers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCamper, setSelectedCamper] = useState(null);

    useEffect(() => {
        setLoading(true);
        const campersQuery = query(collection(db, 'campers'));
        const unsubscribe = onSnapshot(campersQuery, (snapshot) => {
            setCampers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

    if (loading) return <p>Loading campers...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    if (selectedCamper) {
        return (
            <div>
                <button onClick={() => setSelectedCamper(null)}>&larr; Back to Search</button>
                <h3>Medical Profile for {selectedCamper.name}</h3>
                <p><strong>Medical Conditions:</strong> {selectedCamper.medicalConditions || 'None'}</p>
                <p><strong>Medications:</strong> {selectedCamper.medications || 'None'}</p>
                <hr />
                <Charting camperId={selectedCamper.id} />
            </div>
        );
    }

    return (
        <div>
            <h2>Medical Panel</h2>
            <input
                type="text"
                placeholder="Search for a camper..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul>
                {filteredCampers.map(camper => (
                    <li key={camper.id} onClick={() => setSelectedCamper(camper)}>
                        {camper.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MedicalStaffPanel;
