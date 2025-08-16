import { useState, useEffect, createContext, useContext } from 'react';

// Dummy authentication context for demonstration
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Replace with your real Firebase logic
  useEffect(() => {
    // Simulated async login check
    const timer = setTimeout(() => {
      // Simulate a logged-in user
      setUser({ uid: '12345', email: 'user@example.com' });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

// Optional: a sign-in component (replace with real Firebase Auth UI)
export default function FirebaseAuth() {
  const user = useAuth();

  if (user) {
    return <div>Welcome, {user.email}!</div>;
  }
  return <div>Please sign in.</div>;
}
