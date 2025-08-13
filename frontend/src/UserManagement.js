import React, { useState, useEffect } from 'react';
import { functions } from './firebase-config'; // Assuming you have an httpsCallable function setup
import { httpsCallable } from 'firebase/functions';

const listAllUsers = httpsCallable(functions, 'listUsers');
const setUserRole = httpsCallable(functions, 'setUserRole');

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(null); // To track which user is being updated

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const result = await listAllUsers();
                const usersData = result.data.users;
                setUsers(usersData);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError('Failed to load user data. You must have admin privileges.');
            }
            setLoading(false);
        };
        fetchUsers();
    }, []);
    
    const handleRoleChange = async (uid, newRole) => {
        setUpdating(uid);
        setError('');
        try {
            await setUserRole({ uid, role: newRole });
            // Optimistically update the UI or refetch
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.uid === uid ? { ...user, role: newRole } : user
                )
            );
        } catch (err) {
            console.error("Error setting user role:", err);
            setError('Failed to update role. Please try again.');
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return <p>Loading users...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="user-management-container">
            <h3>Manage User Roles</h3>
            <table>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Current Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.uid}>
                            <td>{user.email}</td>
                            <td>{user.role || 'parent'}</td>
                            <td>
                                <select 
                                    value={user.role || 'parent'}
                                    onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                                    disabled={updating === user.uid}
                                >
                                    <option value="parent">Parent</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                                {updating === user.uid && <span style={{ marginLeft: '10px' }}>Saving...</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserManagement;
