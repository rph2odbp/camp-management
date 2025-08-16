import React from 'react';
import AppRouter from './AppRouter';
import { PaymentProvider } from './context/PaymentContext';
import { useAuth } from './firebase-auth'; // Assume you have this

function App() {
  const user = useAuth();
  return (
    <PaymentProvider user={user}>
      <AppRouter />
    </PaymentProvider>
  );
}

export default App;