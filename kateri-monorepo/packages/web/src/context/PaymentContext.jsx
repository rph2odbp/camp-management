import React, { createContext, useState, useEffect } from 'react';
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

export const PaymentContext = createContext();

export function PaymentProvider({ children, user }) {
  const [outstanding, setOutstanding] = useState(0);
  const [session, setSession] = useState({});

  useEffect(() => {
    // Fetch outstanding payments for logged-in parent from backend
    async function fetchOutstanding() {
      const getOutstanding = httpsCallable(functions, 'getOutstandingPayments');
      const response = await getOutstanding({ parentId: user.uid });
      setOutstanding(response.data.outstanding);
      setSession(response.data.session);
    }
    if (user) fetchOutstanding();
  }, [user]);

  return (
    <PaymentContext.Provider value={{ outstanding, session }}>
      {children}
    </PaymentContext.Provider>
  );
}