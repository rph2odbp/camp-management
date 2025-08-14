import React, { useState, useEffect, useMemo } from 'react';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import './Dashboard.css';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
};

function Dashboard() {
    const [sessionData, setSessionData] = useState([]);
    const [campers, setCampers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedSessionId, setSelectedSessionId] = useState('');

    useEffect(() => {
        const db = getFirestore(); // Get the Firestore instance here
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const sessionsQuery = query(collection(db, 'sessions'), orderBy('startDate'));
                const [sessionsSnapshot, campersSnapshot] = await Promise.all([
                    getDocs(sessionsQuery),
                    getDocs(collection(db, 'campers'))
                ]);

                const sessions = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const allCampers = campersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setCampers(allCampers);

                const processedSessionData = sessions.map(session => {
                    let enrolledCount = 0;
                    let waitlistedCount = 0;
                    allCampers.forEach(camper => {
                        if (camper.sessionRegistrations?.some(reg => reg.sessionId === session.id && reg.status === 'enrolled')) {
                            enrolledCount++;
                        }
                        if (camper.sessionRegistrations?.some(reg => reg.sessionId === session.id && reg.status === 'waitlisted')) {
                            waitlistedCount++;
                        }
                    });
                    return { ...session, enrolledCount, waitlistedCount };
                });
                setSessionData(processedSessionData);

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError('Failed to load required data.');
            }
            setLoading(false);
        };
        fetchAllData();
    }, []);
    
    const { years, filteredSessions, filteredCampers } = useMemo(() => {
        const years = [...new Set(sessionData.map(s => s.startDate.substring(0, 4)))].sort((a,b) => b-a);
        
        const filteredSessions = sessionData.filter(s => s.startDate.startsWith(selectedYear));

        let filteredCampers = campers;
        if (selectedSessionId) {
            filteredCampers = filteredCampers.filter(c => 
                c.sessionRegistrations?.some(reg => reg.sessionId === selectedSessionId && reg.status === 'enrolled')
            );
        }

        return { years, filteredSessions, filteredCampers };
    }, [selectedYear, selectedSessionId, sessionData, campers]);

    if (loading) return <p>Loading dashboard data...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="dashboard-layout">
            <div className="stats-sidebar">
                <h3>Session Stats</h3>
                {sessionData.map(session => (
                    <div key={session.id} className="session-stat-card-compact">
                        <h5>{session.name}</h5>
                        <p>{formatDate(session.startDate)}</p>
                        <div className="session-counts-compact">
                            <span>Enrolled: <strong>{session.enrolledCount}</strong></span>
                            <span>Waitlisted: <strong>{session.waitlistedCount}</strong></span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="camper-view-area">
                <div className="filters-container">
                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select value={selectedSessionId} onChange={e => setSelectedSessionId(e.target.value)}>
                        <option value="">-- Select a Session --</option>
                        {filteredSessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="camper-list-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Age</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCampers.map(camper => (
                                <tr key={camper.id}>
                                    <td>{camper.name}</td>
                                    <td>{/* Age calculation would go here */}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
