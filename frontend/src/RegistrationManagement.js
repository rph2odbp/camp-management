import React, { useState, useEffect } from 'react';
import { db, remoteConfig } from './firebase-config'; // Import remoteConfig
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { fetchAndActivate, getString } from 'firebase/remote-config';

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
    const [registrationStatuses, setRegistrationStatuses] = useState([]); // State for statuses

    // Fetch statuses from Remote Config
    useEffect(() => {
        fetchAndActivate(remoteConfig)
          .then(() => {
            const statusesString = getString(remoteConfig, 'registration_statuses');
            try {
              const statuses = JSON.parse(statusesString);
              setRegistrationStatuses(statuses);
            } catch (e) {
              console.error("Failed to parse registration statuses from Remote Config", e);
              // Fallback to default if parsing fails
              setRegistrationStatuses(["all", "pending deposit", "active", "waitlisted", "complete"]);
            }
          })
          .catch((err) => {
            console.error('Failed to fetch remote config', err);
            // Fallback to default on error
            setRegistrationStatuses(["all", "pending deposit", "active", "waitlisted", "complete"]);
          });
    }, []);

    useEffect(() => {
        setLoading(true);
        let campersQuery;
        if (filter === 'all' || !filter) {
            campersQuery = query(collection(db, 'campers'));
        } else {
            campersQuery = query(collection(db, 'campers'), where('registrationStatus', '==', filter));
        }

        const unsubscribe = onSnapshot(campersQuery, (snapshot) => {
            const campersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCampers(campersData);
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch campers.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, [filter]);
    
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
                // Optionally update status if needed, e.g., from waitlisted to accepted
                // await updateDoc(doc(db, 'campers', camper.id), { registrationStatus: 'accepted' });
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

    if (loading) return <p>Loading registrations...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h3>Registration Management</h3>
            <div>
                Filter by status:
                <select onChange={(e) => setFilter(e.target.value)} value={filter}>
                    {registrationStatuses.map(status => (
                        <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
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
                    {campers.map(camper => (
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
