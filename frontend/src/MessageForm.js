import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase-config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, orderBy, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function MessageForm() {
    const [messageContent, setMessageContent] = useState('');
    const [myCampers, setMyCampers] = useState([]);
    const [selectedCamper, setSelectedCamper] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [messageCredits, setMessageCredits] = useState(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!currentUser) {
            setMyCampers([]);
            setMessageCredits(0);
            return;
        }

        const fetchCampers = async () => {
            const q = query(collection(db, 'campers'), where('parentId', '==', currentUser.uid));
            const querySnapshot = await getDocs(q);
            setMyCampers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        const fetchCredits = () => {
            const creditsQuery = query(collection(db, 'users', currentUser.uid, 'message_credits'));
            const unsubscribe = onSnapshot(creditsQuery, (snapshot) => {
                let totalCredits = 0;
                snapshot.forEach(doc => {
                    totalCredits += doc.data().credits;
                });
                setMessageCredits(totalCredits);
            });
            return unsubscribe;
        };

        fetchCampers();
        const unsubscribeCredits = fetchCredits();

        return () => unsubscribeCredits();

    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (messageCredits <= 0) {
            setError('You have no message credits. Please purchase a package.');
            return;
        }
        if (!messageContent.trim() || !selectedCamper) {
            setError('Please select a camper and write a message.');
            return;
        }
        
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Find the oldest credit document to "use"
            const creditsQuery = query(collection(db, 'users', currentUser.uid, 'message_credits'), orderBy('purchasedAt'), limit(1));
            const creditSnapshot = await getDocs(creditsQuery);
            if (creditSnapshot.empty) {
                setError('An error occurred. No credit document found even though credits were detected.');
                setLoading(false);
                return;
            }
            const creditDocToDelete = creditSnapshot.docs[0];

            // Send the message and delete the credit doc in a batch write for atomicity
            await addDoc(collection(db, 'messages'), {
                senderId: currentUser.uid,
                camperId: selectedCamper,
                content: messageContent,
                type: 'camper_message',
                isPrinted: false,
                sentAt: serverTimestamp(),
            });
            
            // For simplicity, we assume one message uses one credit document.
            // A more complex system might update a single credit document.
            await deleteDoc(creditDocToDelete.ref);

            setSuccess('Message sent successfully!');
            setMessageContent('');
            setSelectedCamper('');
        } catch (err) {
            setError('Failed to send message.');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return <p>Please log in to send messages to your campers.</p>;
    }

    return (
        <div>
            <h2>Send a Message to Your Camper</h2>
            <p>You have {messageCredits} message credits remaining.</p>
            <form onSubmit={handleSubmit}>
                <select value={selectedCamper} onChange={(e) => setSelectedCamper(e.target.value)} required>
                    <option value="">-- Select a Camper --</option>
                    {myCampers.map(camper => (
                        <option key={camper.id} value={camper.id}>{camper.name}</option>
                    ))}
                </select>
                <textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Write your message..."
                    required
                />
                <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Message'}</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </form>
        </div>
    );
}

export default MessageForm;
