
import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import CamperList from './CamperList';
import EmploymentTab from './EmploymentTab';
import TimeOffRequestsTab from './TimeOffRequestsTab';
import StaffProfile from './StaffProfile';

const StaffPortal = () => {
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const fetchStaffData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const staffRef = doc(db, 'users', user.uid);
                    const staffSnap = await getDoc(staffRef);
                    if (staffSnap.exists() && staffSnap.data().role === 'staff') {
                        setStaff({ id: staffSnap.id, ...staffSnap.data() });
                    } else {
                        setError('Access Denied. You are not a staff member.');
                    }
                } else {
                    setError('You must be logged in to view the staff portal.');
                }
            } catch (err) {
                setError('Failed to fetch staff data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStaffData();
    }, []);

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'profile':
                return <StaffProfile staff={staff} />;
            case 'campers':
                // Assuming we can derive assigned campers from staff's session assignments
                return <CamperList view="staff" staffId={staff.id} />;
            case 'employment':
                return <EmploymentTab staff={staff} />;
            case 'timeOff':
                return <TimeOffRequestsTab staff={staff} />;
            default:
                return <StaffProfile staff={staff} />;
        }
    };
    
    if (loading) {
        return <div>Loading Staff Portal...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!staff) {
        return <div>No staff data found.</div>;
    }

    return (
        <div>
            <h2>Staff Portal</h2>
            <nav>
                <button onClick={() => setActiveTab('profile')}>My Profile</button>
                <button onClick={() => setActiveTab('campers')}>My Campers</button>
                <button onClick={() => setActiveTab('employment')}>Employment</button>
                <button onClick={() => setActiveTab('timeOff')}>Time Off Requests</button>
            </nav>
            <div className="tab-content">
                {renderActiveTab()}
            </div>
        </div>
    );
};

export default StaffPortal;
