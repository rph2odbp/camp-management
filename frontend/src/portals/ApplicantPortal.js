// frontend/src/ApplicantPortal.js
import React from 'react';
import EmployeeApplicationForm from '../components/EmployeeApplicationForm';

function ApplicantPortal() {
  return (
    <div>
      <h2>Welcome, Applicant!</h2>
      <p>Thank you for your interest in joining the Camp Abbey team.</p>
      <p>Please complete the application form below. You can save your progress and return to it at any time.</p>
      <hr />
      <EmployeeApplicationForm />
    </div>
  );
}

export default ApplicantPortal;
