import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, getDocs } from 'firebase/firestore';

function AllCampersList({ onSelectCamper }) {
    const [campers, setCampers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCampers = async () => {
            try {
                const campersSnapshot = await getDocs(collection(db, 'campers'));
                const campersData = campersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCampers(campersData);
            } catch (err) {
                setError('Failed to fetch campers.');
            } finally {
                setLoading(false);
            }
        };
        fetchCampers();
    }, []);

    if (loading) return <p>Loading all campers...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h3>All Registered Campers</h3>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Date of Birth</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {campers.map(camper => (
                        <tr key={camper.id}>
                            <td>{camper.name}</td>
                            <td>{camper.dateOfBirth}</td>
                            <td>
                                <button onClick={() => onSelectCamper(camper.id)}>View Profile</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AllCampersList;
