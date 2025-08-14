import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import HospitalVisitForm from './HospitalVisitForm'; // Assumes this component exists

function StaffMedicalTab({ camper }) {
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `${camper.name}-Hospital-Form`,
    });

    return (
        <div>
            <h4>Medical & Safety Information (Staff View)</h4>
            
            <fieldset>
                <legend>Medical Details</legend>
                <p><strong>Medical Conditions:</strong> {camper.medicalConditions || 'None provided'}</p>
                <p><strong>Medications:</strong> {camper.medications || 'None provided'}</p>
                <p><strong>Allergies:</strong> {camper.allergies || 'None provided'}</p>
                <p><strong>Dietary Restrictions:</strong> {camper.dietaryRestrictions || 'None provided'}</p>
            </fieldset>

            <fieldset>
                <legend>Swimming Safety</legend>
                <p><strong>Can swim in deep end:</strong> {camper.canSwim ? 'Yes' : 'No'}</p>
                <p><strong>Needs arm floats:</strong> {camper.needsArmFloats ? 'Yes' : 'No'}</p>
            </fieldset>
            
            <fieldset>
                <legend>Parental Acknowledgements</legend>
                <p><strong>Sunscreen agreement:</strong> {camper.sunscreenAck ? 'Yes' : 'No'}</p>
                <p><strong>Contagious illness agreement:</strong> {camper.contagiousAck ? 'Yes' : 'No'}</p>
            </fieldset>

            <button onClick={handlePrint} style={{ marginTop: '15px' }}>
                Print Hospital Visit Form
            </button>

            {/* This component is hidden and only used for printing */}
            <div style={{ display: 'none' }}>
                <div ref={componentRef}>
                    <HospitalVisitForm camper={camper} />
                </div>
            </div>
        </div>
    );
}

export default StaffMedicalTab;
