import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import './CabinManagement.css';

function CabinManagement() {
    const [cabins, setCabins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isEditing, setIsEditing] = useState(false);
    const [currentCabin, setCurrentCabin] = useState({ name: '', capacity: '', gender: 'Co-ed' });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'cabins'), 
            (snapshot) => {
                const cabinsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCabins(cabinsData);
                setLoading(false);
            },
            (err) => {
                setError('Failed to fetch cabins.');
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentCabin({ ...currentCabin, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentCabin.name || !currentCabin.capacity || currentCabin.capacity <= 0) {
            setError('Please fill out all fields correctly.');
            return;
        }

        const dataToSave = {
            name: currentCabin.name,
            capacity: Number(currentCabin.capacity),
            gender: currentCabin.gender
        };

        try {
            if (isEditing) {
                const cabinRef = doc(db, 'cabins', currentCabin.id);
                await updateDoc(cabinRef, dataToSave);
            } else {
                await addDoc(collection(db, 'cabins'), dataToSave);
            }
            resetForm();
        } catch (err) {
            setError('Failed to save cabin.');
        }
    };
    
    const handleEdit = (cabin) => {
        setIsEditing(true);
        setCurrentCabin(cabin);
    };

    const handleDelete = async (cabinId) => {
        if (window.confirm('Are you sure you want to delete this cabin? This action cannot be undone.')) {
            try {
                await deleteDoc(doc(db, 'cabins', cabinId));
            } catch (err) {
                setError('Failed to delete cabin.');
            }
        }
    };
    
    const resetForm = () => {
        setIsEditing(false);
        setCurrentCabin({ name: '', capacity: '', gender: 'Co-ed' });
        setError('');
    };

    if (loading) return <p>Loading cabins...</p>;

    return (
        <div className="cabin-management-container">
            <h3>{isEditing ? 'Edit Cabin' : 'Create New Cabin'}</h3>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit} className="cabin-form">
                <input type="text" name="name" value={currentCabin.name} onChange={handleInputChange} placeholder="Cabin Name" required />
                <input type="number" name="capacity" value={currentCabin.capacity} onChange={handleInputChange} placeholder="Capacity" required />
                <select name="gender" value={currentCabin.gender} onChange={handleInputChange}>
                    <option value="Co-ed">Co-ed</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                <button type="submit">{isEditing ? 'Update Cabin' : 'Create Cabin'}</button>
                {isEditing && <button type="button" onClick={resetForm}>Cancel</button>}
            </form>

            <hr />

            <h3>Existing Cabins</h3>
            <div className="cabin-list">
                {cabins.map(cabin => (
                    <div key={cabin.id} className="cabin-item">
                        <h4>{cabin.name}</h4>
                        <p>Capacity: {cabin.capacity}</p>
                        <p>Gender: {cabin.gender}</p>
                        <div className="cabin-actions">
                            <button onClick={() => handleEdit(cabin)}>Edit</button>
                            <button onClick={() => handleDelete(cabin.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CabinManagement;
