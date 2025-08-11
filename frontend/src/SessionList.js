import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, query, onSnapshot } from 'firebase/firestore';

function SessionList() {
  const [sessions, setSessions] = useState([]);
  const [campers, setCampers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const sessionsQuery = query(collection(db, 'sessions'));
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
        const sessionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSessions(sessionsData);
        setLoading(false);
    }, (err) => {
        setError('Failed to fetch sessions.');
        setLoading(false);
    });

    const campersQuery = query(collection(db, 'campers'));
    const unsubscribeCampers = onSnapshot(campersQuery, (snapshot) => {
        const campersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCampers(campersData);
    }, (err) => {
        setError('Failed to fetch campers.');
    });

    return () => {
        unsubscribeSessions();
        unsubscribeCampers();
    };
}, []);

  if (loading) {
    return <p>Loading sessions...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (sessions.length === 0) {
    return <p>No sessions available yet.</p>;
  }

  return (
    <div>
      <h2>Available Sessions</h2>
      <ul>
        {sessions.map((session) => {
          const enrolledCount = campers.filter(c => c.enrolledSessionIds?.includes(session.id)).length;
          const spotsAvailable = session.capacity - enrolledCount;
          return(
            <li key={session.id}>
              {session.name} ({session.startDate} to {session.endDate})
              <p>
                Availability: {spotsAvailable > 0 ? `${spotsAvailable} spots remaining` : 'Waitlist'}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  );
}

export default SessionList;