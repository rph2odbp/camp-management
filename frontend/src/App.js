import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './Auth';
import { auth, db } from './firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ParentPortal from './ParentPortal';
import StaffPortal from './StaffPortal';
import AdminPortal from './AdminPortal';
import MedicalStaffPortal from './MedicalStaffPortal';
import ApplicantPortal from './ApplicantPortal';
import SessionList from './SessionList';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocSnap = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const renderContent = () => {
    if (loadingUser) {
      return <p>Loading...</p>;
    }

    if (user && userData) {
      const { role, isHired } = userData;
      if (role === 'parent') return <ParentPortal />;
      if (role === 'admin') return <AdminPortal />;
      if (role === 'medical') return <MedicalStaffPortal />;
      if (role === 'staff') {
        return isHired ? <StaffPortal /> : <ApplicantPortal />;
      }
      return <p>Your account is being processed. Please check your user role.</p>;
    }

    // Default view for logged-out users
    return (
      <div>
        <Auth />
        <hr />
        <SessionList />
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Camp Abbey Summer Camp</h1>
        {user && (
          <div>
            <span>Welcome, {user.displayName || user.email}</span>
            <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
          </div>
        )}
      </header>
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
