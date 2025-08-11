import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';

function RegistrationQuestionManagement() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form state for adding/editing questions
    const [isEditing, setIsEditing] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState({
        label: '',
        name: '',
        type: 'text',
        section: 'demographics',
        required: false,
        order: 0,
        options: '' // Comma-separated for 'select' type
    });

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'registrationQuestions'), orderBy('order'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const questionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setQuestions(questionsData);
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch questions.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentQuestion({
            ...currentQuestion,
            [name]: type === 'checkbox' ? checked : value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSave = {
            ...currentQuestion,
            order: Number(currentQuestion.order),
            options: currentQuestion.type === 'select' ? currentQuestion.options.split(',').map(s => s.trim()) : []
        };

        if (isEditing) {
            const questionRef = doc(db, 'registrationQuestions', currentQuestion.id);
            await updateDoc(questionRef, dataToSave);
        } else {
            await addDoc(collection(db, 'registrationQuestions'), dataToSave);
        }
        resetForm();
    };
    
    const handleEdit = (question) => {
        setIsEditing(true);
        setCurrentQuestion({
            ...question,
            options: Array.isArray(question.options) ? question.options.join(', ') : ''
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            const questionRef = doc(db, 'registrationQuestions', id);
            await deleteDoc(questionRef);
        }
    };
    
    const resetForm = () => {
        setIsEditing(false);
        setCurrentQuestion({
            label: '',
            name: '',
            type: 'text',
            section: 'demographics',
            required: false,
            order: 0,
            options: ''
        });
    };

    if (loading) return <p>Loading questions...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h3>Registration Question Management</h3>
            
            {/* Form for adding/editing questions */}
            <form onSubmit={handleSubmit}>
                <h4>{isEditing ? 'Edit Question' : 'Add New Question'}</h4>
                <input name="label" value={currentQuestion.label} onChange={handleInputChange} placeholder="Label (e.g., Camper Name)" required />
                <input name="name" value={currentQuestion.name} onChange={handleInputChange} placeholder="Name (e.g., camperName)" required />
                <select name="type" value={currentQuestion.type} onChange={handleInputChange}>
                    <option value="text">Text</option>
                    <option value="date">Date</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select</option>
                </select>
                {currentQuestion.type === 'select' && (
                    <input name="options" value={currentQuestion.options} onChange={handleInputChange} placeholder="Options (comma-separated)" />
                )}
                <select name="section" value={currentQuestion.section} onChange={handleInputChange}>
                    <option value="demographics">Demographics</option>
                    <option value="medical">Medical & Safety</option>
                </select>
                <input name="order" type="number" value={currentQuestion.order} onChange={handleInputChange} placeholder="Order" />
                <label><input name="required" type="checkbox" checked={currentQuestion.required} onChange={handleInputChange} /> Required</label>
                <button type="submit">{isEditing ? 'Update Question' : 'Add Question'}</button>
                {isEditing && <button type="button" onClick={resetForm}>Cancel Edit</button>}
            </form>

            {/* List of existing questions */}
            <ul>
                {questions.map(q => (
                    <li key={q.id}>
                        <span>{q.order}. {q.label} ({q.type})</span>
                        <button onClick={() => handleEdit(q)}>Edit</button>
                        <button onClick={() => handleDelete(q.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default RegistrationQuestionManagement;
