import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import HospitalVisitForm from './HospitalVisitForm';

function MedicalTab({ camper }) {
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return (
        <div>
            <h4>Medical & Safety Information</h4>
            {/* Displaying the data directly in the tab as before */}
            <p><strong>Medical Conditions:</strong> {camper.medicalConditions || 'None provided'}</p>
            <p><strong>Medications:</strong> {camper.medications || 'None provided'}</p>
            <h4>Swimming</h4>
            <p>Can swim in deep end: {camper.canSwim ? 'Yes' : 'No'}</p>
            <p>Needs arm floats: {camper.needsArmFloats ? 'Yes' : 'No'}</p>
            <h4>Acknowledgements</h4>
            <p>Sunscreen agreement: {camper.sunscreenAck ? 'Yes' : 'No'}</p>
            <p>Contagious illness agreement: {camper.contagiousAck ? 'Yes' : 'No'}</p>
            
            {/* The button to trigger the print */}
            <button onClick={handlePrint}>Print Hospital Visit Form</button>

            {/* The component to be printed, hidden from view */}
            <div style={{ display: 'none' }}>
                <div ref={componentRef}>
                    <HospitalVisitForm camper={camper} />
                </div>
            </div>
        </div>
    );
}

export default MedicalTab;
