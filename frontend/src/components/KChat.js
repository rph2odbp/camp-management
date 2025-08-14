// frontend/src/KChat.js
import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const kchat = httpsCallable(getFunctions(), 'kchat');

function KChat() {
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        setError('');
        
        const userMessage = { role: 'user', parts: [{ text: message }] };
        const newHistory = [...history, userMessage];
        
        try {
            const result = await kchat({ message, history: newHistory });
            // Corrected JavaScript syntax below
            const modelResponse = result.data.response;
            
            const modelMessage = { role: 'model', parts: [{ text: modelResponse }] };
            setHistory([...newHistory, modelMessage]);

        } catch (err) {
            setError('Failed to get response from KChat.');
            console.error(err);
        } finally {
            setMessage('');
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>KChat Assistant</h2>
            <div style={{ border: '1px solid #ccc', height: '400px', overflowY: 'scroll', padding: '10px' }}>
                {history.map((item, index) => (
                    <div key={index} style={{ marginBottom: '10px', textAlign: item.role === 'user' ? 'right' : 'left' }}>
                        <b>{item.role === 'user' ? 'You' : 'KChat'}:</b>
                        <p style={{ margin: 0 }}>{item.parts[0].text}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask a question about your camp..."
                    style={{ width: '80%' }}
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Thinking...' : 'Send'}
                </button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
}

export default KChat;
