import React from 'react';

function StaffPortal() {
  return (
    <main role="main" style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <header>
        <h1>Staff Portal</h1>
        <p>
          Welcome! Manage your assignments, schedules, camper information, and communications here.
        </p>
      </header>

      <nav aria-label="Staff navigation" style={{ margin: "2rem 0" }}>
        <ul style={{ display: "flex", gap: "2rem", listStyle: "none", padding: 0 }}>
          <li><a href="/staff/schedule">My Schedule</a></li>
          <li><a href="/staff/campers">Camper Information</a></li>
          <li><a href="/staff/medical">Medical Logs</a></li>
          <li><a href="/staff/employment">Employment Status</a></li>
          <li><a href="/staff/messages">Messages</a></li>
        </ul>
      </nav>

      <section aria-label="Staff dashboard widgets" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
        <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: "1rem", background: "#f7fafc" }}>
          <h2>Today's Overview</h2>
          <ul>
            <li>Assigned Campers: <strong>--</strong></li>
            <li>Medical Alerts: <strong>--</strong></li>
            <li>Schedule Changes: <strong>--</strong></li>
          </ul>
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: "1rem", background: "#f7fafc" }}>
          <h2>Pending Tasks</h2>
          <ul>
            <li>Check-in Camper: <strong>--</strong></li>
            <li>Log Medication: <strong>--</strong></li>
            <li>Review Employment Docs: <strong>--</strong></li>
          </ul>
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: "1rem", background: "#f7fafc" }}>
          <h2>Quick Links</h2>
          <ul>
            <li><a href="/staff/messages">Contact Admin</a></li>
            <li><a href="/staff/medical">Log Medication</a></li>
            <li><a href="/staff/employment">Update Profile</a></li>
          </ul>
        </div>
      </section>
    </main>
  );
}

export default StaffPortal;