import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase-config';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';

function TimeOffRequestsTab({ staff }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState(null); // To check if admin or not
    
    // Form state for new request
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            // This is a simplified way to get role. In a real app, this might come from a context.
            const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
                if(doc.exists()) setUserRole(doc.data().role);
            });
            return unsub;
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        const requestsQuery = query(
            collection(db, 'timeOffRequests'), 
            where('staffId', '==', staff.id),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
            setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch time off requests.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, [staff.id]);

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await addDoc(collection(db, 'timeOffRequests'), {
                staffId: staff.id,
                staffName: staff.name,
                startDate,
                endDate,
                reason,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            setStartDate('');
            setEndDate('');
            setReason('');
        } catch (err) {
            setError('Failed to submit request.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleUpdateRequestStatus = async (requestId, newStatus) => {
        const requestRef = doc(db, 'timeOffRequests', requestId);
        try {
            await updateDoc(requestRef, { status: newStatus });
        } catch (err) {
            setError(`Failed to ${newStatus} request.`);
        }
    };

    if (loading) return <p>Loading requests...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h4>Time Off Requests</h4>

            {/* Form for Staff to submit a request */}
            <form onSubmit={handleSubmitRequest}>
                <h5>Request Time Off</h5>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for request..." required />
                <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Request'}</button>
            </form>

            {/* List of requests */}
            <h5>Submitted Requests</h5>
            {requests.length > 0 ? (
                <ul>
                    {requests.map(req => (
                        <li key={req.id}>
                            <p><strong>From:</strong> {req.startDate} <strong>To:</strong> {req.endDate}</p>
                            <p><strong>Reason:</strong> {req.reason}</p>
                            <p><strong>Status:</strong> {req.status}</p>
                            {userRole === 'admin' && req.status === 'pending' && (
                                <div>
                                    <button onClick={() => handleUpdateRequestStatus(req.id, 'approved')}>Approve</button>
                                    <button onClick={() => handleUpdateRequestStatus(req.id, 'denied')}>Deny</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No time off has been requested.</p>
            )}
        </div>
    );
}

export default TimeOffRequestsTab;
