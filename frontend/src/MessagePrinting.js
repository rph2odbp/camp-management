import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, query, where, onSnapshot, doc, getDoc, writeBatch } from 'firebase/firestore';
import './MessagePrinting.css';

function MessagePrinting() {
    const [messages, setMessages] = useState([]);
    const [selectedMessages, setSelectedMessages] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [campersData, setCampersData] = useState({});

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'messages'), where('isPrinted', '==', false));
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const camperIds = [...new Set(messagesData.map(msg => msg.camperId))];
            const newCampersData = { ...campersData };
            
            for (const camperId of camperIds) {
                if (!newCampersData[camperId]) {
                    const camperRef = doc(db, 'campers', camperId);
                    const camperSnap = await getDoc(camperRef);
                    if (camperSnap.exists()) {
                        newCampersData[camperId] = camperSnap.data();
                    }
                }
            }
            
            setCampersData(newCampersData);
            setMessages(messagesData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching messages:", err);
            setError('Failed to fetch unprinted messages.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSelectMessage = (messageId) => {
        const newSelection = new Set(selectedMessages);
        if (newSelection.has(messageId)) {
            newSelection.delete(messageId);
        } else {
            newSelection.add(messageId);
        }
        setSelectedMessages(newSelection);
    };
    
    const handlePrintSelected = () => {
        const contentToPrint = messages
            .filter(msg => selectedMessages.has(msg.id))
            .map(msg => {
                const camperName = campersData[msg.camperId]?.name || 'N/A';
                const cabinName = campersData[msg.camperId]?.cabinName || 'N/A'; // Assuming cabinName is stored on camper
                return `<div class="message-print-item">
                          <h3>To: ${camperName} (Cabin: ${cabinName})</h3>
                          <p>${msg.content}</p>
                          <small>Sent: ${msg.sentAt?.toDate().toLocaleString()}</small>
                        </div>`;
            })
            .join('<hr>');

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head><title>Print Messages</title>
                <style>
                    body { font-family: sans-serif; }
                    .message-print-item { page-break-inside: avoid; border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; }
                </style>
                </head>
                <body>${contentToPrint}</body>
            </html>`);
        printWindow.document.close();
        printWindow.print();
    };

    const handleMarkAsPrinted = async () => {
        if (selectedMessages.size === 0) return;
        
        const batch = writeBatch(db);
        selectedMessages.forEach(messageId => {
            const messageRef = doc(db, 'messages', messageId);
            batch.update(messageRef, { isPrinted: true });
        });

        try {
            await batch.commit();
            setSelectedMessages(new Set()); // Clear selection
        } catch (err) {
            console.error("Error marking messages as printed:", err);
            setError('Failed to update messages.');
        }
    };

    if (loading) return <p>Loading messages to print...</p>;
    
    return (
        <div className="message-printing-container">
            <h3>Unprinted Messages</h3>
            {error && <p className="error-message">{error}</p>}
            <div className="message-actions">
                <button onClick={handlePrintSelected} disabled={selectedMessages.size === 0}>Print Selected</button>
                <button onClick={handleMarkAsPrinted} disabled={selectedMessages.size === 0}>Mark Selected as Printed</button>
            </div>
            <div className="message-list-to-print">
                {messages.map(message => {
                    const camperName = campersData[message.camperId]?.name || 'Unknown Camper';
                    return (
                        <div key={message.id} className={`message-item ${selectedMessages.has(message.id) ? 'selected' : ''}`} onClick={() => handleSelectMessage(message.id)}>
                            <input type="checkbox" readOnly checked={selectedMessages.has(message.id)} />
                            <div className="message-details">
                                <p><strong>To: {camperName}</strong></p>
                                <p>{message.content.substring(0, 100)}...</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

export default MessagePrinting;
