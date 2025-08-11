import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { doc, onSnapshot } from 'firebase/firestore';
import StaffMedicalTab from './StaffMedicalTab';
import EmploymentTab from './EmploymentTab';
import TimeOffRequestsTab from './TimeOffRequestsTab';

function StaffProfile({ staffId, onBack }) {
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('demographics');

    useEffect(() => {
        setLoading(true);
        const staffRef = doc(db, 'staff', staffId);
        const unsubscribe = onSnapshot(staffRef, (docSnap) => {
            if (docSnap.exists()) {
                setStaff({ id: docSnap.id, ...docSnap.data() });
            } else {
                setError('Staff member not found.');
            }
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch staff data.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [staffId]);

    if (loading) return <p>Loading staff profile...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!staff) return <p>No staff data available.</p>;

    return (
        <div>
            <button onClick={onBack}>&larr; Back to Staff List</button>
            <h2>Staff Profile: {staff.name}</h2>

            <div className="tab-navigation">
                <button onClick={() => setActiveTab('demographics')}>Demographics</button>
                <button onClick={() => setActiveTab('medical')}>Medical</button>
                <button onClick={() => setActiveTab('employment')}>Employment</button>
                <button onClick={() => setActiveTab('timeoff')}>Time Off Requests</button>
            </div>

            <div className="tab-content">
                {activeTab === 'demographics' && (
                    <fieldset>
                        <legend>Demographic Information</legend>
                        <p><strong>Name:</strong> {staff.name}</p>
                        <p><strong>Role:</strong> {staff.role}</p>
                        <p><strong>Email:</strong> {staff.email}</p>
                        <p><strong>Phone:</strong> {staff.phone}</p>
                        <p><strong>Address:</strong> {staff.address}</p>
                        <p><strong>Birthdate:</strong> {staff.birthdate}</p>
                        <p><strong>Gender:</strong> {staff.gender}</p>
                    </fieldset>
                )}
                {activeTab === 'medical' && <StaffMedicalTab staff={staff} />}
                {activeTab === 'employment' && <EmploymentTab staff={staff} />}
                {activeTab === 'timeoff' && <TimeOffRequestsTab staff={staff} />}
            </div>
        </div>
    );
}

export default StaffProfile;
