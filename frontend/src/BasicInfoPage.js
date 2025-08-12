// frontend/src/BasicInfoPage.js
import React from 'react';

function BasicInfoPage({ nextStep, handleChange, values }) {
    return (
        <div>
            <h3>Basic Information</h3>
            <label>First Name: <input type="text" value={values.firstName} onChange={handleChange('firstName')} required /></label>
            <label>Last Name: <input type="text" value={values.lastName} onChange={handleChange('lastName')} required /></label>
            <label>Birthdate: <input type="date" value={values.birthdate} onChange={handleChange('birthdate')} required /></label>
            <label>Age: <input type="number" value={values.age} onChange={handleChange('age')} required /></label>
            <label>Gender:
                <select value={values.gender} onChange={handleChange('gender')} required>
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </label>
            <label>Address: <input type="text" value={values.address} onChange={handleChange('address')} required /></label>
            <label>Preferred Contact Phone: <input type="tel" value={values.contactPhone} onChange={handleChange('contactPhone')} required /></label>
            <label>Grade: <input type="text" value={values.grade} onChange={handleChange('grade')} /></label>
            <label>School: <input type="text" value={values.school} onChange={handleChange('school')} /></label>
            <label>Camper Photo: <input type="file" /></label>
            <label>Years at Camp: <input type="number" value={values.yearsAtCamp} onChange={handleChange('yearsAtCamp')} /></label>
            <label>T-Shirt Size:
                <select value={values.tShirtSize} onChange={handleChange('tShirtSize')} required>
                    <option value="">Select...</option>
                    <option value="YS">Youth Small (YS)</option>
                    <option value="YM">Youth Medium (YM)</option>
                    <option value="YL">Youth Large (YL)</option>
                    <option value="AS">Adult Small (AS)</option>
                    <option value="AM">Adult Medium (AM)</option>
                    <option value="AL">Adult Large (AL)</option>
                    <option value="AXL">Adult XL (AXL)</option>
                    <option value="AXXL">Adult XXL (AXXL)</option>
                </select>
            </label>
            
            <h4>Parent/Guardian Information</h4>
            <label>Parent 1 Name: <input type="text" value={values.parent1Name} onChange={handleChange('parent1Name')} required /></label>
            <label>Parent 1 Phone: <input type="tel" value={values.parent1Phone} onChange={handleChange('parent1Phone')} required /></label>
            <label>Parent 1 Email: <input type="email" value={values.parent1Email} onChange={handleChange('parent1Email')} required /></label>
            <br/>
            <label>Parent 2 Name: <input type="text" value={values.parent2Name} onChange={handleChange('parent2Name')} /></label>
            <label>Parent 2 Phone: <input type="tel" value={values.parent2Phone} onChange={handleChange('parent2Phone')} /></label>
            <label>Parent 2 Email: <input type="email" value={values.parent2Email} onChange={handleChange('parent2Email')} /></label>
            
            <h4>Roommate Requests</h4>
            <p>Note: Roommate requests are specific to this session registration.</p>
            <label>Requested Roommate: <input type="text" value={values.roommateRequest} onChange={handleChange('roommateRequest')} /></label>

            <button onClick={nextStep}>Next: Medical, Safety, and Legal</button>
        </div>
    );
}

export default BasicInfoPage;
