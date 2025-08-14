import React, { useState, useEffect } from 'react';
import { db, remoteConfig } from './firebase-config'; // Import remoteConfig
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { fetchAndActivate, getBoolean } from 'firebase/remote-config'; // Import remote config functions

function ApplicationManagement() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('submitted');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [hiringEnabled, setHiringEnabled] = useState(true); // State for the feature flag

    // Fetch feature flag from Remote Config
    useEffect(() => {
        fetchAndActivate(remoteConfig)
          .then(() => {
            setHiringEnabled(getBoolean(remoteConfig, 'hiring_feature_enabled'));
          })
          .catch((err) => {
            console.error('Failed to fetch remote config for feature flags', err);
            // In case of error, default to the value in the code.
          });
    }, []);

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'applications'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch applications.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (appId, newStatus) => {
        const appRef = doc(db, 'applications', appId);
        await updateDoc(appRef, { status: newStatus });
    };

    const handleHire = async (application) => {
        if (window.confirm(`Are you sure you want to hire ${application.name}? This will create a staff profile.`)) {
            try {
                // 1. Create a staff document
                await addDoc(collection(db, 'staff'), {
                    userId: application.userId,
                    name: application.name,
                    email: application.email,
                    phone: application.phone,
                    address: application.address,
                    birthdate: application.birthdate,
                    gender: application.gender,
                    role: 'junior_counselor', // Default role
                    hireDate: serverTimestamp()
                });

                // 2. Update the user's role
                const userRef = doc(db, 'users', application.userId);
                await updateDoc(userRef, { role: 'staff' });
                
                // 3. Update the application status
                await handleStatusChange(application.id, 'hired');
                
                alert(`${application.name} has been hired!`);
                setSelectedApplication(null);

            } catch (err) {
                setError('Failed to hire applicant.');
            }
        }
    };

    const filteredApplications = applications.filter(app => app.status === filter);

    if (loading) return <p>Loading applications...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    if (selectedApplication) {
        return (
            <div>
                <button onClick={() => setSelectedApplication(null)}>&larr; Back to List</button>
                <h3>{selectedApplication.name}'s Application</h3>
                <p><strong>Email:</strong> {selectedApplication.email}</p>
                <p><strong>Phone:</strong> {selectedApplication.phone}</p>
                <p><strong>Cover Letter:</strong> {selectedApplication.coverLetter}</p>
                <p><strong>Status:</strong> {selectedApplication.status}</p>
                <select onChange={(e) => handleStatusChange(selectedApplication.id, e.target.value)} value={selectedApplication.status}>
                    <option value="submitted">Submitted</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                </select>
                {/* Conditionally render the button based on the feature flag */}
                {hiringEnabled && selectedApplication.status !== 'hired' && (
                    <button onClick={() => handleHire(selectedApplication)}>Hire Applicant</button>
                )}
            </div>
        );
    }

    return (
        <div>
            <h3>Application Management</h3>
            <select onChange={(e) => setFilter(e.target.value)} value={filter}>
                <option value="submitted">Submitted</option>
                <option value="reviewing">Reviewing</option>
                <option value="interviewing">Interviewing</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
            </select>
            <ul>
                {filteredApplications.map(app => (
                    <li key={app.id} onClick={() => setSelectedApplication(app)}>
                        {app.name} ({app.email}) - {app.status}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ApplicationManagement;
