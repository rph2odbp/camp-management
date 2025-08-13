import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase-config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

function CamperList({ onSelectCamper }) {
    const [campers, setCampers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'campers'), where('parentId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const campersData = [];
            querySnapshot.forEach((doc) => {
                campersData.push({ id: doc.id, ...doc.data() });
            });
            setCampers(campersData);
            setLoading(false);
        }, (err) => {
            console.error("Failed to fetch campers:", err);
            setError('Failed to load camper data.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return <p>Loading your campers...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div>
            <h2>My Campers</h2>
            {campers.length === 0 ? (
                <p>You have not registered any campers yet.</p>
            ) : (
                <ul>
                    {campers.map((camper) => {
                        const enrolledSessions = camper.sessionRegistrations
                            ?.filter(r => r.status === 'enrolled')
                            .map(r => r.sessionId) || [];
                        
                        const waitlistedSessions = camper.sessionRegistrations
                            ?.filter(r => r.status === 'waitlisted')
                            .map(r => r.sessionId) || [];

                        return (
                            <li key={camper.id}>
                                <h3>{camper.firstName} {camper.lastName}</h3>
                                <p><strong>Enrolled Sessions:</strong> {enrolledSessions.join(', ') || 'None'}</p>
                                <p><strong>Waitlisted Sessions:</strong> {waitlistedSessions.join(', ') || 'None'}</p>
                                <button onClick={() => onSelectCamper(camper.id)}>View Profile</button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default CamperList;