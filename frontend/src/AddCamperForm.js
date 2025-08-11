import React, { useState } from 'react';
import { db, storage } from './firebase-config'; // Import Firestore and Storage instances
import { collection, addDoc, Timestamp } from 'firebase/firestore'; // Import necessary Firestore functions and Timestamp
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import necessary Storage functions
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique file names
import { auth } from './firebase-config'; // Import auth to get current user UID

// AddCamperForm component definition
function AddCamperForm() {
  const [camperName, setCamperName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // You might want a more specific date input/handling
  // New state variables for medical information
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [otherImportantInformation, setOtherImportantInformation] = useState('');
  const [healthInsuranceProvider, setHealthInsuranceProvider] = useState('');
  const [healthInsurancePolicyNumber, setHealthInsurancePolicyNumber] = useState('');
  // State for file uploads
  const [insuranceCardFile, setInsuranceCardFile] = useState(null);
  // Modified state for other medical files to include category
  const [filesToUpload, setFilesToUpload] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Check required fields
    if (!camperName.trim() || !dateOfBirth.trim()) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setError('You must be logged in to add a camper.');
      setLoading(false);
      return;
    }

    try {
      // --- File Upload Logic ---
      let insuranceCardPhotoUrl = null;
      const otherMedicalFilesData = [];

      if (insuranceCardFile) {
        const storageRef = ref(storage, `/camperMedicalFiles/${user.uid}/${uuidv4()}_${insuranceCardFile.name}`);
        const uploadTask = uploadBytes(storageRef, insuranceCardFile);
        await uploadTask; // Wait for the upload to complete
        insuranceCardPhotoUrl = await getDownloadURL(storageRef); // Get download URL
      }

      // Upload other medical files with categories
      if (filesToUpload.length > 0) {
        const uploadPromises = filesToUpload.map(async (fileItem) => {
          const file = fileItem.file;
          const category = fileItem.category;

          const storageRef = ref(storage, `campers/${user.uid}/medical-files/${uuidv4()}_${file.name}`); // Updated path
          const uploadTask = uploadBytes(storageRef, file);
          await uploadTask;
          const downloadURL = await getDownloadURL(storageRef);
          return { name: file.name, url: downloadURL, category: category }; // Include category
        });
        const uploadedFiles = await Promise.all(uploadPromises);
        otherMedicalFilesData.push(...uploadedFiles);
      }
      // Add a new document with a generated ID to the 'campers' collection
      const docRef = await addDoc(collection(db, 'campers'), {
        parentId: user.uid, // Associate the camper with the current user
        name: camperName.trim(), // Trim whitespace
        // Include medical information fields
        medicalHistory: medicalHistory,
        allergies: allergies,
        dietaryRestrictions: dietaryRestrictions,
        otherImportantInformation: otherImportantInformation,
        healthInsurance: {
          provider: healthInsuranceProvider,
          policyNumber: healthInsurancePolicyNumber,
        },
        medication: [], // Initialize as empty arrays for now
        emergencyContacts: [],
        dateOfBirth: dateOfBirth, // Consider storing as a Firestore Timestamp
        insuranceCardPhotoUrl: insuranceCardPhotoUrl, // Save the uploaded URL
        otherMedicalFiles: otherMedicalFilesData, // Save the array of uploaded file info with categories
      });
      setSuccess('Camper added successfully with ID: ' + docRef.id);
      // Clear form fields
      setCamperName('');
      setDateOfBirth('');
      setMedicalHistory('');
      setAllergies('');
      setDietaryRestrictions('');
      setOtherImportantInformation('');
      setHealthInsuranceProvider('');
      setHealthInsurancePolicyNumber('');
      setInsuranceCardFile(null); // Clear file input
      setFilesToUpload([]); // Clear the files with categories state

    } catch (e) {
      console.error("Error adding document: ", e);
      setError('Error adding camper: ' + e.message);
      // You might want to handle cleanup (deleting uploaded files) in case Firestore save fails
    } finally {
      setLoading(false);
    }
  };

  const handleOtherMedicalFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const filesWithCategories = files.map(file => ({ file, category: '' }));
    setFilesToUpload(filesWithCategories);
  };

  return (
    <div>
      <h2>Add New Camper</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="camperName">Camper Name:</label>
          <input
            type="text"
            id="camperName"
            value={camperName}
            onChange={(e) => setCamperName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="dateOfBirth">Date of Birth:</label>
          <input
            type="date" // Using type="date" for basic date input
            id="dateOfBirth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </div>

        {/* Medical Information Section */}
        <h3>Medical Information</h3>
        <div>
          <label htmlFor="medicalHistory">Medical History:</label>
          <textarea
            id="medicalHistory"
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label htmlFor="allergies">Allergies:</label>
          <input
            type="text"
            id="allergies"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="dietaryRestrictions">Dietary Restrictions:</label>
          <input
            type="text"
            id="dietaryRestrictions"
            value={dietaryRestrictions}
            onChange={(e) => setDietaryRestrictions(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="otherImportantInformation">Other Important Information:</label>
          <textarea
            id="otherImportantInformation"
            value={otherImportantInformation}
            onChange={(e) => setOtherImportantInformation(e.target.value)}
          ></textarea>
        </div>

        {/* Health Insurance Section */}
        <h3>Health Insurance</h3>
        <div>
          <label htmlFor="insuranceProvider">Provider:</label>
          <input
            type="text"
            id="insuranceProvider"
            value={healthInsuranceProvider}
            onChange={(e) => setHealthInsuranceProvider(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="insurancePolicyNumber">Policy Number:</label>
          <input
            type="text"
            id="insurancePolicyNumber"
            value={healthInsurancePolicyNumber}
            onChange={(e) => setHealthInsurancePolicyNumber(e.target.value)}
          />
        </div>

        {/* File Uploads Section */}
        <h3>File Uploads</h3>
        <div>
          <label htmlFor="insuranceCardPhoto">Insurance Card Photo:</label>
          <input
            type="file"
            id="insuranceCardPhoto"
            accept="image/*" // Accept image files
            onChange={(e) => setInsuranceCardFile(e.target.files[0])}
          />
        </div>
        <div>
          <label htmlFor="otherMedicalFiles">Other Medical Files:</label>
          <input
            type="file"
            id="otherMedicalFiles"
            multiple // Allow multiple file selection
            onChange={handleOtherMedicalFilesChange}
          />
        </div>

        {/* Display selected new files with category input */}
        {filesToUpload.length > 0 && (
          <div>
            <h4>Selected Files to Upload:</h4>
            <ul>
              {filesToUpload.map((fileItem, index) => (
                <li key={index}>
                  {fileItem.file.name}
                  <select
                    value={fileItem.category}
                    onChange={(e) => {
                      const updatedFiles = [...filesToUpload];
                      updatedFiles[index].category = e.target.value;
                      setFilesToUpload(updatedFiles);
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


        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Camper'}
        </button>
        {/* Medication and Emergency Contacts sections will be added here later */}


      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}\n    </div>
  );
}

export default AddCamperForm;
