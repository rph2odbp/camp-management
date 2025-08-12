import React, { useState, useEffect } from 'react';
import CamperRegistrationForm from './CamperRegistrationForm';
import CamperList from './CamperList';
import SessionSelector from './SessionSelector';
import MessageForm from './MessageForm';
import MessageList from './MessageList';
import PurchaseMessages from './PurchaseMessages';
import CamperProfile from './CamperProfile';
import RoommateRequests from './RoommateRequests';
import { db } from './firebase-config';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';

function ParentPortal() {
  const [view, setView] = useState('list');
  const [selectedCamperId, setSelectedCamperId] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [isWaitlisted, setIsWaitlisted] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);

  const handleSessionSelected = async (sessionId) => {
    setLoadingSession(true);
    const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
    if (!sessionDoc.exists()) {
        alert("Error: Selected session not found.");
        setLoadingSession(false);
        return;
    }
    
    const campersQuery = query(collection(db, 'campers'), where('sessionRegistrations', 'array-contains', { sessionId: sessionId, status: 'enrolled' }));
    const campersSnapshot = await getDocs(campersQuery);
    
    setIsWaitlisted(campersSnapshot.size >= sessionDoc.data().capacity);
    setSelectedSessionId(sessionId);
    setLoadingSession(false);
    setView('register');
  };
  
  const handleSelectCamperForProfile = (camperId) => {
    setSelectedCamperId(camperId);
    setView('profile');
  };

  const handleBackToList = () => {
    setSelectedCamperId(null);
    setSelectedSessionId(null);
    setView('list');
  };

  const renderContent = () => {
    switch (view) {
      case 'register':
        if (loadingSession) return <p>Checking session availability...</p>;
        return (
          <div>
            <h2>Camper Registration</h2>
            <CamperRegistrationForm 
              sessionId={selectedSessionId} 
              isWaitlisted={isWaitlisted}
              onRegistrationComplete={handleBackToList} 
            />
            <button onClick={handleBackToList}>Cancel</button>
          </div>
        );
      case 'profile':
        return <CamperProfile camperId={selectedCamperId} onBack={handleBackToList} />;
      case 'list':
      default:
        return (
          <div>
            <h2>Parent Portal</h2>
            <SessionSelector onSessionSelect={handleSessionSelected} />
            <hr />
            <CamperList onSelectCamper={handleSelectCamperForProfile} />
            <hr />
            <RoommateRequests />
            <hr />
            <MessageForm />
            <MessageList />
            <PurchaseMessages />
          </div>
        );
    }
  };

  return <div>{renderContent()}</div>;
}

export default ParentPortal;
