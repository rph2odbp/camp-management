import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

function ApplicationManagement() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('submitted');
    const [selectedApplication, setSelectedApplication] = useState(null);

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
                {selectedApplication.status !== 'hired' && (
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
