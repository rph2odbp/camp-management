import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';

function RoommateRequestsTab({ camper }) {
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'roommateRequests'), where('fromCamperId', '==', camper.id));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const requestsData = [];
            for (const reqDoc of snapshot.docs) {
                const request = { id: reqDoc.id, ...reqDoc.data() };
                const toCamperRef = doc(db, 'campers', request.toCamperId);
                const toCamperSnap = await getDoc(toCamperRef);
                if (toCamperSnap.exists()) {
                    request.toCamperName = toCamperSnap.data().name;
                }
                requestsData.push(request);
            }
            setOutgoingRequests(requestsData);
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch roommate requests.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [camper.id]);

    if (loading) return <p>Loading requests...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h4>Outgoing Roommate Requests</h4>
            {outgoingRequests.length > 0 ? (
                <ul>
                    {outgoingRequests.map(request => (
                        <li key={request.id}>
                            Request to {request.toCamperName || 'a camper'}: <strong>{request.status}</strong>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No outgoing roommate requests.</p>
            )}
        </div>
    );
}

export default RoommateRequestsTab;
