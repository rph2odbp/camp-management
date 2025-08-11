import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase-config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

function Charting({ camperId }) {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!camperId) return;
        setLoading(true);
        const notesQuery = query(
            collection(db, `campers/${camperId}/chartNotes`),
            orderBy('timestamp', 'desc')
        );
        const unsubscribe = onSnapshot(notesQuery, 
            (snapshot) => {
                setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
            },
            (err) => {
                setError('Failed to fetch chart notes.');
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [camperId]);

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        try {
            await addDoc(collection(db, `campers/${camperId}/chartNotes`), {
                content: newNote,
                authorId: auth.currentUser.uid,
                authorName: auth.currentUser.displayName || auth.currentUser.email,
                timestamp: serverTimestamp()
            });
            setNewNote('');
        } catch (err) {
            setError('Failed to add note.');
        }
    };

    if (loading) return <p>Loading chart...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h4>Charting</h4>
            <form onSubmit={handleAddNote}>
                <textarea 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a new chart note..."
                    required
                />
                <button type="submit">Add Note</button>
            </form>
            <ul>
                {notes.map(note => (
                    <li key={note.id}>
                        <p>{note.content}</p>
                        <small>
                            By {note.authorName} on {note.timestamp?.toDate().toLocaleString()}
                        </small>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Charting;
