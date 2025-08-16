import React from 'react';
import AppRouter from './AppRouter';
import { PaymentProvider } from './context/PaymentContext';
import { AuthProvider, useAuth } from './firebase-auth';
import FirebaseAuth from './firebase-auth';

function App() {
  const user = useAuth();
  return (
    <AuthProvider>
      <PaymentProvider user={user}>
        <AppRouter />
        {/* You can use <FirebaseAuth /> somewhere in your app if needed */}
      </PaymentProvider>
    </AuthProvider>
  );
}

export default App;