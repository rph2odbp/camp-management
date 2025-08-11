import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { db } from './firebase-config';
import { collection, query, where, onSnapshot, doc, getDoc, writeBatch } from 'firebase/firestore';

function PrintableMessage({ message, camperName }) {
    return (
        <div style={{ border: '1px solid black', padding: '10px', margin: '10px', pageBreakInside: 'avoid' }}>
            <p>To: <strong>{camperName}</strong></p>
            <p>{message.content}</p>
            <small>Sent: {message.sentAt?.toDate().toLocaleString()}</small>
        </div>
    );
}

function MessagePrinting() {
    const [unprintedMessages, setUnprintedMessages] = useState([]);
    const [campersData, setCampersData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const componentRef = useRef();

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'messages'), where('isPrinted', '==', false));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Fetch camper data
            const camperIds = new Set(messagesData.map(msg => msg.camperId));
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
            setUnprintedMessages(messagesData);
            setLoading(false);
        }, (err) => {
            setError('Failed to fetch messages.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        onAfterPrint: async () => {
            // Mark messages as printed
            const batch = writeBatch(db);
            unprintedMessages.forEach(msg => {
                const msgRef = doc(db, 'messages', msg.id);
                batch.update(msgRef, { isPrinted: true });
            });
            await batch.commit();
        }
    });
    
    if (loading) return <p>Loading unprinted messages...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Print Messages</h2>
            {unprintedMessages.length > 0 ? (
                <>
                    <button onClick={handlePrint}>Print All Unprinted Messages</button>
                    <div ref={componentRef}>
                        {unprintedMessages.map(msg => (
                            <PrintableMessage 
                                key={msg.id} 
                                message={msg} 
                                camperName={campersData[msg.camperId]?.name || 'Unknown Camper'}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <p>No new messages to print.</p>
            )}
        </div>
    );
}

export default MessagePrinting;
