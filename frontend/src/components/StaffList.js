import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, query, onSnapshot } from 'firebase/firestore';

function StaffList({ onSelectStaff }) {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        const staffQuery = query(collection(db, 'staff'));
        const unsubscribe = onSnapshot(staffQuery, (snapshot) => {
            const staffData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStaff(staffData);
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch staff.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <p>Loading staff...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h3>All Staff</h3>
            <ul>
                {staff.map((staffMember) => (
                    <li key={staffMember.id} onClick={() => onSelectStaff(staffMember.id)}>
                        {staffMember.name} - <strong>Role:</strong> {staffMember.role}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default StaffList;
