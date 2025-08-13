import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './Auth';
import { auth, db } from './firebase-config';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ParentPortal from './ParentPortal';
import StaffPortal from './StaffPortal';
import AdminPortal from './AdminPortal';
import MedicalStaffPortal from './MedicalStaffPortal';
import ApplicantPortal from './ApplicantPortal';
import SessionList from './SessionList';
import GlobalSearch from './GlobalSearch';
import UserProfile from './UserProfile'; // The new unified profile view

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // State to specifically track admin status from token
  const [loadingUser, setLoadingUser] = useState(true);
  const [viewingProfileId, setViewingProfileId] = useState(null);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setLoadingUser(true);
      setIsAdmin(false); // Reset admin status on user change

      if (currentUser) {
        setUser(currentUser);
        
        // 1. Check for admin custom claim in the ID token
        const idTokenResult = await currentUser.getIdTokenResult();
        if (idTokenResult.claims.role === 'admin') { // CORRECTED CHECK
          console.log("Admin role claim detected. Granting admin access.");
          setIsAdmin(true);
        }

        // 2. Fetch user document from Firestore for other role data
        const userDocSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        }

      } else {
        setUser(null);
        setUserData(null);
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setViewingProfileId(null);
  };

  const handleSelectProfile = (userId) => {
    setViewingProfileId(userId);
  };

  const renderContent = () => {
    if (loadingUser) {
      return <p>Loading...</p>;
    }

    if (viewingProfileId) {
      return <UserProfile userId={viewingProfileId} onBack={() => setViewingProfileId(null)} />;
    }

    if (user) {
      // Prioritize admin status from token for portal access
      if (isAdmin) {
        return <AdminPortal />;
      }
      
      if (userData) {
        const { role, isHired } = userData;
        if (role === 'parent') return <ParentPortal />;
        if (role === 'medical') return <MedicalStaffPortal />;
        if (role === 'staff') {
          return isHired ? <StaffPortal /> : <ApplicantPortal />;
        }
      }
      // Fallback for non-admin users without a specific role in Firestore yet
      return <p>Your account is being processed. Please check your user role.</p>;
    }

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
        <div className="header-right">
          {/* Also use the token-based isAdmin flag for the search bar */}
          {isAdmin && <GlobalSearch onSelectResult={handleSelectProfile} />}
          {user && (
            <div className="user-info">
              <span>Welcome, {user.displayName || user.email}</span>
              <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
            </div>
          )}
        </div>
      </header>
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
