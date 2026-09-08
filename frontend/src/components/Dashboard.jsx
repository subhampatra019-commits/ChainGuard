import './Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <div>
          <p className="small-title">CHAINGUARD SECURITY</p>
          <h1>Dashboard</h1>
          <p className="subtitle">
            Manage your identity, digital assets and blockchain security.
          </p>
        </div>

        <div className="secure-badge">
          ● SYSTEM SECURE
        </div>
      </div>

      <div className="stats">

        <div className="stat-card">
          <span>🔐</span>
          <h3>Identity</h3>
          <strong>Protected</strong>
        </div>

        <div className="stat-card">
          <span>📁</span>
          <h3>Digital Assets</h3>
          <strong>0 Assets</strong>
        </div>

        <div className="stat-card">
          <span>🛡️</span>
          <h3>Access Control</h3>
          <strong>Active</strong>
        </div>

        <div className="stat-card">
          <span>⛓️</span>
          <h3>Blockchain</h3>
          <strong>Connected</strong>
        </div>

      </div>

      <div className="main-panel">

        <div className="panel">
          <h2>Digital Assets</h2>
          <p>
            Upload and verify your files using blockchain technology.
          </p>

          <label className="upload-btn">
  + Upload Asset
  <input
    type="file"
    style={{ display: 'none' }}
  />
</label>
        </div>

        <div className="panel">
          <h2>Security Status</h2>

          <div className="security-item">
            <span>✓</span>
            Identity Verification
          </div>

          <div className="security-item">
            <span>✓</span>
            Access Control
          </div>

          <div className="security-item">
            <span>✓</span>
            Blockchain Verification
          </div>

          <div className="security-item">
            <span>✓</span>
            Asset Integrity
          </div>
        </div>

      </div>

    </div>
  )
}

export default Dashboard