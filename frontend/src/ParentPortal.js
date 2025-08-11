import React, { useState } from 'react';
import AddCamperForm from './AddCamperForm';
import CamperList from './CamperList';
import SessionList from './SessionList';
import MessageForm from './MessageForm';
import MessageList from './MessageList';
import PurchaseMessages from './PurchaseMessages';
import CamperProfile from './CamperProfile';
import RoommateRequests from './RoommateRequests';

function ParentPortal() {
  const [selectedCamperId, setSelectedCamperId] = useState(null);

  const handleSelectCamper = (camperId) => {
    setSelectedCamperId(camperId);
  };

  const handleBackToList = () => {
    setSelectedCamperId(null);
  };

  if (selectedCamperId) {
    return <CamperProfile camperId={selectedCamperId} onBack={handleBackToList} />;
  }

  return (
    <div>
      <h2>Parent Portal</h2>
      <RoommateRequests />
      <hr />
      <AddCamperForm />
      <CamperList onSelectCamper={handleSelectCamper} />
      <SessionList />
      <MessageForm />
      <MessageList />
      <PurchaseMessages />
    </div>
  );
}

export default ParentPortal;
