import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';

function Reporting() {
    // Static lists, small enough to fetch once
    const [sessions, setSessions] = useState([]);
    const [cabins, setCabins] = useState([]);
    
    // State for UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reportType, setReportType] = useState('registrations');
    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [selectedCabinId, setSelectedCabinId] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Fetch static data on component mount
    useEffect(() => {
        const fetchStaticData = async () => {
            setLoading(true);
            try {
                const [sessionsSnapshot, cabinsSnapshot] = await Promise.all([
                    getDocs(collection(db, 'sessions')),
                    getDocs(collection(db, 'cabins'))
                ]);
                setSessions(sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setCabins(cabinsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                setError('Failed to fetch initial report data.');
            } finally {
                setLoading(false);
            }
        };
        fetchStaticData();
    }, []);

    const downloadCSV = (data, filename) => {
        if (!data || data.length === 0) {
            alert('No data available to download for the selected criteria.');
            return;
        }
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generateReport = async () => {
        setIsGenerating(true);
        setError('');
        let data, filename, campersQuery;

        try {
            switch (reportType) {
                case 'registrations':
                    filename = 'camper_registrations.csv';
                    campersQuery = query(collection(db, 'campers'));
                    const allCampersSnapshot = await getDocs(campersQuery);
                    data = allCampersSnapshot.docs.map(c => {
                        const d = c.data();
                        return { id: c.id, name: d.name, status: d.registrationStatus, parentName: d.parentName, parentPhone: d.parentPhone, birthdate: d.birthdate, gender: d.gender };
                    });
                    break;

                case 'session_roster':
                    if (!selectedSessionId) {
                        alert('Please select a session.');
                        setIsGenerating(false);
                        return;
                    }
                    const session = sessions.find(s => s.id === selectedSessionId);
                    filename = `session_${session.name.replace(/\s+/g, '_')}_roster.csv`;
                    campersQuery = query(collection(db, 'campers'), where('enrolledSessionIds', 'array-contains', selectedSessionId));
                    const sessionCampersSnapshot = await getDocs(campersQuery);
                    data = sessionCampersSnapshot.docs.map(c => {
                        const d = c.data();
                        return { camperName: d.name, status: d.registrationStatus, parentName: d.parentName };
                    });
                    break;

                case 'cabin_roster':
                    if (!selectedCabinId || !selectedSessionId) {
                        alert('Please select a session and a cabin.');
                        setIsGenerating(false);
                        return;
                    }
                    const cabin = cabins.find(c => c.id === selectedCabinId);
                    const sessionForCabin = sessions.find(s => s.id === selectedSessionId);
                    filename = `cabin_${cabin.name.replace(/\s+/g, '_')}_session_${sessionForCabin.name.replace(/\s+/g, '_')}_roster.csv`;
                    // Firestore cannot query on map keys dynamically. We fetch by session and filter locally by cabin assignment.
                    campersQuery = query(collection(db, 'campers'), where('enrolledSessionIds', 'array-contains', selectedSessionId));
                    const cabinSessionCampersSnapshot = await getDocs(campersQuery);
                    data = cabinSessionCampersSnapshot.docs
                        .map(doc => ({id: doc.id, ...doc.data()}))
                        .filter(c => c.cabinAssignments && c.cabinAssignments[selectedSessionId] === selectedCabinId)
                        .map(c => ({ camperName: c.name, birthdate: c.birthdate, parentName: c.parentName }));
                    break;

                default:
                    alert('Please select a valid report type.');
                    setIsGenerating(false);
                    return;
            }
            downloadCSV(data, filename);
        } catch (err) {
            setError(`Failed to generate report: ${err.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) return <p>Loading report data...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Reporting</h2>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <option value="registrations">Camper Registrations</option>
                <option value="session_roster">Session Roster</option>
                <option value="cabin_roster">Cabin Roster</option>
            </select>

            {reportType === 'session_roster' && (
                <select value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)}>
                    <option value="">Select Session</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            )}
            
            {reportType === 'cabin_roster' && (
                <>
                    <select value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)}>
                        <option value="">Select Session</option>
                        {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select value={selectedCabinId} onChange={(e) => setSelectedCabinId(e.target.value)}>
                        <option value="">Select Cabin</option>
                        {cabins.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </>
            )}

            <button onClick={generateReport} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Download Report'}
            </button>
        </div>
    );
}

export default Reporting;
