import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, getDocs, doc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';

function CabinAssignment() {
    const [sessions, setSessions] = useState([]);
    const [allCampers, setAllCampers] = useState([]);
    const [cabins, setCabins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSessionId, setSelectedSessionId] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [sessionsSnapshot, cabinsSnapshot] = await Promise.all([
                    getDocs(collection(db, 'sessions')),
                    getDocs(collection(db, 'cabins'))
                ]);
                setSessions(sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setCabins(cabinsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                setError('Failed to fetch initial data.');
            }
            setLoading(false);
        };

        fetchInitialData();
        
        // Set up a listener for all campers
        const unsubscribeCampers = onSnapshot(collection(db, 'campers'), (snapshot) => {
            setAllCampers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribeCampers();
    }, []);

    const handleAssignCabin = async (camperId, newCabinId) => {
        const camperRef = doc(db, 'campers', camperId);
        const cabinAssignment = {
            ...((await getDocs(query(collection(db, 'campers'), where('__name__', '==', camperId)))).docs[0].data().cabinAssignments || {}),
            [selectedSessionId]: newCabinId
        };
        
        try {
            await updateDoc(camperRef, { cabinAssignments: cabinAssignment });
        } catch (err) {
            setError('Failed to assign cabin.');
        }
    };
    
    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    const campersInSession = selectedSessionId
        ? allCampers.filter(c => c.enrolledSessionIds?.includes(selectedSessionId))
        : [];

    const getCabinOccupancy = (cabinId) => {
        return allCampers.filter(c => c.cabinAssignments && c.cabinAssignments[selectedSessionId] === cabinId).length;
    };

    return (
        <div>
            <h2>Cabin Assignments</h2>
            <select onChange={(e) => setSelectedSessionId(e.target.value)} value={selectedSessionId}>
                <option value="">Select a Session</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            {selectedSessionId && (
                <table>
                    <thead>
                        <tr>
                            <th>Camper Name</th>
                            <th>Current Cabin</th>
                            <th>Assign to Cabin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campersInSession.map(camper => (
                            <tr key={camper.id}>
                                <td>{camper.name}</td>
                                <td>{cabins.find(c => c.id === camper.cabinAssignments?.[selectedSessionId])?.name || 'Unassigned'}</td>
                                <td>
                                    <select onChange={(e) => handleAssignCabin(camper.id, e.target.value)} value={camper.cabinAssignments?.[selectedSessionId] || ''}>
                                        <option value="">Unassign</option>
                                        {cabins.map(c => {
                                            const occupancy = getCabinOccupancy(c.id);
                                            const isFull = occupancy >= c.capacity;
                                            return (
                                                <option key={c.id} value={c.id} disabled={isFull}>
                                                    {c.name} ({occupancy}/{c.capacity}) {isFull ? '- Full' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default CabinAssignment;
