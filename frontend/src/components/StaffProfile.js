
import React from 'react';

const StaffProfile = ({ staff }) => {
    if (!staff) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="staff-profile">
            <h3>{staff.firstName} {staff.lastName}</h3>
            <p><strong>Email:</strong> {staff.email}</p>
            <p><strong>Role:</strong> {staff.role}</p>
            {/* Add more staff details as needed */}
        </div>
    );
};

export default StaffProfile;
