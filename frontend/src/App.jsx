import { useState } from 'react'
import { ethers } from 'ethers'
import './App.css'
import Dashboard from './components/Dashboard'
import { getContract } from './contract'

function App() {
  const [showDashboard, setShowDashboard] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [connecting, setConnecting] = useState(false)

  // Connect MetaMask
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('MetaMask is not installed. Please install MetaMask first.')
        return
      }

      setConnecting(true)

      const provider = new ethers.BrowserProvider(window.ethereum)

      const accounts = await provider.send(
        'eth_requestAccounts',
        []
      )

      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
      }

    } catch (error) {
      console.error('Wallet connection failed:', error)
      alert('Wallet connection failed. Please try again.')
    } finally {
      setConnecting(false)
    }
  }

  // Disconnect wallet from frontend
  const disconnectWallet = () => {
    setWalletAddress('')
  }

  // Test blockchain connection
  const testContract = async () => {
    try {
      const contract = await getContract()

      const count = await contract.assetCount()

      console.log('Blockchain connected!')
      console.log('Total Assets:', count.toString())

      alert(
        `Blockchain connected successfully!\nTotal Assets: ${count.toString()}`
      )

    } catch (error) {
      console.error('Blockchain connection failed:', error)

      alert(
        'Blockchain connection failed.\nCheck the browser console for details.'
      )
    }
  }

  // Show dashboard
  if (showDashboard) {
    return <Dashboard />
  }

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">

        <div className="logo">
          <span>⛓</span> ChainGuard
        </div>

        {!walletAddress ? (
          <button
            className="connect-btn"
            onClick={connectWallet}
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="wallet-section">

            <span className="wallet-address">
              {walletAddress.slice(0, 6)}...
              {walletAddress.slice(-4)}
            </span>

            <button
              className="connect-btn"
              onClick={disconnectWallet}
            >
              Disconnect
            </button>

            <button
              className="connect-btn"
              onClick={testContract}
            >
              Test Blockchain
            </button>

          </div>
        )}

      </nav>


      {/* HERO */}
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


        {/* SECURITY CARD */}
        <div className="security-card">

          <div className="card-header">
            <span>●</span> Security Status
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


      {/* FEATURES */}
      <section className="features">

        <div className="feature">

          <div className="feature-icon">
            🔐
          </div>

          <h3>
            Secure Identity
          </h3>

          <p>
            Protect user identity with secure authentication.
          </p>

        </div>


        <div className="feature">

          <div className="feature-icon">
            ⛓️
          </div>

          <h3>
            Blockchain Proof
          </h3>

          <p>
            Verify asset integrity using blockchain records.
          </p>

        </div>


        <div className="feature">

          <div className="feature-icon">
            🛡️
          </div>

          <h3>
            Access Control
          </h3>

          <p>
            Grant and revoke access to digital assets.
          </p>

        </div>

      </section>

    </div>
  )
}

export default App