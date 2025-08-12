// frontend/src/StaffPortal.js
import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase-config';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import StaffCamperProfile from './StaffCamperProfile'; // Import the new profile view

function StaffPortal() {
    const [assignedCabin, setAssignedCabin] = useState(null);
    const [assignedCampers, setAssignedCampers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCamperId, setSelectedCamperId] = useState(null); // State to manage view
    const user = auth.currentUser;

    useEffect(() => {
        // ... (data fetching logic remains the same)
        if (!user) { setLoading(false); return; }
        const q = query(collection(db, 'cabins'), where('assignedStaff', 'array-contains', user.uid));
        const unsub = onSnapshot(q, async (snap) => {
            if (!snap.empty) {
                const cabinDoc = snap.docs[0];
                setAssignedCabin({ id: cabinDoc.id, ...cabinDoc.data() });
                if (cabinDoc.data().assignedCampers?.length > 0) {
                    const promises = cabinDoc.data().assignedCampers.map(id => getDoc(doc(db, 'campers', id)));
                    const docs = await Promise.all(promises);
                    setAssignedCampers(docs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() })));
                } else { setAssignedCampers([]); }
            } else { setAssignedCabin(null); }
            setLoading(false);
        });
        return () => unsub();
    }, [user]);

    const handleSelectCamper = (camperId) => {
        setSelectedCamperId(camperId);
    };

    const handleBackToList = () => {
        setSelectedCamperId(null);
    };

    if (loading) return <p>Loading your assignments...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    if (selectedCamperId) {
        return <StaffCamperProfile camperId={selectedCamperId} onBack={handleBackToList} />;
    }

    return (
        <div>
            <h2>Staff Portal</h2>
            {assignedCabin ? (
                <div>
                    <h3>Your Cabin: {assignedCabin.name}</h3>
                    <h4>Assigned Campers:</h4>
                    <ul>
                        {assignedCampers.map(camper => (
                           <li key={camper.id}>
                               {camper.name} (DOB: {camper.dateOfBirth})
                               <button onClick={() => handleSelectCamper(camper.id)} style={{ marginLeft: '10px' }}>
                                   View Profile & Add Notes
                               </button>
                           </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>You have not been assigned to a cabin yet.</p>
            )}
        </div>
    );
}

export default StaffPortal;
