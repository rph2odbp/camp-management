import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase-config';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';

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

        let unsubscribeRequests = () => {}; // No-op cleanup function

        // First, find the campers belonging to the current user
        const campersQuery = query(collection(db, 'campers'), where('parentId', '==', user.uid));
        const unsubscribeCampers = onSnapshot(campersQuery, (campersSnapshot) => {
            const camperIds = campersSnapshot.docs.map(doc => doc.id);
            
            // Clean up any previous listener for requests
            unsubscribeRequests();

            if (camperIds.length > 0) {
                // Now, find requests sent TO any of those campers
                const requestsQuery = query(
                    collection(db, 'roommateRequests'), 
                    where('toCamperId', 'in', camperIds), 
                    where('status', '==', 'pending')
                );

                unsubscribeRequests = onSnapshot(requestsQuery, async (reqSnapshot) => {
                    // Process all requests in parallel
                    const requestsData = await Promise.all(reqSnapshot.docs.map(async (reqDoc) => {
                        const request = { id: reqDoc.id, ...reqDoc.data() };
                        
                        // For each request, fetch the name of the camper who sent it
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
                // If the user has no campers, there can be no requests
                setRequests([]);
                setLoading(false);
            }
        }, (err) => {
            setError('Failed to load camper data.');
            setLoading(false);
        });

        // Return a cleanup function to unsubscribe from both listeners when the component unmounts
        return () => {
            unsubscribeCampers();
            unsubscribeRequests();
        };
    }, []); // Empty dependency array means this runs once on mount

    const handleRequest = async (requestId, newStatus) => {
        try {
            const requestRef = doc(db, 'roommateRequests', requestId);
            await updateDoc(requestRef, { status: newStatus });
        } catch (err) { // <-- This is the corrected syntax
            setError('Failed to update request.');
            console.error("Error updating request status: ", err);
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
                            <p><b>{request.fromCamperName}</b> has requested to be roommates with your camper.</p>
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
