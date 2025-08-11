import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, getDocs } from 'firebase/firestore';

function Reporting() {
    const [campers, setCampers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [cabins, setCabins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reportType, setReportType] = useState('registrations');
    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [selectedCabinId, setSelectedCabinId] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [campersSnapshot, sessionsSnapshot, cabinsSnapshot] = await Promise.all([
                    getDocs(collection(db, 'campers')),
                    getDocs(collection(db, 'sessions')),
                    getDocs(collection(db, 'cabins'))
                ]);
                setCampers(campersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setSessions(sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setCabins(cabinsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                setError('Failed to fetch report data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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

    const generateReport = () => {
        let data, filename;
        switch (reportType) {
            case 'registrations':
                filename = 'camper_registrations.csv';
                data = campers.map(c => ({ id: c.id, name: c.name, status: c.registrationStatus, parentName: c.parentName, parentPhone: c.parentPhone, birthdate: c.birthdate, gender: c.gender }));
                break;
            case 'session_roster':
                if (!selectedSessionId) {
                    alert('Please select a session.');
                    return;
                }
                const session = sessions.find(s => s.id === selectedSessionId);
                filename = `session_${session.name.replace(/\s+/g, '_')}_roster.csv`;
                data = campers
                    .filter(c => c.enrolledSessionIds?.includes(selectedSessionId))
                    .map(c => ({ camperName: c.name, status: c.registrationStatus, parentName: c.parentName }));
                break;
            case 'cabin_roster':
                if (!selectedCabinId || !selectedSessionId) {
                    alert('Please select a session and a cabin.');
                    return;
                }
                const cabin = cabins.find(c => c.id === selectedCabinId);
                const sessionForCabin = sessions.find(s => s.id === selectedSessionId);
                filename = `cabin_${cabin.name.replace(/\s+/g, '_')}_session_${sessionForCabin.name.replace(/\s+/g, '_')}_roster.csv`;
                data = campers
                    .filter(c => c.cabinAssignments && c.cabinAssignments[selectedSessionId] === selectedCabinId)
                    .map(c => ({ camperName: c.name, birthdate: c.birthdate, parentName: c.parentName }));
                break;
            default:
                alert('Please select a valid report type.');
                return;
        }
        downloadCSV(data, filename);
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

            <button onClick={generateReport}>Download Report</button>
        </div>
    );
}

export default Reporting;
