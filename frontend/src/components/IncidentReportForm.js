// frontend/src/IncidentReportForm.js
import React, { useState } from 'react';
import { db, auth } from './firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function IncidentReportForm({ camperId }) {
    const [incidentTime, setIncidentTime] = useState(new Date().toISOString().slice(0, 16));
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
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
            setError('You must be logged in to report an incident.');
            setLoading(false);
            return;
        }

        try {
            const chartCollectionRef = collection(db, 'campers', camperId, 'chart');
            await addDoc(chartCollectionRef, {
                type: 'incident_report',
                timestamp: serverTimestamp(),
                incidentTime: new Date(incidentTime),
                recordedBy: user.uid,
                location,
                note: `Incident at ${location}: ${description}`,
                description,
            });

            setSuccess('Incident report filed successfully.');
            setLocation('');
            setDescription('');

        } catch (err) {
            setError('Failed to file incident report.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h4>File an Incident Report</h4>
            <form onSubmit={handleSubmit}>
                <label>Time of Incident:</label>
                <input type="datetime-local" value={incidentTime} onChange={(e) => setIncidentTime(e.target.value)} required />
                
                <label>Location:</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="E.g., 'Mess Hall'" required />
                
                <label>Description of Incident:</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
                
                <button type="submit" disabled={loading}>{loading ? 'Filing...' : 'File Report'}</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </form>
        </div>
    );
}

export default IncidentReportForm;
