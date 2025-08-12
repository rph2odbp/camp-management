// frontend/src/MedicalStaffPortal.js
import React from 'react';
import MedicalPanel from './MedicalPanel'; // The main dashboard for medical staff

function MedicalStaffPortal() {
  // This component acts as the main layout for the medical staff view.
  // It can be expanded later to include other medical-specific features like
  // inventory management, incident reporting, etc.
  
  return (
    <div>
      <h2>Medical Staff Portal</h2>
      <p>Welcome to the medical dashboard. Here you can view camper medical information, manage documents, and record medical incidents.</p>
      <hr />
      <MedicalPanel />
    </div>
  );
}

export default MedicalStaffPortal;
