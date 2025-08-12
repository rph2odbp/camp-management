import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

function SessionList() {
  const [sessions, setSessions] = useState([]);
  const [campers, setCampers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ... (data fetching remains the same)
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
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
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
