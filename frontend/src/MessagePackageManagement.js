import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

function MessagePackageManagement() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [newPackageName, setNewPackageName] = useState('');
    const [newPackagePrice, setNewPackagePrice] = useState('');
    const [newPackageCredits, setNewPackageCredits] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const [editingPackageId, setEditingPackageId] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', price: '', credits: '' });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'message_packages'), 
            (snapshot) => {
                const packagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPackages(packagesData);
                setLoading(false);
            },
            (err) => {
                setError('Failed to fetch packages.');
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const handleAddPackage = async (e) => {
        e.preventDefault();
        setIsAdding(true);
        try {
            await addDoc(collection(db, 'message_packages'), {
                name: newPackageName,
                price: Number(newPackagePrice),
                credits: Number(newPackageCredits),
            });
            setNewPackageName('');
            setNewPackagePrice('');
            setNewPackageCredits('');
        } catch (err) {
            setError('Failed to add package.');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeletePackage = async (packageId) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            await deleteDoc(doc(db, 'message_packages', packageId));
        }
    };

    const handleEditClick = (pkg) => {
        setEditingPackageId(pkg.id);
        setEditFormData({ name: pkg.name, price: pkg.price, credits: pkg.credits });
    };

    const handleUpdatePackage = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        await updateDoc(doc(db, 'message_packages', editingPackageId), {
            name: editFormData.name,
            price: Number(editFormData.price),
            credits: Number(editFormData.credits)
        });
        setEditingPackageId(null);
        setIsUpdating(false);
    };

    if (loading) return <p>Loading packages...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Message Package Management</h2>
            {editingPackageId ? (
                <form onSubmit={handleUpdatePackage}>
                    <h3>Edit Package</h3>
                    <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} required />
                    <input type="number" value={editFormData.price} onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })} required />
                    <input type="number" value={editFormData.credits} onChange={(e) => setEditFormData({ ...editFormData, credits: e.target.value })} required />
                    <button type="submit" disabled={isUpdating}>Update</button>
                    <button type="button" onClick={() => setEditingPackageId(null)}>Cancel</button>
                </form>
            ) : (
                <form onSubmit={handleAddPackage}>
                    <h3>Add New Package</h3>
                    <input type="text" value={newPackageName} onChange={(e) => setNewPackageName(e.target.value)} placeholder="Package Name" required />
                    <input type="number" value={newPackagePrice} onChange={(e) => setNewPackagePrice(e.target.value)} placeholder="Price (USD)" required />
                    <input type="number" value={newPackageCredits} onChange={(e) => setNewPackageCredits(e.target.value)} placeholder="Message Credits" required />
                    <button type="submit" disabled={isAdding}>Add Package</button>
                </form>
            )}

            <ul>
                {packages.map(pkg => (
                    <li key={pkg.id}>
                        <p><strong>{pkg.name}</strong> - ${pkg.price} for {pkg.credits} credits</p>
                        <button onClick={() => handleEditClick(pkg)}>Edit</button>
                        <button onClick={() => handleDeletePackage(pkg.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MessagePackageManagement;
