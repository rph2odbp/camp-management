import React from 'react';

function AdminPortal() {
  return (
    <main role="main" style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <header>
        <h1>Admin Portal</h1>
        <p>Welcome, Admin! Use the dashboard below to manage camp operations.</p>
      </header>

      <nav aria-label="Admin navigation" style={{ margin: "2rem 0" }}>
        <ul style={{ display: "flex", gap: "2rem", listStyle: "none", padding: 0 }}>
          <li><a href="/admin/users">User Management</a></li>
          <li><a href="/admin/sessions">Session Management</a></li>
          <li><a href="/admin/finance">Financial Reporting</a></li>
          <li><a href="/admin/medical">Medical Panel</a></li>
          <li><a href="/admin/messages">Camper Messages</a></li>
          <li><a href="/admin/employment">Employment Management</a></li>
        </ul>
      </nav>

      <section aria-label="Admin dashboard widgets" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
        <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: "1rem", background: "#fafafa" }}>
          <h2>Quick Stats</h2>
          <ul>
            <li>Total Campers: <strong>--</strong></li>
            <li>Registrations in Progress: <strong>--</strong></li>
            <li>Payments Received: <strong>--</strong></li>
          </ul>
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: "1rem", background: "#fafafa" }}>
          <h2>Pending Actions</h2>
          <ul>
            <li>Waitlist Approvals: <strong>--</strong></li>
            <li>Employment Applications: <strong>--</strong></li>
            <li>Medical Alerts: <strong>--</strong></li>
          </ul>
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: "1rem", background: "#fafafa" }}>
          <h2>Useful Links</h2>
          <ul>
            <li><a href="/admin/letters">Send Acceptance Letters</a></li>
            <li><a href="/admin/assign-cabins">Assign Cabins</a></li>
            <li><a href="/admin/reports">View Reports</a></li>
          </ul>
        </div>
      </section>
    </main>
  );
}

export default AdminPortal;