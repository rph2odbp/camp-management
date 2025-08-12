import React, { useEffect, useState } from 'react';
import { db, auth } from './firebase-config';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function MessageList() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [campersData, setCampersData] = useState({});

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserRole(userDocSnap.data().role);
                }
            } else {
                setUserRole(null);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!currentUser || !userRole) {
            setMessages([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        let messagesQuery;

        if (userRole === 'parent') {
            messagesQuery = query(
                collection(db, 'messages'),
                where('senderId', '==', currentUser.uid),
                orderBy('sentAt', 'desc')
            );
        } else { // Staff or Admin
            messagesQuery = query(
                collection(db, 'messages'),
                orderBy('sentAt', 'desc')
            );
        }

        const unsubscribeMessages = onSnapshot(messagesQuery, async (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Fetch camper data for each message
            const camperIds = new Set(messagesData.map(msg => msg.camperId));
            const newCampersData = { ...campersData };
            for (const camperId of camperIds) {
                if (!newCampersData[camperId]) {
                    const camperRef = doc(db, 'campers', camperId);
                    const camperSnap = await getDoc(camperRef);
                    if (camperSnap.exists()) {
                        newCampersData[camperId] = camperSnap.data();
                    }
                }
            }
            setCampersData(newCampersData);
            setMessages(messagesData);
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch messages.');
            setLoading(false);
        });

        return () => unsubscribeMessages();

    }, [currentUser, userRole, campersData]);

    if (loading) return <p>Loading messages...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Sent Messages</h2>
            {messages.length === 0 ? (
                <p>No messages have been sent yet.</p>
            ) : (
                <ul>
                    {messages.map(message => {
                        const camperName = campersData[message.camperId]?.name || 'a camper';
                        return (
                            <li key={message.id}>
                                <p>To: <strong>{camperName}</strong></p>
                                <p>{message.content}</p>
                                <small>Sent: {message.sentAt?.toDate().toLocaleString()}</small>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default MessageList;
