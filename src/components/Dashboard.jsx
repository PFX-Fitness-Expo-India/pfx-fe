export default function Dashboard({ athletes, tickets, onExportAthletes, onExportTickets }) {
  const totalTicketQty = tickets.reduce((sum, t) => sum + (t.quantity || 0), 0);

  return (
    <section id="admin" className="section section-dark admin-section">
      <div className="container section-header">
        <div>
          <p className="eyebrow">Admin Dashboard</p>
          <h2>Real-time overview of registrations</h2>
        </div>
        <p className="section-intro">
          This lightweight dashboard pulls data from local browser storage for demo purposes. In
          production it would connect to a secure backend and payment gateway.
        </p>
      </div>
      <div className="container admin-grid">
        <div className="admin-stats">
          <div className="stat-card small">
            <span className="stat-label">Total Athletes</span>
            <span className="stat-value">{athletes.length}</span>
          </div>
          <div className="stat-card small">
            <span className="stat-label">Visitor Tickets</span>
            <span className="stat-value">{totalTicketQty}</span>
          </div>
          <div className="stat-card small">
            <span className="stat-label">Payments (Simulated)</span>
            <span className="stat-value" style={{ fontSize: '0.9rem' }}>Online only for select sports</span>
          </div>
        </div>

        <div className="admin-tables">
          {/* Athletes Table */}
          <div className="admin-table-card">
            <div className="admin-table-header">
              <h3>Athlete Registrations</h3>
              <button className="btn subtle" onClick={onExportAthletes}>Export to Excel</button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Phone</th><th>Sport</th>
                    <th>City</th><th>Weight Cat.</th><th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {athletes.length === 0 ? (
                    <tr><td colSpan={6} className="empty-row">No registrations yet.</td></tr>
                  ) : (
                    athletes.map((a, i) => (
                      <tr key={i}>
                        <td>{a.name}</td>
                        <td>{a.phone}</td>
                        <td>{a.sportName}</td>
                        <td>{a.city}</td>
                        <td>{a.weight}</td>
                        <td>{a.requiresPayment ? 'Online' : 'Call'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="admin-table-card">
            <div className="admin-table-header">
              <h3>Visitor Tickets</h3>
              <button className="btn subtle" onClick={onExportTickets}>Export to Excel</button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Phone</th><th>Email</th><th>Type</th><th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 ? (
                    <tr><td colSpan={5} className="empty-row">No tickets booked yet.</td></tr>
                  ) : (
                    tickets.map((t, i) => (
                      <tr key={i}>
                        <td>{t.name}</td>
                        <td>{t.phone}</td>
                        <td>{t.email}</td>
                        <td>{t.type}</td>
                        <td>{t.quantity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
