import React from 'react';
import CamperRegistrationForm from './CamperRegistrationForm';

function RegistrationFlow({ sessionId, isWaitlisted, onRegistrationComplete }) {
    return (
        <div>
            <h2>Camper Registration</h2>
            <CamperRegistrationForm 
              sessionId={sessionId} 
              isWaitlisted={isWaitlisted}
              onRegistrationComplete={onRegistrationComplete} 
            />
            <button onClick={onRegistrationComplete}>Cancel</button>
        </div>
    );
}

export default RegistrationFlow;
