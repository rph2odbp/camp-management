import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase-config'; // Import Firestore and Storage instances
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Import necessary Firestore functions
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'; // Import necessary Storage functions, including deleteObject
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique file names
import { auth } from './firebase-config'; // Import auth to get current user UID


function EditCamperForm({ camperId, onCancel }) {
  const [camperName, setCamperName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  // State variables for medical information
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [otherImportantInformation, setOtherImportantInformation] = useState('');
  const [healthInsuranceProvider, setHealthInsuranceProvider] = useState('');
  const [healthInsurancePolicyNumber, setHealthInsurancePolicyNumber] = useState('');
  // State for dynamic medication and emergency contacts
  const [medication, setMedication] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  // State for file uploads
  const [insuranceCardFile, setInsuranceCardFile] = useState(null);
  // State for new other medical files to upload with categories
  const [newFilesToUpload, setNewFilesToUpload] = useState([]);
  // State for existing file URLs (to display and potentially manage)
  const [existingInsuranceCardUrl, setExistingInsuranceCardUrl] = useState(null);
  const [existingOtherMedicalFiles, setExistingOtherMedicalFiles] = useState([]);


  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0); // State to track upload progress
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCamper = async () => {
      setLoading(true);
      setError('');
      try {
        const docRef = doc(db, 'campers', camperId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCamperName(data.name);
          setDateOfBirth(data.dateOfBirth);
          setMedicalHistory(data.medicalHistory || '');
          setAllergies(data.allergies || '');
          setDietaryRestrictions(data.dietaryRestrictions || '');
          setOtherImportantInformation(data.otherImportantInformation || '');
          setHealthInsuranceProvider(data.healthInsurance?.provider || '');
          setHealthInsurancePolicyNumber(data.healthInsurance?.policyNumber || '');
          setMedication(data.medication || []);
          setEmergencyContacts(data.emergencyContacts || []);
          // Set state for existing file URLs, including category if available
          setExistingInsuranceCardUrl(data.insuranceCardPhotoUrl || null);
          setExistingOtherMedicalFiles(data.otherMedicalFiles || []);


        } else {
          setError("Camper not found.");
        }
      } catch (e) {
        console.error("Error fetching camper: ", e);
        setError('Error fetching camper: ' + e.message);
      } finally {
        setLoading(false);
      }
    };

    if (camperId) {
      fetchCamper();
    }
  }, [camperId]); // Re-run effect when camperId changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0); // Reset upload progress

    if (!camperName || !dateOfBirth) {
      setError('Please fill in camper name and date of birth.');
      setLoading(false);
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setError('You must be logged in to edit a camper.');
      setLoading(false);
      return;
    }


    try {
      // --- File Upload/Update Logic ---
      let newInsuranceCardUrl = existingInsuranceCardUrl; // Start with existing URL
      // Start with existing files, these already have categories if previously added
      const updatedOtherMedicalFilesData = [...existingOtherMedicalFiles];

      // Upload new insurance card photo if selected
      if (insuranceCardFile) {
        // Optional: Delete existing photo from Storage if a new one is uploaded
        if (existingInsuranceCardUrl) {
          try {
            const oldStorageRef = ref(storage, existingInsuranceCardUrl); // Get reference from URL
            await deleteObject(oldStorageRef);
            console.log("Old insurance card deleted from Storage.");
          } catch (deleteError) {
            console.error("Error deleting old insurance card:", deleteError);
            // Continue with upload even if old file deletion fails
            setError('Error deleting old insurance card: ' + deleteError.message);
          }
        }

        const storageRef = ref(storage, `camperMedicalFiles/${user.uid}/${uuidv4()}_${insuranceCardFile.name}`);
        const uploadTask = uploadBytes(storageRef, insuranceCardFile);
        await uploadTask;
        newInsuranceCardUrl = await getDownloadURL(storageRef);
      } else if (existingInsuranceCardUrl === null && insuranceCardFile === null) {
        // If no new file and existing URL was explicitly cleared
        newInsuranceCardUrl = null;
      }


      // Upload new other medical files with categories
      if (newFilesToUpload.length > 0) {
        const uploadPromises = newFilesToUpload.map(async (fileItem) => {
          const file = fileItem.file;
          const category = fileItem.category;

          const storageRef = ref(storage, `campers/${camperId}/medical-files/${uuidv4()}_${file.name}`); // Updated path
          const uploadTask = uploadBytes(storageRef, file);
          await uploadTask;
          const downloadURL = await getDownloadURL(storageRef);
          return { name: file.name, url: downloadURL, category: category, path: storageRef.fullPath }; // Include category and path
        });
        const uploadedFiles = await Promise.all(uploadPromises);
        updatedOtherMedicalFilesData.push(...uploadedFiles);
      }

      // --- End File Upload/Update Logic ---


      const docRef = doc(db, 'campers', camperId);
      await updateDoc(docRef, {
        name: camperName,
        dateOfBirth: dateOfBirth, // Consider storing as a Firestore Timestamp
        medicalHistory: medicalHistory,
        allergies: allergies,
        dietaryRestrictions: dietaryRestrictions,
        otherImportantInformation: otherImportantInformation,
        healthInsurance: {
          provider: healthInsuranceProvider,
          policyNumber: healthInsurancePolicyNumber,
        },
        medication: medication,
        emergencyContacts: emergencyContacts,
        // Save updated file URLs and data
        insuranceCardPhotoUrl: newInsuranceCardUrl,
        otherMedicalFiles: updatedOtherMedicalFilesData, // This now includes existing (not removed) and new files with categories
      });
      setSuccess('Camper updated successfully!');
      // Clear new files to upload state after successful submission
      setNewFilesToUpload([]);
      // Optionally call onCancel or navigate away after successful update
    } catch (e) {
      console.error("Error updating document or uploading files: ", e);
      setError('Error updating camper or uploading files: ' + e.message);
    } finally {
      setLoading(false);
      setUploadProgress(0); // Reset upload progress
    }
  };

  // Handlers for dynamic fields (already implemented)
  const handleAddMedication = () => {
    setMedication([...medication, { type: '', dosage: '', time: '' }]);
  };

  const handleMedicationChange = (index, field, value) => {
    const newMedication = [...medication];
    newMedication[index][field] = value;
    setMedication(newMedication);
  };

  const handleRemoveMedication = (index) => {
    const newMedication = [...medication];
    newMedication.splice(index, 1);
    setMedication(newMedication);
  };

  const handleAddEmergencyContact = () => {
    if (emergencyContacts.length < 4) {
      setEmergencyContacts([...emergencyContacts, { name: '', relationship: '', phone: '' }]);
    } else {
      alert('You can add a maximum of 4 emergency contacts.');
    }
  };

  const handleEmergencyContactChange = (index, field, value) => {
    const newEmergencyContacts = [...emergencyContacts];
    newEmergencyContacts[index][field] = value;
    setEmergencyContacts(newEmergencyContacts);
  };

  const handleRemoveEmergencyContact = (index) => {
    const newEmergencyContacts = [...emergencyContacts];
    newEmergencyContacts.splice(index, 1);
    setEmergencyContacts(newEmergencyContacts);
  };

  // Handlers for file selection
  const handleInsuranceCardFileChange = (e) => {
    if (e.target.files[0]) {
      setInsuranceCardFile(e.target.files[0]);
    } else {
      setInsuranceCardFile(null);
    }
  };

  const handleOtherMedicalFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const filesWithCategories = files.map(file => ({ file, category: '' }));
    setNewFilesToUpload(filesWithCategories);
  };

  // Handlers for removing existing files (UI implemented, actual deletion from Storage and Firestore needs implementation)
  const handleRemoveExistingOtherMedicalFile = async (fileToRemove) => {
    if (window.confirm(`Are you sure you want to remove the file "${fileToRemove.name}"?`)) {
      try {
        // Delete from Storage
        const fileRef = ref(storage, fileToRemove.path); // Use the 'path' field for deletion
        await deleteObject(fileRef);
        console.log("File successfully deleted from Storage.");

        // Remove from Firestore
        const camperDocRef = doc(db, 'campers', camperId);
        const camperDocSnap = await getDoc(camperDocRef);

        if (camperDocSnap.exists()) {
          const camperData = camperDocSnap.data();
          const updatedFiles = camperData.otherMedicalFiles.filter(file => file.url !== fileToRemove.url); // Filter by URL or a unique ID if available
          await updateDoc(camperDocRef, {
            otherMedicalFiles: updatedFiles
          });
          console.log("File metadata successfully removed from Firestore.");
          setExistingOtherMedicalFiles(updatedFiles); // Update state after successful deletion from Firestore
        }


      } catch (e) {
        console.error("Error deleting file:", e);
        setError('Error deleting file: ' + e.message);
        // Do not remove from state if deletion fails
      }
    }
  };


  // Optional: Function to handle deleting the existing insurance card photo
  const handleDeleteExistingInsuranceCard = async () => {
    if (window.confirm('Are you sure you want to remove the insurance card photo?')) {
      if (existingInsuranceCardUrl) {
        try {
          const fileRef = ref(storage, existingInsuranceCardUrl);
          await deleteObject(fileRef);
          console.log("Insurance card photo successfully deleted from Storage.");
          // Update Firestore to remove the URL (requires getting the camper document and updating)
          const camperDocRef = doc(db, 'campers', camperId);
          await updateDoc(camperDocRef, {
            insuranceCardPhotoUrl: null
          });
          setExistingInsuranceCardUrl(null); // Clear the URL in state after successful Firestore update
        } catch (e) {
          console.error("Error deleting insurance card photo:", e);
          setError('Error deleting insurance card photo: ' + e.message);
        }
      } else {
        setExistingInsuranceCardUrl(null); // If URL is already null, just clear the state
      }
    }
  };



  if (loading && uploadProgress === 0) { // Initial loading state
    return <p>Loading camper data...</p>;
  }

  if (error && !camperName) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }


  return (
    <div>
      <h2>Edit Camper</h2>
      <form onSubmit={handleSubmit}>
        {/* Basic Camper Info */}
        <div>
          <label htmlFor="editCamperName">Camper Name:</label>
          <input
            type="text"
            id="editCamperName"
            value={camperName}
            onChange={(e) => setCamperName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="editDateOfBirth">Date of Birth:</label>
          <input
            type="date"
            id="editDateOfBirth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </div>

        {/* Medical Information Section */}
        <h3>Medical Information</h3>
        <div>
          <label htmlFor="editMedicalHistory">Medical History:</label>
          <textarea
            id="editMedicalHistory"
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label htmlFor="editAllergies">Allergies:</label>
          <input
            type="text"
            id="editAllergies"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="editDietaryRestrictions">Dietary Restrictions:</label>
          <input
            type="text"
            id="editDietaryRestrictions"
            value={dietaryRestrictions}
            onChange={(e) => setDietaryRestrictions(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="editOtherImportantInformation">Other Important Information:</label>
          <textarea
            id="editOtherImportantInformation"
            value={otherImportantInformation}
            onChange={(e) => setOtherImportantInformation(e.target.value)}
          ></textarea>
        </div>

        {/* Medication Section */}
        <h3>Medication</h3>
        {medication.map((med, index) => (
          <div key={index}>
            <h4>Medication #{index + 1}</h4>
            <div>
              <label htmlFor={`editMedicationType${index}`}>Type:</label>
              <input
                type="text"
                id={`editMedicationType${index}`}
                value={med.type}
                onChange={(e) => handleMedicationChange(index, 'type', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`editMedicationDosage${index}`}>Dosage:</label>
              <input
                type="text"
                id={`editMedicationDosage${index}`}
                value={med.dosage}
                onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`editMedicationTime${index}`}>Time Taken:</label>
              <input
                type="text"
                id={`editMedicationTime${index}`}
                value={med.time}
                onChange={(e) => handleMedicationChange(index, 'time', e.target.value)}
              />
            </div>
            <button type="button" onClick={() => handleRemoveMedication(index)}>Remove Medication</button>
          </div>
        ))}
        <button type="button" onClick={handleAddMedication}>Add Medication</button>

        {/* Emergency Contacts Section */}
        <h3>Emergency Contacts</h3>
        {emergencyContacts.map((contact, index) => (
          <div key={index}>
            <h4>Emergency Contact #{index + 1}</h4>
            <div>
              <label htmlFor={`editContactName${index}`}>Name:</label>
              <input
                type="text"
                id={`editContactName${index}`}
                value={contact.name}
                onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`editContactRelationship${index}`}>Relationship:</label>
              <input
                type="text"
                id={`editContactRelationship${index}`}
                value={contact.relationship}
                onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`editContactPhone${index}`}>Phone:</label>
              <input
                type="text"
                id={`editContactPhone${index}`}
                value={contact.phone}
                onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
              />
            </div>
            <button type="button" onClick={() => handleRemoveEmergencyContact(index)}>Remove Contact</button>
          </div>
        ))}
        {emergencyContacts.length < 4 && (
          <button type="button" onClick={handleAddEmergencyContact}>Add Emergency Contact</button>
        )}

        {/* Health Insurance Section */}
        <h3>Health Insurance</h3>
        <div>
          <label htmlFor="editInsuranceProvider">Provider:</label>
          <input
            type="text"
            id="editInsuranceProvider"
            value={healthInsuranceProvider}
            onChange={(e) => setHealthInsuranceProvider(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="editInsurancePolicyNumber">Policy Number:</label>
          <input
            type="text"
            id="editInsurancePolicyNumber"
            value={healthInsurancePolicyNumber}
            onChange={(e) => setHealthInsurancePolicyNumber(e.target.value)}
          />
        </div>

        {/* File Uploads Section */}
        <h3>File Uploads</h3>
        <div>
          <label htmlFor="editInsuranceCardPhoto">Insurance Card Photo:</label>
          <input
            type="file"
            id="editInsuranceCardPhoto"
            accept="image/*"
            onChange={handleInsuranceCardFileChange}
          />
          {existingInsuranceCardUrl && (
            <p>Existing Photo: <a href={existingInsuranceCardUrl} target="_blank" rel="noopener noreferrer">View</a> <button type="button" onClick={handleDeleteExistingInsuranceCard}>Remove Photo</button></p>
          )}
        </div>
        <div>
          <label htmlFor="editOtherMedicalFiles">Other Medical Files:</label>
          <input
            type="file"
            id="editOtherMedicalFiles"
            multiple
            onChange={handleOtherMedicalFilesChange}
          />
          {existingOtherMedicalFiles.length > 0 && (
            <div>
              <h4>Existing Files:</h4>
              <ul>
                {existingOtherMedicalFiles.map((file, index) => (
                  <li key={index}>
                    <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a> ({file.category || 'Uncategorized'})
                    <button type="button" onClick={() => handleRemoveExistingOtherMedicalFile(file)}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Display selected new files with category input */}
          {newFilesToUpload.length > 0 && (
            <div>
              <h4>New Files to Upload:</h4>
              <ul>
                {newFilesToUpload.map((fileItem, index) => (
                  <li key={index}>
                    {fileItem.file.name}
                    <select
                      value={fileItem.category}
                      onChange={(e) => {
                        const updatedFiles = [...newFilesToUpload];
                        updatedFiles[index].category = e.target.value;
                        setNewFilesToUpload(updatedFiles);
                      }}
                    >
                      <option value="">Select Category</option>
                      <option value="Insurance Card">Insurance Card</option>
                      <option value="Immunization Record">Immunization Record</option>
                      <option value="Medication Orders">Medication Orders</option>
                      <option value="Doctor's Note">Doctor's Note</option>
                      <option value="Other">Other</option>
                    </select>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>


        <button type="submit" disabled={loading}>
          {loading ? `Uploading... ${uploadProgress.toFixed(0)}%` : 'Save Changes'}
        </button>
        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}

export default EditCamperForm;
