import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, query, onSnapshot } from 'firebase/firestore';

function AllCampersList({ onSelectCamper }) {
    const [campers, setCampers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        const campersQuery = query(collection(db, 'campers'));
        const unsubscribe = onSnapshot(campersQuery, (snapshot) => {
            const campersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCampers(campersData);
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch campers.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <p>Loading all campers...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h3>All Campers</h3>
            <ul>
                {campers.map((camper) => (
                    <li key={camper.id} onClick={() => onSelectCamper(camper.id)}>
                        {camper.name} - <strong>Status:</strong> {camper.registrationStatus}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AllCampersList;
