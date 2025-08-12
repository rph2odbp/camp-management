// frontend/src/SendRoommateRequest.js
import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase-config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

function SendRoommateRequest() {
  const [myCampers, setMyCampers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMyCamper, setSelectedMyCamper] = useState('');
  const [selectedRoommate, setSelectedRoommate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch the current user's campers
  useEffect(() => {
    const fetchMyCampers = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, 'campers'), where('parentId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        setMyCampers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };
    fetchMyCampers();
  }, []);

  // Handle search for potential roommates
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    
    // Simple search by name (can be expanded)
    const q = query(collection(db, 'campers'), where('name', '>=', searchQuery), where('name', '<=', searchQuery + '\uf8ff'));
    const querySnapshot = await getDocs(q);
    
    // Exclude own campers from search results
    const user = auth.currentUser;
    const results = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(camper => camper.parentId !== user.uid);
      
    setSearchResults(results);
    setLoading(false);
  };

  // Handle sending the request
  const handleSendRequest = async () => {
    if (!selectedMyCamper || !selectedRoommate) {
      setError('Please select your camper and a requested roommate.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await addDoc(collection(db, 'roommateRequests'), {
        fromCamperId: selectedMyCamper,
        toCamperId: selectedRoommate.id,
        status: 'pending',
        requestDate: new Date(),
      });
      setSuccess('Roommate request sent successfully!');
      setSelectedRoommate(null);
      setSearchQuery('');
      setSearchResults([]);
    } catch (e) {
      setError('Failed to send request.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h4>Send a Roommate Request</h4>
      <div>
        <label>Your Camper:</label>
        <select value={selectedMyCamper} onChange={(e) => setSelectedMyCamper(e.target.value)}>
          <option value="">Select a Camper</option>
          {myCampers.map(camper => (
            <option key={camper.id} value={camper.id}>{camper.name}</option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSearch}>
        <label>Search for a Roommate by Name:</label>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>Search</button>
      </form>
      
      {searchResults.length > 0 && (
        <ul>
          {searchResults.map(camper => (
            <li key={camper.id}>
              {camper.name}
              <button onClick={() => setSelectedRoommate(camper)}>Select</button>
            </li>
          ))}
        </ul>
      )}
      
      {selectedRoommate && (
        <div>
          <p>Send request to: <strong>{selectedRoommate.name}</strong>?</p>
          <button onClick={handleSendRequest} disabled={loading}>Send Request</button>
          <button onClick={() => setSelectedRoommate(null)}>Cancel</button>
        </div>
      )}
      
      {error && <p style={{color: 'red'}}>{error}</p>}
      {success && <p style={{color: 'green'}}>{success}</p>}
    </div>
  );
}

export default SendRoommateRequest;
