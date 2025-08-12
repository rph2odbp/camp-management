import React, { useState, useEffect } from 'react';
import { db } from './firebase-config'; // Assuming firebase-config exports db
import { collection, query, onSnapshot, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * MedicalPanel Component
 * 
 * This component provides a dashboard for medical staff to view camper information,
 * manage medical documents, and review medical details like allergies and medications.
 * 
 * Features:
 * - Fetches and displays a list of all campers in real-time.
 * - Allows searching for campers by name.
 * - Accordion-style view to expand a camper's detailed information.
 * - Tabbed interface within each camper's view for 'Overview' and 'Documents'.
 * - 'Overview' tab shows allergies, dietary restrictions, medications, and emergency contacts.
 * - 'Documents' tab allows uploading and deleting medical files (e.g., insurance cards, doctor's notes).
 * - File uploads are categorized and displayed with their name, size, and a delete button.
 */
function MedicalPanel() {
    // State for core functionality
    const [campers, setCampers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // State for UI interaction
    const [expandedCamperId, setExpandedCamperId] = useState(null);
    const [activeTab, setActiveTab] = useState({});

    // State for file uploads
    const [uploadingFile, setUploadingFile] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [fileCategory, setFileCategory] = useState('');

    // Initialize Firebase services
    const storage = getStorage();

    // Defined categories for medical file uploads
    const fileCategories = [
        "Immunization Record",
        "Insurance Card",
        "Doctor's Note",
        "Prescription",
        "Emergency Action Plan",
        "Other"
    ];

    // Effect to subscribe to real-time camper data from Firestore
    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'campers'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const campersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCampers(campersData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching campers for Medical Panel: ", err);
            setError('Error fetching campers: ' + err.message);
            setLoading(false);
        });
        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, []);

    // Toggles the expanded view for a camper
    const handleToggleExpand = (camperId) => {
        const isOpening = expandedCamperId !== camperId;
        setExpandedCamperId(isOpening ? camperId : null);
        // Default to 'overview' tab when opening
        if (isOpening) {
            setActiveTab(prev => ({ ...prev, [camperId]: 'overview' }));
        }
    };
    
    // Sets the active tab for a given camper
    const handleSetTab = (camperId, tabName) => {
        setActiveTab(prev => ({ ...prev, [camperId]: tabName }));
    };

    // Deletes a medical file from both Firebase Storage and its metadata from Firestore
    const handleDeleteMedicalFile = async (camperId, fileToDelete) => {
        if (!window.confirm(`Are you sure you want to delete the file "${fileToDelete.name}"?`)) {
            return;
        }

        try {
            // Delete file from Storage
            const fileRef = ref(storage, fileToDelete.path);
            await deleteObject(fileRef);

            // Remove file metadata from Firestore
            const camperDocRef = doc(db, 'campers', camperId);
            const camperDocSnap = await getDoc(camperDocRef);
            if (camperDocSnap.exists()) {
                const updatedFiles = (camperDocSnap.data().otherMedicalFiles || []).filter(
                    (file) => file.path !== fileToDelete.path
                );
                await updateDoc(camperDocRef, { otherMedicalFiles: updatedFiles });
            }
        } catch (err) {
            console.error("Error deleting medical file:", err);
            alert("Error deleting file: " + err.message);
        }
    };
    
    // Handles the file selection, upload to Storage, and metadata saving to Firestore
    const handleFileSelect = async (event, camperId) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!fileCategory) {
            setUploadError("Please select a file category.");
            return;
        }

        setUploadingFile(true);
        setUploadError('');
        setUploadSuccess('');

        const storageRef = ref(storage, `campers/${camperId}/medical-files/${file.name}`);

        try {
            // Upload file
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Prepare metadata
            const fileMetadata = {
                name: file.name,
                url: downloadURL,
                path: snapshot.ref.fullPath,
                type: file.type,
                size: file.size,
                uploadedAt: Timestamp.now(),
                category: fileCategory,
            };

            // Save metadata to Firestore
            const camperDocRef = doc(db, 'campers', camperId);
            const camperDocSnap = await getDoc(camperDocRef);
            if (camperDocSnap.exists()) {
                const existingFiles = camperDocSnap.data().otherMedicalFiles || [];
                await updateDoc(camperDocRef, {
                    otherMedicalFiles: [...existingFiles, fileMetadata]
                });
                setUploadSuccess('File uploaded successfully!');
            } else {
                throw new Error("Camper document not found.");
            }

            // Reset form
            setFileCategory('');
            event.target.value = null;

        } catch (err) {
            console.error('Error uploading file:', err);
            setUploadError('Upload failed: ' + err.message);
        } finally {
            setUploadingFile(false);
        }
    };

    // Filter campers based on search term
    const filteredCampers = campers.filter(camper => 
        camper.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <p>Loading camper medical data...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (campers.length === 0) return <p>No camper medical data available.</p>;

    return (
        <div>
            <h2>Medical Panel</h2>
            <div>
                <label htmlFor="searchCamper">Search by Name: </label>
                <input 
                    id="searchCamper" 
                    type="text" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder="Camper name"
                />
            </div>

            <ul>
                {filteredCampers.map(camper => (
                    <li key={camper.id}>
                        <div onClick={() => handleToggleExpand(camper.id)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                            <h3>{camper.name}</h3>
                            <p>DOB: {camper.dateOfBirth}</p>
                        </div>

                        {expandedCamperId === camper.id && (
                            <div>
                                <div className="tabs">
                                    <button onClick={() => handleSetTab(camper.id, 'overview')} className={activeTab[camper.id] === 'overview' ? 'active' : ''}>Overview</button>
                                    <button onClick={() => handleSetTab(camper.id, 'history')} className={activeTab[camper.id] === 'history' ? 'active' : ''}>History & Notes</button>
                                    <button onClick={() => handleSetTab(camper.id, 'documents')} className={activeTab[camper.id] === 'documents' ? 'active' : ''}>Documents</button>
                                </div>

                                <div className="tab-content">
                                    {activeTab[camper.id] === 'overview' && (
                                        <div>
                                            <h4>Medical Information</h4>
                                            <p><strong>Allergies:</strong> {camper.allergies || 'None'}</p>
                                            <p><strong>Dietary Restrictions:</strong> {camper.dietaryRestrictions || 'None'}</p>
                                            
                                            <h4>Medications</h4>
                                            {camper.medication?.length > 0 ? (
                                                <ul>{camper.medication.map((med, index) => <li key={index}>{med.type} - {med.dosage} ({med.time}) - Route: {med.route}</li>)}</ul>
                                            ) : <p>No medications listed.</p>}

                                            <h4>Emergency Contacts</h4>
                                            {camper.emergencyContacts?.length > 0 ? (
                                                <ul>{camper.emergencyContacts.map((contact, index) => <li key={index}>{contact.name} ({contact.relationship}): {contact.phone}</li>)}</ul>
                                            ) : <p>No emergency contacts listed.</p>}
                                        </div>
                                    )}

                                    {activeTab[camper.id] === 'history' && (
                                        <div>
                                            <p>Medical history and note-taking features will be implemented here.</p>
                                        </div>
                                    )}

                                    {activeTab[camper.id] === 'documents' && (
                                        <div>
                                            <h4>Medical Documents</h4>
                                            {/* Display existing files */}
                                            {camper.otherMedicalFiles?.length > 0 ? (
                                                fileCategories.map(category => {
                                                    const filesInCategory = camper.otherMedicalFiles.filter(file => file.category === category);
                                                    if (filesInCategory.length === 0) return null;
                                                    return (
                                                        <div key={category}>
                                                            <h5>{category}</h5>
                                                            <ul>
                                                                {filesInCategory.map((file, index) => (
                                                                    <li key={index}>
                                                                        <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                                                                        {' '} ({(file.size / 1024).toFixed(2)} KB)
                                                                        <button onClick={() => handleDeleteMedicalFile(camper.id, file)}>Delete</button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    );
                                                })
                                            ) : <p>No medical documents uploaded.</p>}
                                            
                                            {/* File upload form */}
                                            <div>
                                                <h5>Upload New Medical File</h5>
                                                <select value={fileCategory} onChange={(e) => setFileCategory(e.target.value)} required>
                                                    <option value="">Select a Category</option>
                                                    {fileCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                </select>
                                                <input type="file" onChange={(e) => handleFileSelect(e, camper.id)} disabled={uploadingFile || !fileCategory} />
                                                {uploadingFile && <p>Uploading...</p>}
                                                {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
                                                {uploadSuccess && <p style={{ color: 'green' }}>{uploadSuccess}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MedicalPanel;
