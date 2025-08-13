import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import './SessionManagement.css';

// Helper function to format date strings from YYYY-MM-DD to MM/DD/YYYY
const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
};

function SessionManagement() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isEditing, setIsEditing] = useState(false);
    const [currentSession, setCurrentSession] = useState({ name: '', startDate: '', endDate: '', capacity: 0, gender: 'Co-ed' });

    useEffect(() => {
        // Query to order sessions by start date
        const sessionsQuery = query(collection(db, 'sessions'), orderBy('startDate'));
        
        const unsubscribe = onSnapshot(sessionsQuery, 
            (snapshot) => {
                const sessionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSessions(sessionsData);
                setLoading(false);
            },
            (err) => {
                setError('Failed to fetch sessions.');
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentSession({ ...currentSession, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentSession.name || !currentSession.startDate || !currentSession.endDate || currentSession.capacity <= 0) {
            setError('Please fill out all fields correctly.');
            return;
        }

        const dataToSave = {
            name: currentSession.name,
            startDate: currentSession.startDate,
            endDate: currentSession.endDate,
            capacity: Number(currentSession.capacity),
            gender: currentSession.gender
        };

        try {
            if (isEditing) {
                const sessionRef = doc(db, 'sessions', currentSession.id);
                await updateDoc(sessionRef, { ...dataToSave, lastUpdatedAt: serverTimestamp() });
            } else {
                await addDoc(collection(db, 'sessions'), { ...dataToSave, createdAt: serverTimestamp() });
            }
            resetForm();
        } catch (err) {
            setError('Failed to save session.');
        }
    };
    
    const handleEdit = (session) => {
        setIsEditing(true);
        setCurrentSession(session);
    };

    const handleDelete = async (sessionId) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            try {
                await deleteDoc(doc(db, 'sessions', sessionId));
            } catch (err) {
                setError('Failed to delete session.');
            }
        }
    };
    
    const resetForm = () => {
        setIsEditing(false);
        setCurrentSession({ name: '', startDate: '', endDate: '', capacity: 0, gender: 'Co-ed' });
        setError('');
    };

    if (loading) return <p>Loading sessions...</p>;

    return (
        <div className="session-management-container">
            <h3>{isEditing ? 'Edit Session' : 'Create New Session'}</h3>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit} className="session-form">
                <input type="text" name="name" value={currentSession.name} onChange={handleInputChange} placeholder="Session Name" required />
                <input type="date" name="startDate" value={currentSession.startDate} onChange={handleInputChange} required />
                <input type="date" name="endDate" value={currentSession.endDate} onChange={handleInputChange} required />
                <input type="number" name="capacity" value={currentSession.capacity} onChange={handleInputChange} placeholder="Capacity" required />
                <select name="gender" value={currentSession.gender} onChange={handleInputChange}>
                    <option value="Co-ed">Co-ed</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                <button type="submit">{isEditing ? 'Update' : 'Create'}</button>
                {isEditing && <button type="button" onClick={resetForm}>Cancel</button>}
            </form>

            <hr />

            <h3>Existing Sessions</h3>
            <div className="session-list">
                {sessions.map(session => (
                    <div key={session.id} className="session-item">
                        <h4>{session.name}</h4>
                        <p>Dates: {formatDate(session.startDate)} to {formatDate(session.endDate)}</p>
                        <p>Capacity: {session.capacity}</p>
                        <p>Gender: {session.gender}</p>
                        <div className="session-actions">
                            <button onClick={() => handleEdit(session)}>Edit</button>
                            <button onClick={() => handleDelete(session.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SessionManagement;
