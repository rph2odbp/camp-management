// frontend/src/AddNoteForm.js
import React, { useState } from 'react';
import { db, auth } from './firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function AddNoteForm({ camperId }) {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!note.trim()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        const user = auth.currentUser;
        if (!user) {
            setError('You must be logged in to add a note.');
            setLoading(false);
            return;
        }

        try {
            const chartCollectionRef = collection(db, 'campers', camperId, 'chart');
            await addDoc(chartCollectionRef, {
                type: 'general_note',
                timestamp: serverTimestamp(),
                recordedBy: user.uid,
                note: note,
            });

            setSuccess('Note added successfully.');
            setNote('');
        } catch (err) {
            setError('Failed to add note.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h4>Add a General Note</h4>
            <form onSubmit={handleSubmit}>
                <textarea 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="E.g., 'Had a great attitude during the morning activity.'"
                    required
                    style={{ width: '100%', minHeight: '80px' }}
                />
                <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Note'}</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </form>
        </div>
    );
}

export default AddNoteForm;
