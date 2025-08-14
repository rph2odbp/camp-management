import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase-config';
import { collection, serverTimestamp, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';

function BroadcastMessageForm() {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState('all'); // 'all' or a session ID
    const [messageContent, setMessageContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchSessions = async () => {
            const sessionsSnapshot = await getDocs(collection(db, 'sessions'));
            setSessions(sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchSessions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!messageContent.trim()) {
            setError('Please write a message.');
            return;
        }
        
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            let campersQuery;
            if (selectedSession === 'all') {
                campersQuery = query(collection(db, 'campers'));
            } else {
                campersQuery = query(collection(db, 'campers'), where('enrolledSessionIds', 'array-contains', selectedSession));
            }

            const campersSnapshot = await getDocs(campersQuery);
            if (campersSnapshot.empty) {
                setError('No campers found for the selected group.');
                setLoading(false);
                return;
            }

            const batch = writeBatch(db);
            campersSnapshot.forEach(camperDoc => {
                const messageRef = doc(collection(db, 'messages'));
                batch.set(messageRef, {
                    senderId: auth.currentUser.uid, // Admin's ID
                    camperId: camperDoc.id,
                    content: `[BROADCAST] ${messageContent}`,
                    type: 'broadcast',
                    isPrinted: false,
                    sentAt: serverTimestamp(),
                });
            });

            await batch.commit();
            setSuccess(`Broadcast sent to ${campersSnapshot.size} camper(s).`);
            setMessageContent('');

        } catch (err) {
            console.error(err);
            setError('Failed to send broadcast.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Send a Broadcast Message</h2>
            <form onSubmit={handleSubmit}>
                <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
                    <option value="all">All Campers</option>
                    {sessions.map(session => (
                        <option key={session.id} value={session.id}>Campers in {session.name}</option>
                    ))}
                </select>
                <textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Write your broadcast message..."
                    required
                />
                <button type="submit" disabled={loading}>{loading ? 'Sending Broadcast...' : 'Send Broadcast'}</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </form>
        </div>
    );
}

export default BroadcastMessageForm;
