
import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase-config';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import EditCamperForm from './EditCamperForm';

function CamperList({ view = 'parent', staffId = null, onSelectCamper }) {
    const [campers, setCampers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingCamperId, setEditingCamperId] = useState(null);
    const [selectedSessions, setSelectedSessions] = useState({});

    useEffect(() => {
        const user = auth.currentUser;
        if (!user && view === 'parent') {
            setCampers([]);
            setLoading(false);
            return;
        }

        let campersQuery;
        if (view === 'staff' && staffId) {
            // Staff view: Fetch campers assigned to this staff member
            // This assumes a camper document has a field `assignedStaff` which is an array of staff IDs.
            campersQuery = query(collection(db, 'campers'), where('assignedStaff', 'array-contains', staffId));
        } else {
            // Parent view: Fetch campers belonging to the logged-in parent
            campersQuery = query(collection(db, 'campers'), where('parentId', '==', user.uid));
        }
        
        const unsubscribeCampers = onSnapshot(campersQuery, (querySnapshot) => {
            const campersData = [];
            const initialSelectedSessions = {};
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                campersData.push({ id: doc.id, ...data });
                initialSelectedSessions[doc.id] = data.enrolledSessionIds || [];
            });
            setCampers(campersData);
            setSelectedSessions(initialSelectedSessions);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching campers: ", err);
            setError('Error fetching campers.');
            setLoading(false);
        });

        // Fetch Sessions
        const sessionsQuery = query(collection(db, 'sessions'));
        const unsubscribeSessions = onSnapshot(sessionsQuery, (querySnapshot) => {
            const sessionsData = [];
            querySnapshot.forEach((doc) => {
                sessionsData.push({ id: doc.id, ...doc.data() });
            });
            setSessions(sessionsData);
        }, (err) => {
            console.error("Error fetching sessions: ", err);
            setError('Error fetching sessions.');
        });

        return () => {
            unsubscribeCampers();
            unsubscribeSessions();
        };
    }, [view, staffId]);

    const handleSessionSelect = (camperId, sessionId, isSelected) => {
        setSelectedSessions(prev => {
            const currentSessions = prev[camperId] || [];
            if (isSelected) {
                return { ...prev, [camperId]: [...currentSessions, sessionId] };
            } else {
                return { ...prev, [camperId]: currentSessions.filter(id => id !== sessionId) };
            }
        });
    };

    const handleSaveSessions = async (camperId) => {
        try {
            const docRef = doc(db, 'campers', camperId);
            await updateDoc(docRef, {
                enrolledSessionIds: selectedSessions[camperId] || []
            });
            alert("Sessions updated successfully!");
        } catch (e) {
            console.error("Error updating sessions: ", e);
            setError('Error updating sessions.');
        }
    };

    const handleDeleteClick = async (camperId) => {
        if (window.confirm('Are you sure you want to delete this camper?')) {
            try {
                await deleteDoc(doc(db, 'campers', camperId));
            } catch (e) {
                setError('Error deleting camper.');
            }
        }
    };

    if (loading) return <p>Loading campers...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    if (editingCamperId) {
        return <EditCamperForm camperId={editingCamperId} onCancel={() => setEditingCamperId(null)} />;
    }

    if (campers.length === 0) {
        return view === 'parent' 
            ? <p>You have not added any campers yet.</p>
            : <p>No campers are currently assigned to you.</p>;
    }

    return (
        <div>
            <h2>{view === 'parent' ? 'My Campers' : 'Assigned Campers'}</h2>
            <ul>
                {campers.map((camper) => (
                    <li key={camper.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>{camper.name} (DOB: {camper.dateOfBirth})</h3>
                            <div>
                                <button onClick={() => onSelectCamper(camper.id)}>View Profile</button>
                                {view === 'parent' && (
                                    <>
                                        <button onClick={() => setEditingCamperId(camper.id)}>Edit</button>
                                        <button onClick={() => handleDeleteClick(camper.id)}>Delete</button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div>
                            <h4>Enrolled Sessions:</h4>
                            {camper.enrolledSessionIds && camper.enrolledSessionIds.length > 0 ? (
                                <ul>
                                    {camper.enrolledSessionIds.map(sessionId => {
                                        const session = sessions.find(s => s.id === sessionId);
                                        return session ? <li key={sessionId}>{session.name}</li> : null;
                                    })}
                                </ul>
                            ) : <p>Not enrolled in any sessions.</p>}
                        </div>

                        {view === 'parent' && (
                            <div>
                                <h4>Register for Sessions:</h4>
                                {sessions.length > 0 ? (
                                    sessions.map((session) => (
                                        <label key={session.id} style={{ display: 'block' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedSessions[camper.id]?.includes(session.id) || false}
                                                onChange={(e) => handleSessionSelect(camper.id, session.id, e.target.checked)}
                                            />
                                            {session.name} ({session.startDate} - {session.endDate})
                                        </label>
                                    ))
                                ) : <p>No sessions available to register.</p>}
                                <button onClick={() => handleSaveSessions(camper.id)} style={{ marginTop: '0.5rem' }}>Save Session Registrations</button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CamperList;
