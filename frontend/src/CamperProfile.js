import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import MedicalTab from './MedicalTab';
import RoommateRequestsTab from './RoommateRequestsTab';
import AttachmentsTab from './AttachmentsTab';
import TimelineTab from './TimelineTab';
import AccountingTab from './AccountingTab';

function CamperProfile({ camperId, onBack }) {
    const [camper, setCamper] = useState(null);
    const [enrolledSessions, setEnrolledSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('personal');

    useEffect(() => {
        setLoading(true);
        const camperRef = doc(db, 'campers', camperId);
        const unsubscribe = onSnapshot(camperRef, (docSnap) => {
            if (docSnap.exists()) {
                const camperData = { id: docSnap.id, ...docSnap.data() };
                setCamper(camperData);
                if (camperData.enrolledSessionIds && camperData.enrolledSessionIds.length > 0) {
                    fetchEnrolledSessions(camperData.enrolledSessionIds);
                } else {
                    setLoading(false);
                }
            } else {
                setError('Camper not found.');
                setLoading(false);
            }
        }, (err) => {
            setError('Failed to fetch camper data.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [camperId]);

    const fetchEnrolledSessions = async (sessionIds) => {
        try {
            const sessionsRef = collection(db, 'sessions');
            const q = query(sessionsRef, where('__name__', 'in', sessionIds));
            const querySnapshot = await getDocs(q);
            const sessionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEnrolledSessions(sessionsData);
        } catch (err) {
            setError('Failed to fetch session details.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading camper profile...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!camper) return <p>No camper data available.</p>;

    return (
        <div>
            <button onClick={onBack}>&larr; Back to List</button>
            <h2>Camper Profile: {camper.name}</h2>

            <div className="tab-navigation">
                <button onClick={() => setActiveTab('personal')}>Personal</button>
                <button onClick={() => setActiveTab('medical')}>Medical</button>
                <button onClick={() => setActiveTab('roommate')}>Roommate Requests</button>
                <button onClick={() => setActiveTab('attachments')}>Attachments</button>
                <button onClick={() => setActiveTab('timeline')}>Timeline</button>
                <button onClick={() => setActiveTab('accounting')}>Accounting</button>
            </div>

            <div className="tab-content">
                {activeTab === 'personal' && (
                    <div>
                        <fieldset>
                            <legend>Personal Information</legend>
                            {camper.photoURL && <img src={camper.photoURL} alt="Camper" style={{ maxWidth: '200px', maxHeight: '200px' }} />}
                            <p><strong>Name:</strong> {camper.name}</p>
                            <p><strong>Date of Birth:</strong> {camper.birthdate}</p>
                            <p><strong>Gender:</strong> {camper.gender}</p>
                            <p><strong>Grade:</strong> {camper.grade}</p>
                            <p><strong>School:</strong> {camper.school}</p>
                            <p><strong>T-Shirt Size:</strong> {camper.tShirtSize}</p>
                            <p><strong>Years at Camp:</strong> {camper.yearsAtCamp}</p>
                        </fieldset>
                        <fieldset>
                            <legend>Parent/Guardian Information</legend>
                            <p><strong>Name:</strong> {camper.parentName}</p>
                            <p><strong>Phone:</strong> {camper.parentPhone}</p>
                        </fieldset>
                        <fieldset>
                            <legend>Session & Registration</legend>
                            <p><strong>Registration Status:</strong> {camper.registrationStatus}</p>
                            <h4>Enrolled Sessions:</h4>
                            {enrolledSessions.length > 0 ? (
                                <ul>
                                    {enrolledSessions.map(session => (
                                        <li key={session.id}>{session.name} ({session.startDate} to {session.endDate})</li>
                                    ))}
                                </ul>
                            ) : <p>Not enrolled in any sessions.</p>}
                        </fieldset>
                    </div>
                )}
                {activeTab === 'medical' && <MedicalTab camper={camper} />}
                {activeTab === 'roommate' && <RoommateRequestsTab camper={camper} />}
                {activeTab === 'attachments' && <AttachmentsTab camper={camper} />}
                {activeTab === 'timeline' && <TimelineTab camper={camper} />}
                {activeTab === 'accounting' && <AccountingTab camper={camper} />}
            </div>
        </div>
    );
}

export default CamperProfile;
