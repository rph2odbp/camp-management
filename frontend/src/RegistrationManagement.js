import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

// Placeholder for a service that would handle sending emails
const EmailService = {
    sendAcceptanceEmail: (camper) => {
        console.log(`Simulating sending acceptance email to ${camper.parentName} for ${camper.name}.`);
        alert(`Acceptance email sent for ${camper.name}.`);
        return Promise.resolve();
    },
    sendReminderEmail: (camper, message) => {
        console.log(`Simulating sending reminder to ${camper.parentName} for ${camper.name}: ${message}`);
        alert(`Reminder email sent for ${camper.name}.`);
        return Promise.resolve();
    }
};

function RegistrationManagement({ onSelectCamper }) {
    const [campers, setCampers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        setLoading(true);
        const campersQuery = query(collection(db, 'campers'));
        const unsubscribe = onSnapshot(campersQuery, (snapshot) => {
            const campersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCampers(campersData);
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch campers.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const recordTimelineEvent = async (camperId, event) => {
        try {
            const timelineRef = collection(db, `campers/${camperId}/timeline`);
            await addDoc(timelineRef, {
                ...event,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error("Error recording timeline event: ", error);
        }
    };

    const handleSendAcceptance = async (camper) => {
        if (window.confirm(`Are you sure you want to send an acceptance email to ${camper.name}?`)) {
            try {
                await EmailService.sendAcceptanceEmail(camper);
                const camperRef = doc(db, 'campers', camper.id);
                // Optionally update status if needed, e.g., from waitlisted to accepted
                // await updateDoc(camperRef, { registrationStatus: 'accepted' });
                await recordTimelineEvent(camper.id, {
                    type: 'email',
                    title: 'Acceptance Email Sent'
                });
            } catch (err) {
                alert('Failed to send acceptance email.');
            }
        }
    };

    const handleSendReminder = async (camper) => {
        const message = prompt("Enter the reminder message for the parent:");
        if (message) {
            try {
                await EmailService.sendReminderEmail(camper, message);
                await recordTimelineEvent(camper.id, {
                    type: 'email',
                    title: 'Reminder Sent',
                    details: message,
                });
            } catch (err) {
                alert('Failed to send reminder email.');
            }
        }
    };

    const filteredCampers = campers.filter(camper => {
        if (filter === 'all') return true;
        return camper.registrationStatus === filter;
    });

    if (loading) return <p>Loading registrations...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h3>Registration Management</h3>
            <div>
                Filter by status:
                <select onChange={(e) => setFilter(e.target.value)} value={filter}>
                    <option value="all">All</option>
                    <option value="pending deposit">Pending Deposit</option>
                    <option value="active">Active</option>
                    <option value="waitlisted">Waitlisted</option>
                    <option value="complete">Complete</option>
                </select>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCampers.map(camper => (
                        <tr key={camper.id}>
                            <td onClick={() => onSelectCamper(camper.id)} style={{cursor: 'pointer', textDecoration: 'underline'}}>{camper.name}</td>
                            <td>{camper.registrationStatus}</td>
                            <td>
                                <button onClick={() => handleSendAcceptance(camper)}>Send Acceptance</button>
                                <button onClick={() => handleSendReminder(camper)}>Send Reminder</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default RegistrationManagement;
