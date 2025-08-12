import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase-config';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import SendRoommateRequest from './SendRoommateRequest'; // Import the new component

function RoommateRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        let unsubscribeRequests = () => {};

        const campersQuery = query(collection(db, 'campers'), where('parentId', '==', user.uid));
        const unsubscribeCampers = onSnapshot(campersQuery, (campersSnapshot) => {
            const camperIds = campersSnapshot.docs.map(doc => doc.id);
            
            unsubscribeRequests();

            if (camperIds.length > 0) {
                const requestsQuery = query(
                    collection(db, 'roommateRequests'), 
                    where('toCamperId', 'in', camperIds), 
                    where('status', '==', 'pending')
                );

                unsubscribeRequests = onSnapshot(requestsQuery, async (reqSnapshot) => {
                    const requestsData = await Promise.all(reqSnapshot.docs.map(async (reqDoc) => {
                        const request = { id: reqDoc.id, ...reqDoc.data() };
                        
                        const fromCamperDoc = await getDoc(doc(db, 'campers', request.fromCamperId));
                        request.fromCamperName = fromCamperDoc.exists() 
                            ? fromCamperDoc.data().name 
                            : 'Unknown Camper';
                            
                        return request;
                    }));
                    setRequests(requestsData);
                    setLoading(false);
                });
            } else {
                setRequests([]);
                setLoading(false);
            }
        }, (err) => {
            setError('Failed to load camper data.');
            setLoading(false);
        });

        return () => {
            unsubscribeCampers();
            unsubscribeRequests();
        };
    }, []);

    const handleRequest = async (requestId, newStatus) => {
        try {
            const requestRef = doc(db, 'roommateRequests', requestId);
            await updateDoc(requestRef, { status: newStatus });
        } catch (err) {
            setError('Failed to update request.');
            console.error("Error updating request status: ", err);
        }
    };

    if (loading) return <p>Loading roommate requests...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h3>Roommate Requests</h3>
            
            {/* Incoming Requests Section */}
            <div>
                <h4>Incoming Requests</h4>
                {requests.length > 0 ? (
                    <ul>
                        {requests.map(request => (
                            <li key={request.id}>
                                <p><b>{request.fromCamperName}</b> has requested to be roommates.</p>
                                <button onClick={() => handleRequest(request.id, 'confirmed')}>Confirm</button>
                                <button onClick={() => handleRequest(request.id, 'denied')}>Deny</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No new roommate requests.</p>
                )}
            </div>

            <hr />

            {/* Outgoing Requests Section */}
            <SendRoommateRequest />
            
        </div>
    );
}

export default RoommateRequests;
