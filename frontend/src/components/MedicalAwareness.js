import React, { useState } from 'react';

const MedicalAwareness = ({ sessions, campers, cabins }) => {
  const [selectedSessionId, setSelectedSessionId] = useState('');

  const handleSessionChange = (e) => {
    setSelectedSessionId(e.target.value);
  };

  const getCampersByCabin = (cabinId, sessionId) => {
    return campers.filter(camper => 
      camper.cabinId === cabinId && 
      camper.enrolledSessionIds?.includes(sessionId) &&
      (camper.allergies || camper.medicalConditions)
    );
  };

  return (
    <div>
      <h4>Medical Awareness</h4>
      <select onChange={handleSessionChange} value={selectedSessionId}>
        <option value="">Select a Session</option>
        {sessions.map(session => (
          <option key={session.id} value={session.id}>{session.name}</option>
        ))}
      </select>

      {selectedSessionId && (
        <div>
          {cabins.map(cabin => {
            const cabinCampers = getCampersByCabin(cabin.id, selectedSessionId);
            if (cabinCampers.length === 0) return null;

            return (
              <div key={cabin.id}>
                <h5>{cabin.name}</h5>
                <ul>
                  {cabinCampers.map(camper => (
                    <li key={camper.id}>
                      <strong>{camper.name}</strong>
                      {camper.allergies && <p>Allergies: {camper.allergies}</p>}
                      {camper.medicalConditions && <p>Medical Conditions: {camper.medicalConditions}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicalAwareness;
