import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase-config';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';

function RoommateRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userCampers, setUserCampers] = useState([]);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        const campersQuery = query(collection(db, 'campers'), where('parentId', '==', user.uid));
        const unsubscribeCampers = onSnapshot(campersQuery, (snapshot) => {
            const campersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserCampers(campersData);

            if (campersData.length > 0) {
                const camperIds = campersData.map(c => c.id);
                const requestsQuery = query(collection(db, 'roommateRequests'), where('toCamperId', 'in', camperIds), where('status', '==', 'pending'));
                const unsubscribeRequests = onSnapshot(requestsQuery, async (reqSnapshot) => {
                    const requestsData = [];
                    for (const reqDoc of reqSnapshot.docs) {
                        const request = { id: reqDoc.id, ...reqDoc.data() };
                        // Fetch the name of the camper who made the request
                        const fromCamperRef = doc(db, 'campers', request.fromCamperId);
                        const fromCamperSnap = await getDocs(query(collection(db, 'campers'), where('__name__', '==', request.fromCamperId)));
                        if (!fromCamperSnap.empty) {
                            request.fromCamperName = fromCamperSnap.docs[0].data().name;
                        }
                        requestsData.push(request);
                    }
                    setRequests(requestsData);
                    setLoading(false);
                });
                return () => unsubscribeRequests();
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribeCampers();
    }, []);

    const handleRequest = async (requestId, newStatus) => {
        try {
            const requestRef = doc(db, 'roommateRequests', requestId);
            await updateDoc(requestRef, { status: newStatus });
        } catch (err) {
            setError('Failed to update request.');
        }
    };

    if (loading) return <p>Loading roommate requests...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h4>Incoming Roommate Requests</h4>
            {requests.length > 0 ? (
                <ul>
                    {requests.map(request => (
                        <li key={request.id}>
                            <p>{request.fromCamperName} has requested to be roommates with your camper.</p>
                            <button onClick={() => handleRequest(request.id, 'confirmed')}>Confirm</button>
                            <button onClick={() => handleRequest(request.id, 'denied')}>Deny</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No new roommate requests.</p>
            )}
        </div>
    );
}

export default RoommateRequests;
