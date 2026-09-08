import { useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'

function App() {
  const [showDashboard, setShowDashboard] = useState(false)

  if (showDashboard) {
    return <Dashboard />
  }

  return (
    <div className="app">

      <nav className="navbar">
        <div className="logo">
          <span>⛓</span> ChainGuard
        </div>

        <button className="connect-btn">
          Connect Wallet
        </button>
      </nav>

      <main className="hero-section">

        <div className="hero-content">

          <div className="badge">
            🔐 Blockchain-Powered Security
          </div>

          <h1>
            Secure Your
            <span> Digital Assets</span>
          </h1>

          <p>
            A secure blockchain-based platform for identity,
            access control, and digital asset management.
          </p>

          <div className="buttons">

            <button
              className="primary-btn"
              onClick={() => setShowDashboard(true)}
            >
              Get Started →
            </button>

            <button className="secondary-btn">
              Verify Asset
            </button>

          </div>

        </div>

        <div className="security-card">

          <div className="card-header">
            <span>●</span>
            Security Status
          </div>

          <div className="shield">
            🛡️
          </div>

          <h2>System Secure</h2>

          <p>
            Blockchain verification is active
          </p>

          <div className="status-row">
            <div>
              <strong>✓</strong> Identity
            </div>

            <div>
              <strong>✓</strong> Access
            </div>

            <div>
              <strong>✓</strong> Assets
            </div>
          </div>

        </div>

      </main>

      <section className="features">

        <div className="feature">
          <div className="feature-icon">🔐</div>
          <h3>Secure Identity</h3>
          <p>
            Protect user identity with secure authentication.
          </p>
        </div>

        <div className="feature">
          <div className="feature-icon">⛓️</div>
          <h3>Blockchain Proof</h3>
          <p>
            Verify asset integrity using blockchain records.
          </p>
        </div>

        <div className="feature">
          <div className="feature-icon">🛡️</div>
          <h3>Access Control</h3>
          <p>
            Grant and revoke access to digital assets.
          </p>
        </div>

      </section>

    </div>
  )
}

export default App