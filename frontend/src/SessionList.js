import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, query, onSnapshot } from 'firebase/firestore';

function SessionList() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Query to get the list of sessions
    const sessionsQuery = query(collection(db, 'sessions'));

    // Set up a real-time listener for the sessions collection
    const unsubscribe = onSnapshot(sessionsQuery, 
      (snapshot) => {
        const sessionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSessions(sessionsData);
        setLoading(false);
      }, 
      (err) => {
        console.error("Error fetching sessions: ", err);
        setError('Failed to fetch sessions. Please check security rules or network connection.');
        setLoading(false);
      }
    );

    // Cleanup function to unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, []); // The empty dependency array ensures this effect runs only once on mount

  if (loading) {
    return <p>Loading sessions...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (sessions.length === 0) {
    return <p>No sessions are currently available.</p>;
  }

  return (
    <div>
      <h2>Available Sessions</h2>
      <ul>
        {sessions.map((session) => (
          <li key={session.id}>
            <strong>{session.name}</strong> ({session.startDate} to {session.endDate})
            <p>Capacity: {session.capacity}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SessionList;
