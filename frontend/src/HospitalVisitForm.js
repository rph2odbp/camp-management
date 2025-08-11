import React from 'react';

function HospitalVisitForm({ camper }) {
    if (!camper) return null;

    // A simple inline style for the printable form. 
    // In a real app, you might use a separate CSS file.
    const styles = {
        page: {
            width: '8.5in',
            height: '11in',
            padding: '0.5in',
            boxSizing: 'border-box',
            fontFamily: 'Arial, sans-serif',
            color: '#333'
        },
        header: {
            textAlign: 'center',
            borderBottom: '2px solid #333',
            paddingBottom: '10px',
            marginBottom: '20px'
        },
        section: {
            marginBottom: '20px',
            border: '1px solid #ccc',
            padding: '10px'
        },
        sectionTitle: {
            borderBottom: '1px solid #ccc',
            paddingBottom: '5px',
            marginBottom: '10px',
            fontSize: '1.2em'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
        },
        img: {
            maxWidth: '150px',
            maxHeight: '150px',
            border: '1px solid #ccc'
        }
    };

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <h1>Hospital Visit Information</h1>
            </header>

            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Camper Information</h2>
                <div style={styles.grid}>
                    <div>
                        <p><strong>Name:</strong> {camper.name}</p>
                        <p><strong>Date of Birth:</strong> {camper.birthdate}</p>
                        <p><strong>Gender:</strong> {camper.gender}</p>
                    </div>
                    <div>
                        {camper.photoURL && <img src={camper.photoURL} alt="Camper" style={styles.img} />}
                    </div>
                </div>
            </section>
            
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Parent/Guardian Contact</h2>
                <p><strong>Name:</strong> {camper.parentName}</p>
                <p><strong>Phone:</strong> {camper.parentPhone}</p>
            </section>

            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Emergency Contacts</h2>
                {/* This assumes emergencyContacts is an array of objects */}
                {(camper.emergencyContacts && camper.emergencyContacts.length > 0) ? camper.emergencyContacts.map((contact, index) => (
                    <div key={index}>
                        <p><strong>Contact {index + 1}:</strong> {contact.name} - {contact.phone}</p>
                    </div>
                )) : <p>No emergency contacts provided.</p>}
            </section>

            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Health Insurance</h2>
                <p><strong>Provider:</strong> {camper.healthInsurance?.provider || 'N/A'}</p>
                <p><strong>Policy Number:</strong> {camper.healthInsurance?.policyNumber || 'N/A'}</p>
                 {camper.insuranceCardPhotoUrl && (
                    <div>
                        <p><strong>Insurance Card Photo:</strong></p>
                        <img src={camper.insuranceCardPhotoUrl} alt="Insurance Card" style={{maxWidth: '300px', border: '1px solid #ccc'}}/>
                    </div>
                )}
            </section>

            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Medical Summary</h2>
                <p><strong>Medical Conditions:</strong> {camper.medicalConditions || 'None provided'}</p>
                <p><strong>Allergies:</strong> {camper.allergies || 'None provided'}</p>
                <p><strong>Medications:</strong> {camper.medications || 'None provided'}</p>
                 {/* This assumes medication is an array of objects */}
                 {(camper.medication && camper.medication.length > 0) ? (
                    <ul>
                        {camper.medication.map((med, index) => (
                            <li key={index}>{med.name} - {med.dosage} - {med.instructions}</li>
                        ))}
                    </ul>
                ) : <p>No specific medication list provided.</p>}
            </section>
        </div>
    );
}

export default HospitalVisitForm;
