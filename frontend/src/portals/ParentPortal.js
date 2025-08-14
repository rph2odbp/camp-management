import React, { useState, useEffect } from 'react';
import RegistrationFlow from '../components/RegistrationFlow';
import CamperList from '../components/CamperList';
import SessionSelector from '../components/SessionSelector';
import MessageForm from '../components/MessageForm';
import MessageList from '../components/MessageList';
import PurchaseMessages from '../components/PurchaseMessages';
import CamperProfile from '../components/CamperProfile';
import RoommateRequests from '../components/RoommateRequests';
import SessionList from '../components/SessionList';
import { db } from '../firebase-config';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';

function ParentPortal({ user }) {
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
          <RegistrationFlow 
            sessionId={selectedSessionId} 
            isWaitlisted={isWaitlisted}
            onRegistrationComplete={handleBackToList} 
          />
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
            <SessionList />
            <hr />
            <CamperList user={user} onSelectCamper={handleSelectCamperForProfile} />
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
