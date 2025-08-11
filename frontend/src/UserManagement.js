import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [roles, setRoles] = useState({});
    
    // State for new user form
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('parent');
    const [isCreating, setIsCreating] = useState(false);
    const [success, setSuccess] = useState('');
    
    const functions = getFunctions();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
            const rolesData = {};
            usersData.forEach(user => {
                rolesData[user.id] = user.role || 'parent';
            });
            setRoles(rolesData);
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch users.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        setError('');
        setSuccess('');
        try {
            const createUser = httpsCallable(functions, 'createUser');
            const result = await createUser({
                email: newUserEmail,
                password: newUserPassword,
                role: newUserRole
            });
            setSuccess(result.data.result);
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserRole('parent');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsCreating(false);
        }
    };
    
    const handleUpdateRole = async (userId) => {
        const newRole = roles[userId];
        const userRef = doc(db, 'users', userId);
        try {
            await updateDoc(userRef, { role: newRole });
            alert('User role updated successfully!');
        } catch (err) {
            setError('Failed to update user role.');
        }
    };
    
    const handleRoleChange = (userId, newRole) => {
        setRoles(prev => ({...prev, [userId]: newRole}));
    };

    if (loading) return <p>Loading users...</p>;

    return (
        <div>
            <h2>User Role Management</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <form onSubmit={handleCreateUser}>
                <h4>Create New User</h4>
                <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="Email" required />
                <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Password" required />
                <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
                    <option value="parent">Parent</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit" disabled={isCreating}>{isCreating ? 'Creating...' : 'Create User'}</button>
            </form>

            <hr />

            <table>
                <thead>
                    <tr>
                        <th>User Email</th>
                        <th>Current Role</th>
                        <th>New Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <select value={roles[user.id] || ''} onChange={(e) => handleRoleChange(user.id, e.target.value)}>
                                    <option value="parent">Parent</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td>
                                <button onClick={() => handleUpdateRole(user.id)}>Update Role</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserManagement;
