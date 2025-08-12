// frontend/src/CabinManagement.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, onSnapshot, doc, addDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

function CabinManagement() {
    const [cabins, setCabins] = useState([]);
    const [campers, setCampers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newCabinName, setNewCabinName] = useState('');

    useEffect(() => {
        // ... (data fetching logic remains the same)
        const unsubCabins = onSnapshot(collection(db, 'cabins'), snapshot => setCabins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        const unsubCampers = onSnapshot(collection(db, 'campers'), snapshot => setCampers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        const unsubStaff = onSnapshot(collection(db, 'users'), snapshot => setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(u => u.role === 'staff')));
        setLoading(false);
        return () => { unsubCabins(); unsubCampers(); unsubStaff(); };
    }, []);

    const handleCreateCabin = async (e) => {
        e.preventDefault();
        if (!newCabinName.trim()) return;
        await addDoc(collection(db, 'cabins'), { name: newCabinName, assignedStaff: [], assignedCampers: [] });
        setNewCabinName('');
    };

    const assignItem = async (itemId, itemType, cabinId) => {
        const cabinRef = doc(db, 'cabins', cabinId);
        await updateDoc(cabinRef, {
            [itemType]: arrayUnion(itemId)
        });
    };
    
    const unassignItem = async (itemId, itemType, cabinId) => {
        const cabinRef = doc(db, 'cabins', cabinId);
        await updateDoc(cabinRef, {
            [itemType]: arrayRemove(itemId)
        });
    };

    const findCabinForCamper = (camperId) => cabins.find(c => c.assignedCampers.includes(camperId));
    const findCabinForStaff = (staffId) => cabins.find(c => c.assignedStaff.includes(staffId));

    if (loading) return <p>Loading cabin data...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Cabin Management</h2>
            {/* ... (Create Cabin Form remains the same) */}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* Unassigned Lists */}
                <div>
                    <h4>Unassigned Campers</h4>
                    <ul>
                        {campers.filter(c => !findCabinForCamper(c.id)).map(camper => (
                            <li key={camper.id}>
                                {camper.name}
                                <select onChange={(e) => assignItem(camper.id, 'assignedCampers', e.target.value)} value="">
                                    <option value="">Assign to...</option>
                                    {cabins.map(cabin => <option key={cabin.id} value={cabin.id}>{cabin.name}</option>)}
                                </select>
                            </li>
                        ))}
                    </ul>
                    <h4>Unassigned Staff</h4>
                    <ul>
                        {staff.filter(s => !findCabinForStaff(s.id)).map(staffMember => (
                            <li key={staffMember.id}>
                                {staffMember.firstName} {staffMember.lastName}
                                <select onChange={(e) => assignItem(staffMember.id, 'assignedStaff', e.target.value)} value="">
                                     <option value="">Assign to...</option>
                                    {cabins.map(cabin => <option key={cabin.id} value={cabin.id}>{cabin.name}</option>)}
                                </select>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Cabins List */}
                <div>
                    <h4>Cabins</h4>
                    {cabins.map(cabin => (
                        <div key={cabin.id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
                            <h5>{cabin.name}</h5>
                            <b>Staff:</b>
                            <ul>
                                {cabin.assignedStaff.map(staffId => {
                                    const staffMember = staff.find(s => s.id === staffId);
                                    return <li key={staffId}>{staffMember?.firstName} <button onClick={() => unassignItem(staffId, 'assignedStaff', cabin.id)}>x</button></li>;
                                })}
                            </ul>
                            <b>Campers:</b>
                            <ul>
                                {cabin.assignedCampers.map(camperId => {
                                    const camper = campers.find(c => c.id === camperId);
                                    return <li key={camperId}>{camper?.name} <button onClick={() => unassignItem(camperId, 'assignedCampers', cabin.id)}>x</button></li>;
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CabinManagement;
