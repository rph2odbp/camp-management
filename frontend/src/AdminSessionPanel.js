import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, query, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';

function AdminSessionPanel() {
    const [sessions, setSessions] = useState([]);
    const [campers, setCampers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for the "Add New Session" form
    const [newSessionName, setNewSessionName] = useState('');
    const [newSessionStartDate, setNewSessionStartDate] = useState('');
    const [newSessionEndDate, setNewSessionEndDate] = useState('');
    const [newSessionCapacity, setNewSessionCapacity] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // State for the "Edit Session" form
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', startDate: '', endDate: '', capacity: '' });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        setLoading(true);
        const sessionsQuery = query(collection(db, 'sessions'));
        const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
            const sessionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSessions(sessionsData);
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch sessions.');
            setLoading(false);
        });

        const campersQuery = query(collection(db, 'campers'));
        const unsubscribeCampers = onSnapshot(campersQuery, (snapshot) => {
            const campersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCampers(campersData);
        }, (err) => {
            setError('Failed to fetch campers.');
        });

        return () => {
            unsubscribeSessions();
            unsubscribeCampers();
        };
    }, []);

    const handleAddSession = async (e) => {
        e.preventDefault();
        if (!newSessionName || !newSessionStartDate || !newSessionEndDate || !newSessionCapacity) {
            alert('Please fill in all fields.');
            return;
        }
        setIsAdding(true);
        try {
            await addDoc(collection(db, 'sessions'), {
                name: newSessionName,
                startDate: newSessionStartDate,
                endDate: newSessionEndDate,
                capacity: parseInt(newSessionCapacity, 10),
            });
            setNewSessionName('');
            setNewSessionStartDate('');
            setNewSessionEndDate('');
            setNewSessionCapacity('');
        } catch (err) {
            setError('Failed to add session.');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteSession = async (sessionId) => {
        if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
            try {
                await deleteDoc(doc(db, 'sessions', sessionId));
            } catch (err) {
                setError('Failed to delete session.');
            }
        }
    };

    const handleEditClick = (session) => {
        setEditingSessionId(session.id);
        setEditFormData({ name: session.name, startDate: session.startDate, endDate: session.endDate, capacity: session.capacity });
    };

    const handleUpdateSession = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const sessionDocRef = doc(db, 'sessions', editingSessionId);
            await updateDoc(sessionDocRef, {
                ...editFormData,
                capacity: parseInt(editFormData.capacity, 10),
            });
            setEditingSessionId(null);
        } catch (err) {
            setError('Failed to update session.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <p>Loading sessions...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Session Management</h2>

            {/* Edit Session Form (conditionally rendered) */}
            {editingSessionId && (
                <form onSubmit={handleUpdateSession}>
                    <h3>Edit Session</h3>
                    <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} placeholder="Session Name" required />
                    <input type="date" value={editFormData.startDate} onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })} required />
                    <input type="date" value={editFormData.endDate} onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })} required />
                    <input type="number" value={editFormData.capacity} onChange={(e) => setEditFormData({ ...editFormData, capacity: e.target.value })} placeholder="Capacity" required />
                    <button type="submit" disabled={isUpdating}>{isUpdating ? 'Updating...' : 'Update Session'}</button>
                    <button type="button" onClick={() => setEditingSessionId(null)}>Cancel</button>
                </form>
            )}

            {/* Add New Session Form */}
            {!editingSessionId && (
                <form onSubmit={handleAddSession}>
                    <h3>Add New Session</h3>
                    <input type="text" value={newSessionName} onChange={(e) => setNewSessionName(e.target.value)} placeholder="Session Name" required />
                    <input type="date" value={newSessionStartDate} onChange={(e) => setNewSessionStartDate(e.target.value)} required />
                    <input type="date" value={newSessionEndDate} onChange={(e) => setNewSessionEndDate(e.target.value)} required />
                    <input type="number" value={newSessionCapacity} onChange={(e) => setNewSessionCapacity(e.target.value)} placeholder="Capacity" required />
                    <button type="submit" disabled={isAdding}>{isAdding ? 'Adding...' : 'Add Session'}</button>
                </form>
            )}

            {/* Session List */}
            <ul>
                {sessions.map(session => {
                    const enrolledCount = campers.filter(c => c.enrolledSessionIds?.includes(session.id)).length;
                    return (
                        <li key={session.id}>
                            <p><strong>{session.name}</strong> ({session.startDate} to {session.endDate})</p>
                            <p>Capacity: {enrolledCount} / {session.capacity}</p>
                            <button onClick={() => handleEditClick(session)}>Edit</button>
                            <button onClick={() => handleDeleteSession(session.id)}>Delete</button>
                            <h4>Enrolled Campers:</h4>
                            <ul>
                                {campers.filter(c => c.enrolledSessionIds?.includes(session.id)).map(enrolledCamper => (
                                    <li key={enrolledCamper.id}>{enrolledCamper.name}</li>
                                ))}
                            </ul>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default AdminSessionPanel;
