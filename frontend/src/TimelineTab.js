import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

function TimelineTab({ camper }) {
    const [timelineEvents, setTimelineEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        const timelineQuery = query(collection(db, `campers/${camper.id}/timeline`), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(timelineQuery, (snapshot) => {
            const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTimelineEvents(eventsData);
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch timeline events.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [camper.id]);

    if (loading) return <p>Loading timeline...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h4>Registration Timeline</h4>
            {timelineEvents.length > 0 ? (
                <ul>
                    {timelineEvents.map(event => (
                        <li key={event.id}>
                            <strong>{event.title}</strong> - {event.timestamp?.toDate().toLocaleString()}
                            {event.details && <p>{event.details}</p>}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No timeline events yet.</p>
            )}
        </div>
    );
}

export default TimelineTab;
