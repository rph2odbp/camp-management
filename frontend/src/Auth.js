import React, { useState, useEffect } from 'react';
import { auth } from './firebase-config';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';

const registerAsParent = httpsCallable(getFunctions(), 'registerAsParent');
const registerAsStaff = httpsCallable(getFunctions(), 'registerAsStaff');

function Auth() {
  const [parentEmail, setParentEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, password) => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRegister = async (role) => {
    setError('');
    const email = (role === 'parent') ? parentEmail : staffEmail;
    const password = (role === 'parent') ? parentPassword : staffPassword;
    if (!email || !password) {
      setError("Please provide an email and password to register.");
      return;
    }

    try {
      if (role === 'parent') {
        await registerAsParent({ email, password });
      } else {
        await registerAsStaff({ email, password });
      }
      // Automatically log the user in after successful registration
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-section">
      <div className="login-container">
        {/* Parent Login Box */}
        <div className="login-box">
          <h3>Parent Login</h3>
          <input
            type="email"
            placeholder="Email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={parentPassword}
            onChange={(e) => setParentPassword(e.target.value)}
          />
          <button onClick={() => handleLogin(parentEmail, parentPassword)}>Login</button>
          <button onClick={() => handleRegister('parent')}>Register User</button>
          <p className="login-descriptor">Log in or register to manage campers</p>
          <button onClick={handleGoogleSignIn} style={{ backgroundColor: '#4285F4' }}>
            Sign in with Google
          </button>
        </div>

        {/* Staff Login Box */}
        <div className="login-box">
          <h3>Staff Login</h3>
          <input
            type="email"
            placeholder="Email"
            value={staffEmail}
            onChange={(e) => setStaffEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={staffPassword}
            onChange={(e) => setStaffPassword(e.target.value)}
          />
          <button onClick={() => handleLogin(staffEmail, staffPassword)}>Login</button>
          <button onClick={() => handleRegister('staff')}>Register to Apply</button>
          <p className="login-descriptor">Log in or register to apply for a job</p>
        </div>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Auth;
