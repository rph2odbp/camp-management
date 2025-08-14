// frontend/src/Charting.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

function Charting({ camper }) {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const chartCollectionRef = collection(db, `campers/${camper.id}/chart`);
        const q = query(chartCollectionRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setChartData(data);
            setLoading(false);
        }, (err) => {
            setError('Failed to load chart data.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [camper.id]);

    if (loading) return <p>Loading chart...</p>;
    if (error) return <p style={{color: 'red'}}>{error}</p>;

    return (
        <div>
            <h4>Medical Chart</h4>
            {chartData.length > 0 ? (
                <ul>
                    {chartData.map(entry => (
                        <li key={entry.id}>
                            <strong>{new Date(entry.timestamp.toDate()).toLocaleString()}:</strong> {entry.note}
                            {entry.type === 'hospital_visit' && (
                                <p>Hospital Visit: {entry.hospitalName} - Reason: {entry.reason}</p>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No chart entries for this camper.</p>
            )}
        </div>
    );
}

export default Charting;
