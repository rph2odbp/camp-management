import React, { useState } from 'react';
import StaffList from './StaffList';
import StaffProfile from './StaffProfile';
import ApplicationManagement from './ApplicationManagement';

function StaffPortal() {
    const [selectedStaffId, setSelectedStaffId] = useState(null);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'applications'

    const handleSelectStaff = (staffId) => {
        setSelectedStaffId(staffId);
    };

    if (selectedStaffId) {
        return <StaffProfile staffId={selectedStaffId} onBack={() => setSelectedStaffId(null)} />;
    }

    return (
        <div>
            <h2>Staff Management</h2>
            <nav>
                <button onClick={() => setActiveTab('list')}>Staff List</button>
                <button onClick={() => setActiveTab('applications')}>Manage Applications</button>
            </nav>
            <hr />
            {activeTab === 'list' && <StaffList onSelectStaff={handleSelectStaff} />}
            {activeTab === 'applications' && <ApplicationManagement />}
        </div>
    );
}

export default StaffPortal;
