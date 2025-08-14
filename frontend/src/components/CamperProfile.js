import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import MedicalTab from './MedicalTab';
import RoommateRequestsTab from './RoommateRequestsTab';
import AttachmentsTab from './AttachmentsTab';
import TimelineTab from './TimelineTab';
import AccountingTab from './AccountingTab';

function CamperProfile({ camperId, onBack }) {
    const [camper, setCamper] = useState(null);
    const [editableCamper, setEditableCamper] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
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
                setEditableCamper(camperData); // Initialize editable state
                if (camperData.sessionRegistrations && camperData.sessionRegistrations.length > 0) {
                    const sessionIds = camperData.sessionRegistrations.filter(reg => reg.status === 'enrolled').map(reg => reg.sessionId);
                    if(sessionIds.length > 0) {
                        fetchEnrolledSessions(sessionIds);
                    } else {
                        setLoading(false);
                    }
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
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableCamper(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSave = async () => {
        const camperRef = doc(db, 'campers', camperId);
        try {
            await updateDoc(camperRef, {
                // Only update fields that are editable
                name: editableCamper.name,
                dateOfBirth: editableCamper.dateOfBirth
            });
            setIsEditing(false);
            setError(''); // Clear any previous errors
        } catch (err) {
            console.error("Error updating camper:", err);
            setError('Failed to save changes.');
        }
    };

    const handleCancel = () => {
        setEditableCamper(camper); // Reset changes
        setIsEditing(false);
        setError('');
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
                            {isEditing ? (
                                <>
                                    <p><strong>Name:</strong> <input type="text" name="name" value={editableCamper.name} onChange={handleInputChange} /></p>
                                    <p><strong>Date of Birth:</strong> <input type="date" name="dateOfBirth" value={editableCamper.dateOfBirth} onChange={handleInputChange} /></p>
                                    <button onClick={handleSave}>Save</button>
                                    <button onClick={handleCancel}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <p><strong>Name:</strong> {camper.name}</p>
                                    <p><strong>Date of Birth:</strong> {camper.dateOfBirth}</p>
                                    <button onClick={() => setIsEditing(true)}>Edit</button>
                                </>
                            )}
                         </fieldset>
                        <fieldset>
                            <legend>Session & Registration</legend>
                            <h4>Enrolled Sessions:</h4>
                            {enrolledSessions.length > 0 ? (
                                <ul>
                                    {enrolledSessions.map(session => (
                                        <li key={session.id}>{session.name}</li>
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
