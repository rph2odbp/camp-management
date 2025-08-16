import React, { useContext } from 'react';
import OutstandingPayments from '../components/OutstandingPayments';
import { PaymentContext } from '../context/PaymentContext';
import { useNavigate } from 'react-router-dom';

function ParentPortal() {
  const { outstanding, session } = useContext(PaymentContext);
  const navigate = useNavigate();

  // Dummy payments array for example; replace with actual outstanding payments from context/backend
  const payments = session && outstanding > 0
    ? [{ sessionId: session.id, sessionName: session.name, outstanding }]
    : [];

  const handlePay = (payment) => {
    navigate('/pay', { state: { payment } });
  };

  return (
    <main role="main" style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <header>
        <h1>Parent Portal</h1>
        <p>
          Welcome! Access everything you need for your camper: registration, profiles, documents, and communication.
        </p>
      </header>

      <nav aria-label="Parent navigation" style={{ margin: "2rem 0" }}>
        <ul style={{ display: "flex", gap: "2rem", listStyle: "none", padding: 0 }}>
          <li><a href="/parent/register">Register Camper</a></li>
          <li><a href="/parent/profile">Camper Profile</a></li>
          <li><a href="/parent/enrollment">Session Enrollment</a></li>
          <li><a href="/parent/documents">Upload Documents</a></li>
          <li><a href="/parent/messages">Messages</a></li>
          <li><a href="/parent/payments">Payments</a></li>
        </ul>
      </nav>

      <section aria-label="Parent dashboard widgets" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
        <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: "1rem", background: "#f7fafc" }}>
          <h2>Camper Status</h2>
          <ul>
            <li>Registered: <strong>{session?.registered ? "Yes" : "--"}</strong></li>
            <li>Session: <strong>{session?.name || "--"}</strong></li>
            <li>Payment Status: <strong>{outstanding === 0 ? "Paid" : "Outstanding"}</strong></li>
          </ul>
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: "1rem", background: "#f7fafc" }}>
          <h2>Upcoming Deadlines</h2>
          <ul>
            <li>Medical Forms: <strong>{session?.medicalDue || "--"}</strong></li>
            <li>Payment Due: <strong>{session?.paymentDue || "--"}</strong></li>
            <li>Session Start: <strong>{session?.startDate || "--"}</strong></li>
          </ul>
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: "1rem", background: "#f7fafc" }}>
          <h2>Quick Actions</h2>
          <ul>
            <li><a href="/parent/messages">Contact Staff</a></li>
            <li><a href="/parent/documents">Upload Insurance Card</a></li>
            <li><a href="/parent/enrollment">Change Session</a></li>
          </ul>
        </div>
      </section>

      <section aria-label="Outstanding Payments" style={{ marginTop: "2rem" }}>
        <OutstandingPayments payments={payments} onPay={handlePay} />
      </section>
    </main>
  );
}

export default ParentPortal;