// frontend/src/CamperList.js
import React, { useState, useEffect } from 'react';
// ... (imports remain the same)

function CamperList({ onSelectCamper }) {
    const [campers, setCampers] = useState([]);
    const [sessions, setSessions] = useState([]);
    // ... (loading, error states remain the same)

    useEffect(() => {
        // ... (data fetching logic remains the same)
    }, []);
    
    // ... (handleAddSessions and other handlers will need to be updated)
    
    return (
        <div>
            <h2>My Campers</h2>
            <ul>
                {campers.map((camper) => {
                    // Adapt to the new data structure
                    const enrolledSessionIds = camper.sessionRegistrations
                        ?.filter(r => r.status === 'enrolled')
                        .map(r => r.sessionId) || [];
                        
                    const waitlistedSessionIds = camper.sessionRegistrations
                        ?.filter(r => r.status === 'waitlisted')
                        .map(r => r.sessionId) || [];

                    // ... (rest of the component will be updated to display this new info)
                    return (
                        <li key={camper.id}>
                            <h3>{camper.firstName} {camper.lastName}</h3>
                            {/* Display enrolled sessions */}
                            {/* Display waitlisted sessions */}
                            {/* Logic to add more sessions */}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default CamperList;
