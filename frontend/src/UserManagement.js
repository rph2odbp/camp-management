import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, onSnapshot } from 'firebase/firestore';

const setUserRoleCallable = httpsCallable(getFunctions(), 'setUserRole');

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roles, setRoles] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      const rolesData = {};
      usersData.forEach(user => {
        rolesData[user.id] = user.role || '';
      });
      setRoles(rolesData);
      setLoading(false);
    }, (err) => {
      setError('Failed to fetch users.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  const handleUpdateRole = async (userId) => {
    const newRole = roles[userId];
    if (!newRole) {
      setError('Please select a role.');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const result = await setUserRoleCallable({ uid: userId, role: newRole });
      setSuccess(result.data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h2>User Role Management</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

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
                  <option value="">Select Role</option>
                  <option value="parent">Parent</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="medical">Medical</option>
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
