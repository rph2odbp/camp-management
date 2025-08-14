import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import AllCampersList from '../components/AllCampersList';
import MessagePrinting from '../components/MessagePrinting';
import StaffCamperProfile from '../components/StaffCamperProfile';

function StaffPortal() {
    const [activeTab, setActiveTab] = useState('all-campers');
    const [selectedCamperId, setSelectedCamperId] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserRole(userDocSnap.data().role);
                }
            }
        };
        fetchUserRole();
    }, []);

    const handleSelectCamper = (camperId) => {
        setSelectedCamperId(camperId);
        setActiveTab('camper-profile');
    };
    
    const renderContent = () => {
        switch (activeTab) {
            case 'all-campers':
                return <AllCampersList onSelectCamper={handleSelectCamper} />;
            case 'camper-profile':
                return <StaffCamperProfile camperId={selectedCamperId} onBack={() => setActiveTab('all-campers')} />;
            case 'message-printing':
                return <MessagePrinting />;
            default:
                return <AllCampersList onSelectCamper={handleSelectCamper} />;
        }
    };

    return (
        <div>
            <h2>Staff Portal</h2>
            <nav>
                <button onClick={() => setActiveTab('all-campers')}>All Campers</button>
                <button onClick={() => setActiveTab('message-printing')}>Message Printing</button>
            </nav>
            <hr />
            {renderContent()}
        </div>
    );
}

export default StaffPortal;
