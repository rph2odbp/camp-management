// frontend/src/MedicalFiles.js
import React, { useState } from 'react';
import { db, storage } from '../firebase-config';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '../firebase-config';

function MedicalFiles({ camperId, existingFiles }) {
    const [newFiles, setNewFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => setNewFiles(Array.from(e.target.files));

    const handleUpload = async () => {
        // ... (upload logic remains the same)
    };

    const handleDelete = async (fileToDelete) => {
        if (!window.confirm(`Are you sure you want to delete ${fileToDelete.name}?`)) return;

        try {
            // 1. Delete from Firebase Storage
            const fileRef = ref(storage, fileToDelete.url);
            await deleteObject(fileRef);

            // 2. Remove from Firestore document
            const camperDocRef = doc(db, 'campers', camperId);
            await updateDoc(camperDocRef, {
                otherMedicalFiles: arrayRemove(fileToDelete)
            });

            alert('File deleted successfully.');
        } catch (e) {
            setError('Failed to delete file.');
            console.error(e);
        }
    };

    return (
        <div>
            <h4>Medical Documents</h4>
            <h5>Existing Documents:</h5>
            {existingFiles.length > 0 ? (
                <ul>
                    {existingFiles.map((file, index) => (
                        <li key={index}>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                            <button onClick={() => handleDelete(file)} style={{ marginLeft: '10px' }}>Delete</button>
                        </li>
                    ))}
                </ul>
            ) : <p>No documents on file.</p>}
            <hr />
            <h5>Upload New Documents:</h5>
            <input type="file" multiple onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Files'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default MedicalFiles;
