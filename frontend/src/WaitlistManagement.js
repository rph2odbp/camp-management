// frontend/src/WaitlistManagement.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

function WaitlistManagement() {
    const [sessions, setSessions] = useState([]);
    const [campers, setCampers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubSessions = onSnapshot(collection(db, 'sessions'), snapshot => {
            setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubCampers = onSnapshot(collection(db, 'campers'), snapshot => {
            setCampers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        setLoading(false);
        return () => { unsubSessions(); unsubCampers(); };
    }, []);
    
    const handleEnroll = async (camper, sessionId) => {
        const camperRef = doc(db, 'campers', camper.id);
        const updatedRegistrations = camper.sessionRegistrations.map(reg => 
            reg.sessionId === sessionId ? { ...reg, status: 'enrolled' } : reg
        );
        await updateDoc(camperRef, { sessionRegistrations: updatedRegistrations });
        alert(`${camper.firstName} has been enrolled.`);
    };

    if (loading) return <p>Loading waitlists...</p>;

    return (
        <div>
            <h3>Waitlist Management</h3>
            {sessions.map(session => {
                const waitlistedCampers = campers
                    .filter(c => c.sessionRegistrations?.some(r => r.sessionId === session.id && r.status === 'waitlisted'))
                    .sort((a, b) => {
                        const regA = a.sessionRegistrations.find(r => r.sessionId === session.id);
                        const regB = b.sessionRegistrations.find(r => r.sessionId === session.id);
                        return regA.registeredAt.toDate() - regB.registeredAt.toDate();
                    });

                return (
                    <div key={session.id}>
                        <h4>{session.name} Waitlist</h4>
                        {waitlistedCampers.length > 0 ? (
                            <ol>
                                {waitlistedCampers.map((camper, index) => (
                                    <li key={camper.id}>
                                        {index + 1}. {camper.firstName} {camper.lastName}
                                        <button onClick={() => handleEnroll(camper, session.id)}>Enroll Camper</button>
                                    </li>
                                ))}
                            </ol>
                        ) : <p>No campers on the waitlist for this session.</p>}
                    </div>
                );
            })}
        </div>
    );
}

export default WaitlistManagement;
