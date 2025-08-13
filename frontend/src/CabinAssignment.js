import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import './CabinAssignment.css';

function CabinAssignment() {
    const [cabins, setCabins] = useState([]);
    const [campers, setCampers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const cabinsSnapshot = await getDocs(collection(db, 'cabins'));
                const cabinsData = cabinsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), campers: [] }));
                
                const campersSnapshot = await getDocs(collection(db, 'campers'));
                const campersData = campersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Pre-assign campers to their cabins based on camper.cabinId
                const campersMap = new Map(campersData.map(c => [c.id, c]));
                cabinsData.forEach(cabin => {
                    const assignedCampers = campersData.filter(c => c.cabinId === cabin.id);
                    cabin.campers = assignedCampers;
                });
                
                setCabins(cabinsData);
                setCampers(campersData);

            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Failed to load cabin and camper data.');
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleDragStart = (e, camperId) => {
        e.dataTransfer.setData("camperId", camperId);
    };

    const handleDrop = (e, targetCabinId) => {
        e.preventDefault();
        const camperId = e.dataTransfer.getData("camperId");
        
        setCampers(prevCampers => {
            const camperIndex = prevCampers.findIndex(c => c.id === camperId);
            if (camperIndex === -1) return prevCampers;

            const updatedCampers = [...prevCampers];
            updatedCampers[camperIndex].cabinId = targetCabinId;
            return updatedCampers;
        });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleSaveAssignments = async () => {
        setSaving(true);
        setError('');
        
        const batch = writeBatch(db);
        campers.forEach(camper => {
            const camperRef = doc(db, 'campers', camper.id);
            batch.update(camperRef, { cabinId: camper.cabinId || null });
        });

        try {
            await batch.commit();
            alert('Cabin assignments saved successfully!');
        } catch (err) {
            console.error("Error saving assignments:", err);
            setError('Failed to save assignments.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>Loading cabin assignments...</p>;

    const unassignedCampers = campers.filter(c => !c.cabinId);
    
    // Recalculate cabin occupants based on the current state of campers
    const updatedCabins = cabins.map(cabin => ({
        ...cabin,
        campers: campers.filter(c => c.cabinId === cabin.id)
    }));

    return (
        <div className="cabin-assignment-container">
            {error && <p className="error-message">{error}</p>}
            <button onClick={handleSaveAssignments} disabled={saving} className="save-button">
                {saving ? 'Saving...' : 'Save All Assignments'}
            </button>
            <div className="assignment-area">
                <div className="unassigned-panel" onDrop={(e) => handleDrop(e, null)} onDragOver={handleDragOver}>
                    <h3>Unassigned Campers ({unassignedCampers.length})</h3>
                    <div className="camper-list">
                        {unassignedCampers.map(camper => (
                            <div key={camper.id} draggable onDragStart={(e) => handleDragStart(e, camper.id)} className="camper-card">
                                {camper.name}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="cabins-panel">
                    <h3>Cabins</h3>
                    <div className="cabin-list">
                        {updatedCabins.map(cabin => (
                            <div key={cabin.id} className="cabin-card" onDrop={(e) => handleDrop(e, cabin.id)} onDragOver={handleDragOver}>
                                <h4>{cabin.name} ({cabin.campers.length}/{cabin.capacity})</h4>
                                <div className="camper-drop-area">
                                    {cabin.campers.map(camper => (
                                         <div key={camper.id} draggable onDragStart={(e) => handleDragStart(e, camper.id)} className="camper-card assigned">
                                            {camper.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CabinAssignment;
