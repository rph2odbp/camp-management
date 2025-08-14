import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, where, onSnapshot, getDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';

function RoommateRequestsTab({ camper }) {
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);

        const fetchRequests = async (field, camperId, setData) => {
            const q = query(collection(db, 'roommateRequests'), where(field, '==', camperId));
            const unsubscribe = onSnapshot(q, async (snapshot) => {
                const requestsData = [];
                for (const reqDoc of snapshot.docs) {
                    const request = { id: reqDoc.id, ...reqDoc.data() };
                    const otherCamperId = field === 'fromCamperId' ? request.toCamperId : request.fromCamperId;
                    const otherCamperRef = doc(db, 'campers', otherCamperId);
                    const otherCamperSnap = await getDoc(otherCamperRef);
                    if (otherCamperSnap.exists()) {
                        request.otherCamperName = otherCamperSnap.data().name;
                    }
                    requestsData.push(request);
                }
                setData(requestsData);
            }, (err) => {
                setError(`Failed to fetch ${field === 'fromCamperId' ? 'outgoing' : 'incoming'} requests.`);
            });
            return unsubscribe;
        };

        const unsubOutgoing = fetchRequests('fromCamperId', camper.id, setOutgoingRequests);
        const unsubIncoming = fetchRequests('toCamperId', camper.id, setIncomingRequests);
        
        setLoading(false);

        return () => {
            unsubOutgoing();
            unsubIncoming();
        };
    }, [camper.id]);

    const handleRequestAction = async (requestId, newStatus) => {
        const requestRef = doc(db, 'roommateRequests', requestId);
        try {
            await updateDoc(requestRef, { status: newStatus });
            if (newStatus === 'accepted') {
                // Optional: Logic to handle mutual acceptance, e.g., link campers
            }
        } catch (err) {
            console.error("Error updating request:", err);
            setError('Failed to update request status.');
        }
    };

    if (loading) return <p>Loading requests...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h4>Outgoing Roommate Requests</h4>
            {outgoingRequests.length > 0 ? (
                <ul>
                    {outgoingRequests.map(request => (
                        <li key={request.id}>
                            Request to {request.otherCamperName || 'a camper'}: <strong>{request.status}</strong>
                        </li>
                    ))}
                </ul>
            ) : <p>No outgoing roommate requests.</p>}

            <h4>Incoming Roommate Requests</h4>
            {incomingRequests.length > 0 ? (
                <ul>
                    {incomingRequests.map(request => (
                        <li key={request.id}>
                            Request from {request.otherCamperName || 'a camper'}: <strong>{request.status}</strong>
                            {request.status === 'pending' && (
                                <>
                                    <button onClick={() => handleRequestAction(request.id, 'accepted')}>Accept</button>
                                    <button onClick={() => handleRequestAction(request.id, 'declined')}>Decline</button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            ) : <p>No incoming roommate requests.</p>}
        </div>
    );
}

export default RoommateRequestsTab;
