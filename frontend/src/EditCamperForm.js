import React, { useState } from 'react';
import { db } from './firebase-config';
import { doc, updateDoc } from 'firebase/firestore';

function EditCamperForm({ camper, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        name: camper.name || '',
        birthdate: camper.birthdate || '',
        gender: camper.gender || '',
        grade: camper.grade || '',
        school: camper.school || '',
        tShirtSize: camper.tShirtSize || '',
        yearsAtCamp: camper.yearsAtCamp || '',
        parentName: camper.parentName || '',
        parentPhone: camper.parentPhone || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const camperRef = doc(db, 'campers', camper.id);
            await updateDoc(camperRef, formData);
            onSave();
        } catch (err) {
            setError('Failed to update camper details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Edit Personal Information</legend>
                <label>Name: <input type="text" name="name" value={formData.name} onChange={handleChange} /></label>
                <label>Date of Birth: <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} /></label>
                <label>Gender: <input type="text" name="gender" value={formData.gender} onChange={handleChange} /></label>
                <label>Grade: <input type="text" name="grade" value={formData.grade} onChange={handleChange} /></label>
                <label>School: <input type="text" name="school" value={formData.school} onChange={handleChange} /></label>
                <label>T-Shirt Size: <input type="text" name="tShirtSize" value={formData.tShirtSize} onChange={handleChange} /></label>
                <label>Years at Camp: <input type="number" name="yearsAtCamp" value={formData.yearsAtCamp} onChange={handleChange} /></label>
            </fieldset>
            <fieldset>
                <legend>Edit Parent/Guardian Information</legend>
                <label>Name: <input type="text" name="parentName" value={formData.parentName} onChange={handleChange} /></label>
                <label>Phone: <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleChange} /></label>
            </fieldset>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
}

export default EditCamperForm;
