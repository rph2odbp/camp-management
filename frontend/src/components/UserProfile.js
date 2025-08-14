// frontend/src/UserProfile.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase-config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

function UserProfile({ userId, onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [camperData, setCamperData] = useState([]);
  const [applicationData, setApplicationData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch user document
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUserData({ id: userDoc.id, ...userDoc.data() });
        }

        // Fetch associated camper profiles
        const campersQuery = query(collection(db, 'campers'), where('parentId', '==', userId));
        const campersSnapshot = await getDocs(campersQuery);
        const campers = campersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setCamperData(campers);

        // Fetch associated applications
        const appsQuery = query(collection(db, 'applications'), where('userId', '==', userId));
        const appsSnapshot = await getDocs(appsQuery);
        const applications = appsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setApplicationData(applications);

      } catch (err) {
        setError('Failed to load profile data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    // If the profile being viewed is the current user's,
    // force a token refresh to get the latest custom claims.
    if (auth.currentUser && auth.currentUser.uid === userId) {
      auth.currentUser.getIdToken(true);
    }
  }, [userId]);


  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="user-profile-container">
      <button onClick={onBack} className="back-button">← Back to App</button>
      
      {userData && (
        <div className="profile-section">
          <h2>{userData.email} ({userData.role})</h2>
        </div>
      )}

      {camperData.length > 0 && (
        <div className="profile-section">
          <h3>Camper History</h3>
          {camperData.map(camper => (
            <div key={camper.id} className="profile-card">
              <h4>{camper.firstName} {camper.lastName}</h4>
              <p><strong>DOB:</strong> {camper.dateOfBirth}</p>
              <p><strong>Registrations:</strong></p>
              <ul>
                {camper.sessionRegistrations?.map((reg, index) => (
                  <li key={index}>{reg.sessionId} ({reg.status})</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {applicationData.length > 0 && (
        <div className="profile-section">
          <h3>Employment History</h3>
          {applicationData.map(app => (
            <div key={app.id} className="profile-card">
              <h4>Application for {app.desiredPosition}</h4>
              <p><strong>Status:</strong> {app.status}</p>
              <p><strong>Submitted:</strong> {app.submittedAt?.toDate().toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserProfile;
