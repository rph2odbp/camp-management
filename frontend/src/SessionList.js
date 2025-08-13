import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

function SessionList() {
  const [sessions, setSessions] = useState([]);
  const [campers, setCampers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Query for sessions, ordered by start date
    const sessionQuery = query(collection(db, 'sessions'), orderBy('startDate'));

    const unsubscribeSessions = onSnapshot(sessionQuery, (querySnapshot) => {
      const sessionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSessions(sessionsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching sessions:", err);
      setError('Failed to load sessions. Please check the console for more details.');
      setLoading(false);
    });

    // Query for campers
    const camperQuery = query(collection(db, 'campers'));

    const unsubscribeCampers = onSnapshot(camperQuery, (querySnapshot) => {
        const campersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setCampers(campersData);
    }, (err) => {
        console.error("Error fetching campers:", err);
        // We might not want to show a fatal error for this,
        // as the primary data is sessions. Spots left can just be blank.
    });


    // Cleanup on unmount
    return () => {
      unsubscribeSessions();
      unsubscribeCampers();
    };
  }, []);

  // --- RESTORED HELPER FUNCTIONS ---
  const getSpotsLeft = (sessionId, capacity) => {
    const enrolledCount = campers.filter(c => 
        c.sessionRegistrations?.some(r => r.sessionId === sessionId && r.status === 'enrolled')
    ).length;
    return capacity - enrolledCount;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Add 1 to the day because of timezone conversion issues where it might show the previous day.
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });
  };
  // --- END RESTORED FUNCTIONS ---

  // --- New Logic to Split Sessions into Two Columns ---
  const midpoint = Math.ceil(sessions.length / 2);
  const leftColumnSessions = sessions.slice(0, midpoint);
  const rightColumnSessions = sessions.slice(midpoint);

  const renderSessionItem = (session) => {
    const spotsLeft = getSpotsLeft(session.id, session.capacity);
    const isFull = spotsLeft <= 0;
    const displayStatus = isFull
        ? "Full - Register to be added to the wait list."
        : `${spotsLeft} Openings`;

    return (
      <li key={session.id}>
        <strong>{session.name}</strong> ({formatDate(session.startDate)} to {formatDate(session.endDate)})
        <p className={isFull ? 'session-full' : 'session-openings'}>
            {displayStatus}
        </p>
      </li>
    );
  };

  if (loading) return <p>Loading sessions...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="session-list">
      <h2>Available Sessions</h2>
      <div className="session-columns">
        <ul className="session-column">
          {leftColumnSessions.map(renderSessionItem)}
        </ul>
        <ul className="session-column">
          {rightColumnSessions.map(renderSessionItem)}
        </ul>
      </div>
    </div>
  );
}

export default SessionList;
