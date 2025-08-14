import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase-config';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import './NotesTab.css';

function NotesTab({ camper }) {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        const notesQuery = query(
            collection(db, `campers/${camper.id}/notes`),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
            const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotes(notesData);
            setLoading(false);
        }, (err) => {
            console.error("Failed to fetch notes:", err);
            setError('Failed to load notes.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [camper.id]);

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) {
            setError('Note cannot be empty.');
            return;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
            setError('You must be logged in to add notes.');
            return;
        }

        try {
            await addDoc(collection(db, `campers/${camper.id}/notes`), {
                content: newNote,
                authorId: currentUser.uid,
                authorName: currentUser.displayName || 'Staff', // Or fetch from a 'users' collection
                createdAt: serverTimestamp(),
            });
            setNewNote('');
            setError('');
        } catch (err) {
            console.error("Error adding note:", err);
            setError('Failed to save note.');
        }
    };
    
    if (loading) return <p>Loading notes...</p>;

    return (
        <div className="notes-tab-container">
            <h4>Internal Staff Notes</h4>
            {error && <p className="error-message">{error}</p>}
            
            <form onSubmit={handleAddNote} className="note-form">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={`Add a new note for ${camper.name}...`}
                    rows="4"
                />
                <button type="submit">Save Note</button>
            </form>

            <div className="notes-list">
                {notes.length > 0 ? (
                    notes.map(note => (
                        <div key={note.id} className="note-item">
                            <p className="note-content">{note.content}</p>
                            <small className="note-meta">
                                By {note.authorName} on {note.createdAt?.toDate().toLocaleString()}
                            </small>
                        </div>
                    ))
                ) : (
                    <p>No notes for this camper yet.</p>
                )}
            </div>
        </div>
    );
}

export default NotesTab;
