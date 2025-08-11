import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

function CabinManagement() {
    const [cabins, setCabins] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [allCampers, setAllCampers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [selectedCabinId, setSelectedCabinId] = useState('');
    
    // ... (existing form states)

    useEffect(() => {
        // ... (existing cabin fetch)
        
        const unsubSessions = onSnapshot(collection(db, 'sessions'), (snapshot) => {
            setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubCampers = onSnapshot(collection(db, 'campers'), (snapshot) => {
            setAllCampers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            // ... (existing unsubscribe)
            unsubSessions();
            unsubCampers();
        };
    }, []);

    // ... (existing handlers)

    const campersInRoster = allCampers.filter(camper => 
        camper.cabinAssignments &&
        camper.cabinAssignments[selectedSessionId] === selectedCabinId
    );

    return (
        <div>
            <h2>Cabin Management</h2>
            {/* ... (existing add/edit forms) */}
            
            <h3>Cabin Roster</h3>
            <select onChange={(e) => setSelectedSessionId(e.target.value)} value={selectedSessionI}>
                <option value="">Select Session</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select onChange={(e) => setSelectedCabinId(e.target.value)} value={selectedCabinId}>
                <option value="">Select Cabin</option>
                {cabins.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            
            {selectedSessionId && selectedCabinId && (
                <ul>
                    {campersInRoster.length > 0 ? (
                        campersInRoster.map(camper => <li key={camper.id}>{camper.name}</li>)
                    ) : (
                        <p>No campers assigned to this cabin for this session.</p>
                    )}
                </ul>
            )}
        </div>
    );
}

export default CabinManagement;
