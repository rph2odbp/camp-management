import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase-config';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

function AttachmentsTab({ camper }) {
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const attachmentsQuery = query(collection(db, `campers/${camper.id}/attachments`));
        const unsubscribe = onSnapshot(attachmentsQuery, (snapshot) => {
            const attachmentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAttachments(attachmentsData);
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch attachments.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [camper.id]);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `campers/${camper.id}/attachments/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            const attachmentsRef = collection(db, `campers/${camper.id}/attachments`);
            await addDoc(attachmentsRef, {
                name: file.name,
                url: downloadURL,
                storagePath: storageRef.fullPath, // Store the path for deletion
                createdAt: serverTimestamp()
            });

            setFile(null);
        } catch (err) {
            setError('Failed to upload file.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (attachment) => {
        if (!window.confirm(`Are you sure you want to delete ${attachment.name}?`)) return;

        try {
            // Delete from Storage
            const storageRef = ref(storage, attachment.storagePath);
            await deleteObject(storageRef);

            // Delete from Firestore
            const docRef = doc(db, `campers/${camper.id}/attachments`, attachment.id);
            await deleteDoc(docRef);
        } catch (err) {
            console.error("Error deleting attachment:", err);
            setError('Failed to delete attachment.');
        }
    };

    if (loading) return <p>Loading attachments...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h4>Attachments</h4>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {attachments.length > 0 ? (
                <ul>
                    {attachments.map(attachment => (
                        <li key={attachment.id}>
                            <a href={attachment.url} target="_blank" rel="noopener noreferrer">{attachment.name}</a>
                            <button onClick={() => handleDelete(attachment)} style={{ marginLeft: '10px' }}>Delete</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No attachments yet.</p>
            )}
        </div>
    );
}

export default AttachmentsTab;
