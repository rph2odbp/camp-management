// frontend/src/SessionSelector.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

function SessionSelector({ onSessionSelect }) {
    const [sessions, setSessions] = useState([]);
    const [campers, setCampers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSession, setSelectedSession] = useState('');

    useEffect(() => {
        const sessionsQuery = query(collection(db, 'sessions'), orderBy('startDate'));
        const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
            setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (err) => { setError('Failed to fetch sessions.'); setLoading(false); });

        const unsubscribeCampers = onSnapshot(collection(db, 'campers'), (snapshot) => {
            setCampers(snapshot.docs.map(doc => doc.data()));
        });
        
        return () => { unsubscribeSessions(); unsubscribeCampers(); };
    }, []);

    const getSpotsLeft = (sessionId, capacity) => {
        const enrolledCount = campers.filter(c => 
            c.sessionRegistrations?.some(r => r.sessionId === sessionId && r.status === 'enrolled')
        ).length;
        return capacity - enrolledCount;
    };

    const handleProceed = () => {
        if (!selectedSession) {
            alert('Please select a session to begin registration.');
            return;
        }
        onSessionSelect(selectedSession);
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    };

    if (loading) return <p>Loading sessions...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h3>Step 1: Select a Session</h3>
            <p>Please choose the session you would like to register a camper for.</p>
            <select 
                className="select-auto-width"
                value={selectedSession} 
                onChange={(e) => setSelectedSession(e.target.value)}
            >
                <option value="">-- Choose a Session --</option>
                {sessions.map(session => {
                    const spotsLeft = getSpotsLeft(session.id, session.capacity);
                    const displayStatus = spotsLeft > 0 
                        ? `${spotsLeft} Openings`
                        : "Full - Register to be added to the wait list.";
                    
                    return (
                        <option key={session.id} value={session.id}>
                            {session.name} ({formatDate(session.startDate)}) - ({displayStatus})
                        </option>
                    );
                })}
            </select>
            <button onClick={handleProceed} style={{ marginLeft: '10px' }}>
                Begin Registration
            </button>
        </div>
    );
}

export default SessionSelector;
