import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import UserManagement from './UserManagement';
import AdminSessionPanel from './AdminSessionPanel';
import Reporting from './Reporting';
import MessagePackageManagement from './MessagePackageManagement';
import ApplicationManagement from './ApplicationManagement';
import CabinManagement from './CabinManagement';
import KChat from './KChat';
import WaitlistManagement from './WaitlistManagement';

const seedDatabaseCallable = httpsCallable(getFunctions(), 'seedDatabase');

function AdminPortal() {
  const [activeTab, setActiveTab] = useState('users');
  const [seedMessage, setSeedMessage] = useState('');

  const handleSeedDatabase = async () => {
    if (!window.confirm("Are you sure you want to seed the database? This will add new data and may create duplicates.")) {
        return;
    }
    try {
        const result = await seedDatabaseCallable();
        // Corrected JavaScript syntax below
        setSeedMessage(result.data.message);
    } catch (error) {
        setSeedMessage("Error seeding database: " + error.message);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'users': return <UserManagement />;
      case 'sessions': return <AdminSessionPanel />;
      case 'cabins': return <CabinManagement />;
      case 'waitlist': return <WaitlistManagement />;
      case 'applications': return <ApplicationManagement />;
      case 'messaging': return <MessagePackageManagement />;
      case 'kchat': return <KChat />;
      case 'reporting': return <Reporting />;
      default: return <UserManagement />;
    }
  };

  return (
    <div>
      <h2>Admin Portal</h2>
      <nav>
        <button onClick={() => setActiveTab('users')}>User Management</button>
        <button onClick={() => setActiveTab('sessions')}>Session Management</button>
        <button onClick={() => setActiveTab('cabins')}>Cabin Management</button>
        <button onClick={() => setActiveTab('waitlist')}>Waitlist</button>
        <button onClick={() => setActiveTab('applications')}>Applications</button>
        <button onClick={() => setActiveTab('messaging')}>Messaging Packages</button>
        <button onClick={() => setActiveTab('kchat')}>KChat</button>
        <button onClick={() => setActiveTab('reporting')}>Reporting</button>
      </nav>
      <hr />
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h4>Database Seeding</h4>
          <p>Click the button below to populate the database with initial data like sessions and message packages.</p>
          <button onClick={handleSeedDatabase}>Seed Database</button>
          {seedMessage && <p>{seedMessage}</p>}
      </div>
      
      {renderActiveTab()}
    </div>
  );
}

export default AdminPortal;
