import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase-config';
import { collection, query, onSnapshot, doc, getDocs, orderBy, addDoc, Timestamp, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

function MedicalPanel() {
    const [campers, setCampers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [allergyFilter, setAllergyFilter] = useState('');
    const [dietaryFilter, setDietaryFilter] = useState('');
    const [otherInfoFilter, setOtherInfoFilter] = useState('');
    const [medicationFilter, setMedicationFilter] = useState('');
    const [contactFilter, setContactFilter] = useState('');
    const [sortCriterion, setSortCriterion] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [expandedCamperId, setExpandedCamperId] = useState(null);
    const [medicalHistoryEntries, setMedicalHistoryEntries] = useState({});
    const [medicalObservations, setMedicalObservations] = useState({});
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [loadingObservations, setLoadingObservations] = useState(false);
    const [historyError, setHistoryError] = useState('');
    const [observationsError, setObservationsError] = useState('');
    const [newEntryType, setNewEntryType] = useState('');
    const [newEntryNotes, setNewEntryNotes] = useState('');
    const [addingEntry, setAddingEntry] = useState(false);
    const [addEntryError, setAddEntryError] = useState('');
    const [newMedicationName, setNewMedicationName] = useState('');
    const [newMedicationDosage, setNewMedicationDosage] = useState('');
    const [newMedicationTime, setNewMedicationTime] = useState('');
    const [newMedicationRoute, setNewMedicationRoute] = useState('');
    const [newInjuryType, setNewInjuryType] = useState('');
    const [newInjuryLocation, setNewInjuryLocation] = useState('');
    const [newInjuryCause, setNewInjuryCause] = useState('');
    const [newInjuryTreatment, setNewInjuryTreatment] = useState('');
    const [recordedByUsersData, setRecordedByUsersData] = useState({});
    const [loadingRecordedByUsers, setLoadingRecordedByUsers] = useState(false);
    const [newObservationType, setNewObservationType] = useState('');
    const [newObservationNotes, setNewObservationNotes] = useState('');
    const [addingObservation, setAddingObservation] = useState(false);
    const [addObservationError, setAddObservationError] = useState('');
    const [editingHistoryEntryId, setEditingHistoryEntryId] = useState(null);
    const [editEntryType, setEditEntryType] = useState('');
    const [editEntryNotes, setEditEntryNotes] = useState('');
    const [editMedicationName, setEditMedicationName] = useState('');
    const [editMedicationDosage, setEditMedicationDosage] = useState('');
    const [editMedicationTime, setEditMedicationTime] = useState('');
    const [editMedicationRoute, setEditMedicationRoute] = useState('');
    const [editInjuryType, setEditInjuryType] = useState('');
    const [editInjuryLocation, setEditInjuryLocation] = useState('');
    const [editInjuryCause, setEditInjuryCause] = useState('');
    const [editInjuryTreatment, setEditInjuryTreatment] = useState('');
    const [editingObservationId, setEditingObservationId] = useState(null);
    const [editObservationType, setEditObservationType] = useState('');
    const [editObservationNotes, setEditObservationNotes] = useState('');
    const [uploadingFile, setUploadingFile] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [activeTab, setActiveTab] = useState({});
    const [fileCategory, setFileCategory] = useState('');

    const storage = getStorage();
    const fileCategories = [
        "Immunization Record",
        "Insurance Card",
        "Doctor's Note",
        "Prescription",
        "Emergency Action Plan",
        "Other"
    ];

    useEffect(() => {
        setLoading(true);
        setError('');
        const q = query(collection(db, 'campers'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const campersData = [];
            querySnapshot.forEach((doc) => {
                campersData.push({ id: doc.id, ...doc.data() });
            });
            setCampers(campersData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching campers for Medical Panel: ", err);
            setError('Error fetching campers: ' + err.message);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleToggleExpand = (camperId) => {
        const isOpening = expandedCamperId !== camperId;
        setExpandedCamperId(isOpening ? camperId : null);
        if (isOpening) {
            setActiveTab(prev => ({ ...prev, [camperId]: 'overview' }));
        }
    };
    
    const handleSetTab = (camperId, tabName) => {
        setActiveTab(prev => ({ ...prev, [camperId]: tabName }));
    };

    const handleDeleteMedicalFile = async (camperId, fileToDelete) => {
        if (!window.confirm(`Are you sure you want to delete the file "${fileToDelete.name}"?`)) {
            return;
        }

        try {
            // 1. Delete file from Storage
            const fileRef = ref(storage, fileToDelete.path);
            await deleteObject(fileRef);
            console.log("File deleted from Storage.");

            // 2. Remove file metadata from Firestore
            const camperDocRef = doc(db, 'campers', camperId);
            const camperDocSnap = await getDoc(camperDocRef);
            if (camperDocSnap.exists()) {
                const camperData = camperDocSnap.data();
                const updatedFiles = camperData.otherMedicalFiles.filter(
                    (file) => file.path !== fileToDelete.path
                );
                await updateDoc(camperDocRef, {
                    otherMedicalFiles: updatedFiles
                });
                console.log("File metadata removed from Firestore.");
            }
        } catch (error) {
            console.error("Error deleting medical file:", error);
            alert("Error deleting file: " + error.message);
        }
    };
    
    const saveMedicalFileMetadata = async (camperId, fileMetadata) => {
        try {
            const camperDocRef = doc(db, 'campers', camperId);
            const camperDocSnap = await getDoc(camperDocRef);

            if (camperDocSnap.exists()) {
                const camperData = camperDocSnap.data();
                const existingFiles = camperData.otherMedicalFiles || [];
                const updatedFiles = [...existingFiles, fileMetadata];

                await updateDoc(camperDocRef, {
                    otherMedicalFiles: updatedFiles
                });
                console.log("Medical file metadata saved to Firestore.");
                setUploadSuccess('File uploaded and metadata saved successfully!');
                setUploadError('');
            } else {
                console.error("Camper document not found:", camperId);
                setUploadError('Error: Camper document not found.');
                setUploadSuccess('');
            }
        } catch (error) {
            console.error('Error saving medical file metadata:', error);
            setUploadError('Error saving file metadata: ' + error.message);
            setUploadSuccess('');
        }
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!expandedCamperId) {
            setUploadError("Please select a camper to upload files for.");
            return;
        }

        if (!fileCategory) {
            setUploadError("Please select a file category.");
            return;
        }

        setUploadingFile(true);
        setUploadError('');
        setUploadSuccess('');

        const storageRef = ref(storage, `campers/${expandedCamperId}/medical-files/${file.name}`);

        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            await saveMedicalFileMetadata(expandedCamperId, {
                name: file.name,
                url: downloadURL,
                path: snapshot.ref.fullPath,
                type: file.type,
                size: file.size,
                uploadedAt: Timestamp.now(),
                category: fileCategory,
            });

            setFileCategory('');
            event.target.value = null;

        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadError('Error uploading file: ' + error.message);
        } finally {
            setUploadingFile(false);
        }
    };

    const filteredCampers = campers.filter(camper => {
        const nameMatch = camper.name.toLowerCase().includes(searchTerm.toLowerCase());
        const allergyMatch = camper.allergies?.toLowerCase().includes(allergyFilter.toLowerCase()) || allergyFilter === '';
        const dietaryMatch = camper.dietaryRestrictions?.toLowerCase().includes(dietaryFilter.toLowerCase()) || dietaryFilter === '';
        const otherInfoMatch = camper.otherImportantInformation?.toLowerCase().includes(otherInfoFilter.toLowerCase()) || otherInfoFilter === '';

        return nameMatch && allergyMatch && dietaryMatch && otherInfoMatch;
    });

    const sortedCampers = [...filteredCampers].sort((a, b) => {
        const aValue = a[sortCriterion];
        const bValue = b[sortCriterion];
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    if (loading) return <p>Loading camper medical data...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (campers.length === 0) return <p>No camper medical data available.</p>;

    return (
        <div>
            <h2>Medical Panel</h2>
            {/* Search and filter inputs */}
            <div>
                <label htmlFor="searchCamper">Search by Name:</label>
                <input id="searchCamper" type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Camper name"/>
                {/* Other filters can be added here */}
            </div>

            <ul>
                {sortedCampers.map(camper => (
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
                                            <p><strong>Other Important Info:</strong> {camper.otherImportantInformation || 'None'}</p>
                                            
                                            <h4>Medications</h4>
                                            {camper.medication && camper.medication.length > 0 ? (
                                                <ul>{camper.medication.map((med, index) => <li key={index}>{med.type} - {med.dosage} ({med.time}) - Route: {med.route}</li>)}</ul>
                                            ) : <p>No medications listed.</p>}

                                            <h4>Emergency Contacts</h4>
                                            {camper.emergencyContacts && camper.emergencyContacts.length > 0 ? (
                                                <ul>{camper.emergencyContacts.map((contact, index) => <li key={index}>{contact.name} ({contact.relationship}): {contact.phone}</li>)}</ul>
                                            ) : <p>No emergency contacts listed.</p>}
                                        </div>
                                    )}

                                    {activeTab[camper.id] === 'history' && (
                                        <div>
                                            {/* Medical History & Observations will go here */}
                                            <p>Medical history and observations functionality to be displayed here.</p>
                                        </div>
                                    )}

                                    {activeTab[camper.id] === 'documents' && (
                                        <div>
                                            <h4>Medical Documents</h4>
                                            {fileCategories.map(category => {
                                                const filesInCategory = camper.otherMedicalFiles?.filter(file => file.category === category) || [];
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
                                            })}
                                            
                                            <div>
                                                <h5>Upload New Medical File</h5>
                                                <select value={fileCategory} onChange={(e) => setFileCategory(e.target.value)} required>
                                                    <option value="">Select a Category</option>
                                                    {fileCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                </select>
                                                <input type="file" onChange={handleFileSelect} disabled={uploadingFile} />
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
