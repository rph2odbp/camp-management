import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, onSnapshot } from 'firebase/firestore';

function Dashboard() {
    const [campers, setCampers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        const unsubCampers = onSnapshot(collection(db, 'campers'), 
            (snapshot) => setCampers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
            (err) => setError('Failed to fetch campers.')
        );

        const unsubSessions = onSnapshot(collection(db, 'sessions'),
            (snapshot) => {
                setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
            },
            (err) => {
                setError('Failed to fetch sessions.');
                setLoading(false);
            }
        );

        return () => {
            unsubCampers();
            unsubSessions();
        };
    }, []);

    if (loading) return <p>Loading dashboard data...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    // Calculations
    const totalCampers = campers.length;
    const statusCounts = campers.reduce((acc, camper) => {
        acc[camper.registrationStatus] = (acc[camper.registrationStatus] || 0) + 1;
        return acc;
    }, {});

    const sessionOccupancy = sessions.map(session => {
        const enrolled = campers.filter(c => c.enrolledSessionIds?.includes(session.id)).length;
        return { ...session, enrolled };
    });
    
    return (
        <div>
            <h2>Camp Dashboard</h2>

            <section>
                <h4>Overall Registration</h4>
                <p>Total Campers: {totalCampers}</p>
                <ul>
                    {Object.entries(statusCounts).map(([status, count]) => (
                        <li key={status}>{status}: {count}</li>
                    ))}
                </ul>
            </section>

            <section>
                <h4>Session Occupancy</h4>
                {sessionOccupancy.map(session => (
                    <div key={session.id}>
                        <p>{session.name}: {session.enrolled} / {session.capacity}</p>
                    </div>
                ))}
            </section>
        </div>
    );
}

export default Dashboard;
