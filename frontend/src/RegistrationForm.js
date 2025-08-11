import React, { useState, useEffect } from 'react';
import { db, storage, auth } from './firebase-config';
import { collection, query, onSnapshot, addDoc, doc, getDoc, updateDoc, where, getDocs, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { processDepositPayment } from './services/PaymentService';

function DynamicFormField({ question, value, onChange }) {
    const { label, name, type, required, options } = question;

    const handleChange = (e) => {
        const { type, checked, value } = e.target;
        onChange(name, type === 'checkbox' ? checked : value);
    };

    switch (type) {
        case 'select':
            return (
                <label>
                    {label}:
                    <select name={name} value={value || ''} onChange={handleChange} required={required}>
                        <option value="">--Select--</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </label>
            );
        case 'textarea':
            return <label>{label}: <textarea name={name} value={value || ''} onChange={handleChange} required={required} /></label>;
        case 'checkbox':
            return <label><input type="checkbox" name={name} checked={!!value} onChange={handleChange} required={required} /> {label}</label>;
        default:
            return <label>{label}: <input type={type} name={name} value={value || ''} onChange={handleChange} required={required} /></label>;
    }
}

function RegistrationForm() {
    const [questions, setQuestions] = useState([]);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'registrationQuestions'), orderBy('order'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (err) => {
            setError('Failed to load form configuration.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const handleFormChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const camperData = {
                ...formData,
                parentId: auth.currentUser.uid,
                registrationStatus: 'pending', // Default status
                createdAt: new Date()
            };
            const newCamperRef = await addDoc(collection(db, 'campers'), camperData);
            
            // Handle photo upload if a photo field is included and filled
            if (formData.camperPhoto) {
                const photoRef = ref(storage, `camper-photos/${newCamperRef.id}/${formData.camperPhoto.name}`);
                await uploadBytes(photoRef, formData.camperPhoto);
                const photoURL = await getDownloadURL(photoRef);
                await updateDoc(newCamperRef, { photoURL });
            }
            
            alert('Registration submitted successfully!');
            setFormData({}); // Reset form
        } catch (err) {
            console.error(err);
            setError('Failed to submit registration.');
        } finally {
            setSubmitting(false);
        }
    };
    
    if (loading) return <p>Loading registration form...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    const renderSection = (sectionName) => {
        return questions
            .filter(q => q.section === sectionName)
            .map(q => <DynamicFormField key={q.id} question={q} value={formData[q.name]} onChange={handleFormChange} />);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Camper Registration</h2>
            <fieldset>
                <legend>Demographics</legend>
                {renderSection('demographics')}
            </fieldset>
            <fieldset>
                <legend>Medical & Safety</legend>
                {renderSection('medical')}
            </fieldset>
            <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
        </form>
    );
}

export default RegistrationForm;
