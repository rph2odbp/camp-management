import React, { useState } from 'react';
import { db, auth } from './firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function HospitalVisitForm({ camperId }) {
    const [hospitalName, setHospitalName] = useState('');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const user = auth.currentUser;
        if (!user) {
            setError('You must be logged in to record a hospital visit.');
            setLoading(false);
            return;
        }

        try {
            const chartCollectionRef = collection(db, 'campers', camperId, 'chart');
            await addDoc(chartCollectionRef, {
                type: 'hospital_visit',
                timestamp: serverTimestamp(),
                recordedBy: user.uid,
                hospitalName,
                reason,
                note: `Hospital Visit: ${hospitalName}. Reason: ${reason}. Notes: ${notes}`,
            });

            setSuccess('Hospital visit recorded successfully.');
            setHospitalName('');
            setReason('');
            setNotes('');
        } catch (err) {
            setError('Failed to record visit.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h4>Record Hospital Visit</h4>
            <form onSubmit={handleSubmit}>
                <input type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} placeholder="Hospital Name" required />
                <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for Visit" required />
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional Notes"></textarea>
                <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Visit'}</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </form>
        </div>
    );
}

export default HospitalVisitForm;
