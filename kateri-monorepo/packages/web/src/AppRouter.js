import React, { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import AdminPortal from './pages/AdminPortal';
import ParentPortal from './pages/ParentPortal';
import StaffPortal from './pages/StaffPortal';
import PaymentPage from './pages/PaymentPage';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { app as firebaseApp } from './firebase'; // You should have a firebase.js exporting your initialized app

// -------- Auth Context using Firebase --------
const AuthContext = createContext();

function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // Role will be fetched from custom claims or user profile
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Example: fetch role from custom claims
      if (firebaseUser) {
        await firebaseUser.getIdToken(true); // force refresh
        const decodedToken = await auth.currentUser.getIdTokenResult();
        // The role should be set as a custom claim in Firebase Auth (admin, parent, staff)
        setRole(decodedToken.claims.role || null);
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // The user's role should be set after registration/approval in backend (see docs)
  };

  const logout = async () => {
    const auth = getAuth(firebaseApp);
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// -------- Protected Route --------
function ProtectedRoute({ roles, children }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles && (!role || !roles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}

// -------- Shared Layout --------
function Layout() {
  const { user, role, logout } = useAuth();
  return (
    <div>
      <header style={{ background: "#eee", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/" style={{ fontWeight: "bold", fontSize: "1.3rem", color: "#333", textDecoration: "none" }}>Camp Management</Link>
        <nav aria-label="Global navigation">
          <ul style={{ display: "flex", gap: "1.5rem", listStyle: "none", margin: 0, padding: 0 }}>
            <li><Link to="/admin">Admin Portal</Link></li>
            <li><Link to="/parent">Parent Portal</Link></li>
            <li><Link to="/staff">Staff Portal</Link></li>
            <li><Link to="/pay">Make a Payment</Link></li>
            {user ? (
              <li>
                <button
                  onClick={logout}
                  style={{ background: "#d32f2f", color: "#fff", border: "none", borderRadius: "4px", padding: "0.5rem 1rem", cursor: "pointer" }}>
                  Logout {role ? `(${role})` : ""}
                </button>
              </li>
            ) : (
              <li>
                <Link to="/login">Login</Link>
              </li>
            )}
          </ul>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer style={{ textAlign: "center", margin: "2rem 0", color: "#888" }}>
        <small>© 2025 Camp Management System</small>
      </footer>
    </div>
  );
}

// -------- Pages --------
function Home() {
  return (
    <section style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
      <h1>Welcome to the Camp Management System</h1>
      <p>Please select your portal or login to continue.</p>
      <nav aria-label="Main navigation" style={{ marginTop: "2rem" }}>
        <ul style={{ display: "flex", justifyContent: "center", gap: "2rem", listStyle: "none", padding: 0 }}>
          <li><Link to="/admin">Admin Portal</Link></li>
          <li><Link to="/parent">Parent Portal</Link></li>
          <li><Link to="/staff">Staff Portal</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/pay">Make a Payment</Link></li>
        </ul>
      </nav>
    </section>
  );
}

function Login() {
  const { login, user, role, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</div>;
  }
  if (user && role) {
    // Redirect to portal based on role
    return <Navigate to={`/${role}`} replace />;
  }
  return (
    <section style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
      <h2>Login</h2>
      <p>Sign in with Google:</p>
      <button
        onClick={login}
        style={{ background: "#4285F4", color: "#fff", border: "none", borderRadius: "4px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "1rem" }}>
        Sign in with Google
      </button>
      <p style={{ marginTop: "2rem" }}>
        After login, you'll be redirected to your portal.<br />
        <Link to={from}>Return to previous page</Link>
      </p>
      <p style={{ color: "#999", fontSize: "0.9rem", marginTop: "2rem" }}>
        * Your role will be assigned by camp administrators. If you don't have access, please contact support.
      </p>
    </section>
  );
}

function Unauthorized() {
  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Unauthorized</h2>
      <p>You do not have permission to access this page.</p>
      <Link to="/">Return Home</Link>
    </main>
  );
}

function NotFound() {
  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for does not exist.</p>
      <Link to="/">Return Home</Link>
    </main>
  );
}

// -------- Router --------
function AppRouter() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/pay" element={<PaymentPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent"
              element={
                <ProtectedRoute roles={['parent']}>
                  <ParentPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute roles={['staff']}>
                  <StaffPortal />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default AppRouter;