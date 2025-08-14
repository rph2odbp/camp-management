import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import './TimelineTab.css'; // Assuming you will create a CSS file for styles

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
        <div className="timeline-tab">
            <h4>Registration Timeline</h4>
            {timelineEvents.length > 0 ? (
                <div className="timeline">
                    {timelineEvents.map(event => (
                        <div key={event.id} className="timeline-item">
                            <div className="timeline-content">
                                <h5>{event.title}</h5>
                                <span className="timeline-date">{event.timestamp?.toDate().toLocaleString()}</span>
                                {event.details && <p>{event.details}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No timeline events yet.</p>
            )}
        </div>
    );
}

export default TimelineTab;
