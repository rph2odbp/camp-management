import React, { useState } from 'react';
import { db, auth } from './firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

function EmployeeApplicationForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        birthdate: '',
        gender: '',
        coverLetter: '',
        password: '' // For creating a user account
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // 1. Create a user account for the applicant
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // 2. Create the application document in Firestore
            await addDoc(collection(db, 'applications'), {
                userId: user.uid,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                birthdate: formData.birthdate,
                gender: formData.gender,
                coverLetter: formData.coverLetter,
                status: 'submitted', // Initial status
                submittedAt: serverTimestamp()
            });

            setSuccess('Application submitted successfully! You can now log in to check your status.');
            setFormData({ name: '', email: '', phone: '', address: '', birthdate: '', gender: '', coverLetter: '', password: '' });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Work at Our Camp</h2>
            <form onSubmit={handleSubmit}>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required />
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Create a Password" required />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" />
                <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
                <input name="birthdate" type="date" value={formData.birthdate} onChange={handleChange} />
                <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                <textarea name="coverLetter" value={formData.coverLetter} onChange={handleChange} placeholder="Tell us about yourself..." />
                <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </form>
        </div>
    );
}

export default EmployeeApplicationForm;
