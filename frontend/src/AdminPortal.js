import React, { useState } from 'react';
import AdminSessionPanel from './AdminSessionPanel';
import UserManagement from './UserManagement';
import CabinManagement from './CabinManagement';
import CabinAssignment from './CabinAssignment';
import BroadcastMessageForm from './BroadcastMessageForm';
import MessagePrinting from './MessagePrinting';
import MessagePackageManagement from './MessagePackageManagement';
import AllCampersList from './AllCampersList';
import CamperProfile from './CamperProfile';
import StaffPortal from './StaffPortal';
import RegistrationManagement from './RegistrationManagement';
import RegistrationQuestionManagement from './RegistrationQuestionManagement';
import Dashboard from './Dashboard';
import Reporting from './Reporting';
import MedicalStaffPanel from './MedicalStaffPanel';

function AdminPortal() {
  const [selectedCamperId, setSelectedCamperId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeMessagingTab, setActiveMessagingTab] = useState('print');

  const handleSelectCamper = (camperId) => {
    setSelectedCamperId(camperId);
  };

  const handleBack = () => {
    setSelectedCamperId(null);
  };

  if (selectedCamperId) {
    return <CamperProfile camperId={selectedCamperId} onBack={handleBack} />;
  }

  const renderMessagingContent = () => {
    return (
      <div>
        <nav>
          <button onClick={() => setActiveMessagingTab('print')}>Print Messages</button>
          <button onClick={() => setActiveMessagingTab('broadcast')}>Send Broadcast</button>
        </nav>
        <hr />
        {activeMessagingTab === 'print' && <MessagePrinting />}
        {activeMessagingTab === 'broadcast' && <BroadcastMessageForm />}
      </div>
    );
  }

  return (
    <div>
      <h2>Admin Portal</h2>
      <nav>
        <button onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button onClick={() => setActiveTab('campers')}>Camper Management</button>
        <button onClick={() => setActiveTab('staff')}>Staff Management</button>
        <button onClick={() => setActiveTab('registration')}>Registration</button>
        <button onClick={() => setActiveTab('questions')}>Reg Questions</button>
        <button onClick={() => setActiveTab('cabins')}>Cabin Management</button>
        <button onClick={() => setActiveTab('cabin-assignments')}>Cabin Assignments</button>
        <button onClick={() => setActiveTab('messaging')}>Messaging</button>
        <button onClick={() => setActiveTab('reporting')}>Reporting</button>
        <button onClick={() => setActiveTab('medical')}>Medical</button>
      </nav>
      <hr />
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'campers' && <AllCampersList onSelectCamper={handleSelectCamper} />}
      {activeTab === 'staff' && <StaffPortal />}
      {activeTab === 'registration' && <RegistrationManagement onSelectCamper={handleSelectCamper} />}
      {activeTab === 'questions' && <RegistrationQuestionManagement />}
      {activeTab === 'cabins' && <CabinManagement />}
      {activeTab === 'cabin-assignments' && <CabinAssignment />}
      {activeTab === 'messaging' && renderMessagingContent()}
      {activeTab === 'reporting' && <Reporting />}
      {activeTab === 'medical' && <MedicalStaffPanel />}
      <hr />
      <UserManagement />
      <AdminSessionPanel />
      <MessagePackageManagement />
    </div>
  );
}

export default AdminPortal;
