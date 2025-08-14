import React from 'react';

function ParentGuardianInfoTab({ camper }) {
    return (
        <div>
            <h4>Parent/Guardian Contact Information</h4>
            <div style={{ padding: '20px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '5px' }}>
                <p>
                    <strong>Access Restricted</strong>
                </p>
                <p>
                    For the privacy and security of our camp families, direct parent/guardian contact information is not available in this view.
                </p>
                <p>
                    Please refer to official camp communication channels for any necessary contact with parents.
                </p>
            </div>
        </div>
    );
}

export default ParentGuardianInfoTab;
