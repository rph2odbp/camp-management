import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { collection, onSnapshot } from 'firebase/firestore';

function EmploymentTab({ staff }) {
    const [sessions, setSessions] = useState([]);
    const [assignedSessions, setAssignedSessions] = useState(staff.assignedSessionIds || []);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        const unsubscribe = onSnapshot(collection(db, 'sessions'), (snapshot) => {
            setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch sessions.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSessionAssignment = async (sessionId, isAssigned) => {
        const staffRef = doc(db, 'staff', staff.id);
        try {
            if (isAssigned) {
                await updateDoc(staffRef, {
                    assignedSessionIds: arrayUnion(sessionId)
                });
                setAssignedSessions([...assignedSessions, sessionId]);
            } else {
                await updateDoc(staffRef, {
                    assignedSessionIds: arrayRemove(sessionId)
                });
                setAssignedSessions(assignedSessions.filter(id => id !== sessionId));
            }
        } catch (err) {
            setError('Failed to update session assignment.');
        }
    };

    if (loading) return <p>Loading sessions...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h4>Employment History & Assignments</h4>
            
            <h5>Assign to Upcoming Sessions</h5>
            {sessions.map(session => (
                <div key={session.id}>
                    <label>
                        <input
                            type="checkbox"
                            checked={assignedSessions.includes(session.id)}
                            onChange={(e) => handleSessionAssignment(session.id, e.target.checked)}
                        />
                        {session.name} ({session.startDate} to {session.endDate})
                    </label>
                </div>
            ))}

            <h5>Past Employment</h5>
            {/* This is a placeholder. A more robust implementation would store historical data separately. */}
            <p>No formal employment history is stored yet. Assigned sessions are live.</p>

        </div>
    );
}

export default EmploymentTab;
