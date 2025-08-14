// frontend/src/LegalTermsModal.js
import React from 'react';

const modalStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
};

const modalContentStyles = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    width: '80%',
    maxWidth: '600px',
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
};

const termsBoxStyles = {
    flexGrow: 1,
    overflowY: 'auto',
    border: '1px solid #ccc',
    padding: '10px',
    marginBottom: '10px',
};

const legalTerms = `
**Camp Abbey Participation Agreement**

**1. Assumption of Risk:** I understand that participation in camp activities involves inherent risks of injury. I voluntarily assume all such risks on behalf of my child.

**2. Medical Authorization:** In the event of a medical emergency, I authorize the camp staff to seek and obtain medical treatment for my child. I agree to be responsible for all costs associated with such treatment.

**3. Photo Release:** I grant Camp Abbey permission to use photographs or videos of my child for promotional purposes without compensation.

**4. Code of Conduct:** I understand that my child is expected to adhere to the camp's code of conduct. Failure to do so may result in dismissal from the camp without a refund.
`;

function LegalTermsModal({ onAcknowledge }) {
    return (
        <div style={modalStyles}>
            <div style={modalContentStyles}>
                <h3>Camp Abbey - Terms and Conditions</h3>
                <div style={termsBoxStyles}>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{legalTerms}</pre>
                </div>
                <button onClick={onAcknowledge}>I Have Read and Acknowledge These Terms</button>
            </div>
        </div>
    );
}

export default LegalTermsModal;
