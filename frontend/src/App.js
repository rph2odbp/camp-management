import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import { auth, db } from './firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ParentPortal from './ParentPortal';
import StaffPortal from './StaffPortal';
import AdminPortal from './AdminPortal';
import RegistrationForm from './RegistrationForm';
import SessionList from './SessionList';
import EmployeeApplicationForm from './EmployeeApplicationForm';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [view, setView] = useState('main'); // 'main', 'register', 'apply'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserRole(userDocSnap.data().role);
          } else {
            setUserRole(null); 
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    if (loadingUser) {
      return <p>Loading...</p>;
    }

    if (view === 'apply') {
        return <EmployeeApplicationForm />;
    }
    
    if (view === 'register') {
        return <RegistrationForm />;
    }

    if (user) {
        if (userRole === 'parent') return <ParentPortal />;
        if (userRole === 'staff') return <StaffPortal />;
        if (userRole === 'admin') return <AdminPortal />;
        return <p>Your account is being processed. Please check back later.</p>;
    }

    // Default view for logged-out users
    return (
        <div>
            <SessionList />
            <p>
                <button onClick={() => setView('register')}>Register a Camper</button>
                <button onClick={() => setView('apply')}>Apply for a Job</button>
            </p>
        </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Camper Management System</h1>
        <button onClick={() => setView('main')}>Home</button>
        <Auth />
      </header>
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
