import { useState } from "react";
import "./Dashboard.css";

// =========================
// CHAINGUARD BACKEND URL
// =========================

const BACKEND_URL =
  "https://subtitle-alumni-tricolor.ngrok-free.dev";

function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const [assetId, setAssetId] = useState("");
  const [verifyStatus, setVerifyStatus] = useState("");

  const [userAddress, setUserAddress] = useState("");
  const [accessStatus, setAccessStatus] = useState("");

  // =========================
  // FILE SELECTION
  // =========================

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setSelectedFile(file);

      setUploadStatus(
        "Selected: " + file.name
      );

      setVerifyStatus("");
    }
  };

  // =========================
  // UPLOAD FILE
  // BACKEND -> MONGODB -> BLOCKCHAIN
  // =========================

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus(
        "Please select a file first."
      );
      return;
    }

    try {
      setUploadStatus(
        "Uploading file to ChainGuard backend..."
      );

      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const response = await fetch(
        `${BACKEND_URL}/api/upload`,
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          "Upload failed"
        );
      }

      setUploadStatus(
        "✅ Asset registered successfully!\n\n" +
        "File: " + data.fileName + "\n\n" +
        "Size: " + data.fileSize + " bytes\n\n" +
        "SHA-256:\n" + data.fileHash + "\n\n" +
        "Transaction Hash:\n" +
        data.transactionHash
      );

    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      setUploadStatus(
        "❌ Upload failed:\n\n" +
        error.message
      );
    }
  };

  // =========================
  // VERIFY FILE
  // =========================

  const handleVerify = async () => {
    if (!selectedFile) {
      setVerifyStatus(
        "Please select the original file first."
      );
      return;
    }

    if (!assetId) {
      setVerifyStatus(
        "Please enter Asset ID."
      );
      return;
    }

    try {
      setVerifyStatus(
        "Uploading file for verification..."
      );

      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );

      formData.append(
        "assetId",
        assetId
      );

      const response = await fetch(
        `${BACKEND_URL}/api/verify`,
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          "Verification failed"
        );
      }

      if (data.verified) {
        setVerifyStatus(
          "✅ FILE VERIFIED\n\n" +
          "Asset ID:\n" +
          assetId +
          "\n\nCurrent SHA-256:\n" +
          data.fileHash +
          "\n\nStatus:\n" +
          "File is authentic and has not been modified."
        );
      } else {
        setVerifyStatus(
          "❌ FILE TAMPERED\n\n" +
          "Asset ID:\n" +
          assetId +
          "\n\nCurrent SHA-256:\n" +
          data.fileHash +
          "\n\nStatus:\n" +
          "File does not match the blockchain record."
        );
      }

    } catch (error) {
      console.error(
        "Verification error:",
        error
      );

      setVerifyStatus(
        "❌ Verification failed:\n\n" +
        error.message
      );
    }
  };

  // =========================
  // GRANT ACCESS
  // =========================

  const handleGrantAccess = async () => {
    if (!assetId || !userAddress) {
      setAccessStatus(
        "Please enter Asset ID and user wallet address."
      );
      return;
    }

    try {
      setAccessStatus(
        "Granting access through blockchain backend..."
      );

      const response = await fetch(
        `${BACKEND_URL}/api/access/grant`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            assetId: Number(assetId),
            userAddress: userAddress
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          "Grant access failed"
        );
      }

      setAccessStatus(
        "✅ ACCESS GRANTED\n\n" +
        "Asset ID:\n" +
        data.assetId +
        "\n\nUser:\n" +
        data.userAddress +
        "\n\nTransaction:\n" +
        data.transactionHash
      );

    } catch (error) {
      console.error(
        "Grant access error:",
        error
      );

      setAccessStatus(
        "❌ Grant access failed:\n\n" +
        error.message
      );
    }
  };

  // =========================
  // CHECK ACCESS
  // =========================

  const handleCheckAccess = async () => {
    if (!assetId || !userAddress) {
      setAccessStatus(
        "Please enter Asset ID and user wallet address."
      );
      return;
    }

    try {
      setAccessStatus(
        "Checking blockchain access..."
      );

      const response = await fetch(
        `${BACKEND_URL}/api/access/check`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            assetId: Number(assetId),
            userAddress: userAddress
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          "Access check failed"
        );
      }

      if (data.hasAccess) {
        setAccessStatus(
          "✅ USER HAS ACCESS\n\n" +
          "Asset ID:\n" +
          data.assetId +
          "\n\nUser:\n" +
          data.userAddress +
          "\n\nAccess:\n" +
          "AUTHORIZED"
        );
      } else {
        setAccessStatus(
          "❌ USER DOES NOT HAVE ACCESS\n\n" +
          "Asset ID:\n" +
          data.assetId +
          "\n\nUser:\n" +
          data.userAddress +
          "\n\nAccess:\n" +
          "DENIED"
        );
      }

    } catch (error) {
      console.error(
        "Check access error:",
        error
      );

      setAccessStatus(
        "❌ Access check failed:\n\n" +
        error.message
      );
    }
  };

  // =========================
  // REVOKE ACCESS
  // =========================

  const handleRevokeAccess = async () => {
    if (!assetId || !userAddress) {
      setAccessStatus(
        "Please enter Asset ID and user wallet address."
      );
      return;
    }

    try {
      setAccessStatus(
        "Revoking access through blockchain..."
      );

      const response = await fetch(
        `${BACKEND_URL}/api/access/revoke`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            assetId: Number(assetId),
            userAddress: userAddress
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          "Revoke access failed"
        );
      }

      setAccessStatus(
        "✅ ACCESS REVOKED\n\n" +
        "Asset ID:\n" +
        data.assetId +
        "\n\nUser:\n" +
        data.userAddress +
        "\n\nTransaction:\n" +
        data.transactionHash
      );

    } catch (error) {
      console.error(
        "Revoke access error:",
        error
      );

      setAccessStatus(
        "❌ Revoke access failed:\n\n" +
        error.message
      );
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="dashboard">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>

          <p className="small-title">
            CHAINGUARD SECURITY
          </p>

          <h1>
            Dashboard
          </h1>

          <p className="subtitle">
            Manage your identity, digital assets and blockchain security.
          </p>

        </div>

        <div className="secure-badge">
          ● SYSTEM SECURE
        </div>

      </div>

      {/* STATS */}

      <div className="stats">

        <div className="stat-card">
          <span>🔐</span>
          <h3>Identity</h3>
          <strong>Protected</strong>
        </div>

        <div className="stat-card">
          <span>📁</span>
          <h3>Digital Assets</h3>
          <strong>Blockchain</strong>
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

      {/* MAIN PANELS */}

      <div className="main-panel">

        {/* DIGITAL ASSETS */}

        <div className="panel">

          <h2>
            Digital Assets
          </h2>

          <p>
            Upload and register your files using blockchain technology.
          </p>

          <label className="upload-btn">

            + Upload Asset

            <input
              type="file"
              style={{
                display: "none"
              }}
              onChange={
                handleFileChange
              }
            />

          </label>

          {selectedFile && (

            <div className="selected-file">

              <p>
                <strong>
                  File:
                </strong>{" "}
                {selectedFile.name}
              </p>

              <p>
                <strong>
                  Size:
                </strong>{" "}
                {(
                  selectedFile.size /
                  1024
                ).toFixed(2)} KB
              </p>

              <button
                className="upload-submit"
                onClick={
                  handleUpload
                }
              >
                Register Asset
              </button>

            </div>

          )}

          {uploadStatus && (

            <pre className="status-box">
              {uploadStatus}
            </pre>

          )}

        </div>

        {/* VERIFY */}

        <div className="panel">

          <h2>
            Verify Asset
          </h2>

          <p>
            Check whether an uploaded file has been modified.
          </p>

          <input
            type="number"
            placeholder="Enter Asset ID"
            value={assetId}
            onChange={(e) =>
              setAssetId(
                e.target.value
              )
            }
            className="input-field"
          />

          <label className="upload-btn">

            + Select File

            <input
              type="file"
              style={{
                display: "none"
              }}
              onChange={
                handleFileChange
              }
            />

          </label>

          <button
            className="upload-submit"
            onClick={
              handleVerify
            }
          >
            Verify File
          </button>

          {verifyStatus && (

            <pre className="status-box">
              {verifyStatus}
            </pre>

          )}

        </div>

        {/* ACCESS CONTROL */}

        <div className="panel">

          <h2>
            Access Control
          </h2>

          <p>
            Manage access to your digital assets.
          </p>

          <input
            type="text"
            placeholder="Asset ID"
            value={assetId}
            onChange={(e) =>
              setAssetId(
                e.target.value
              )
            }
            className="input-field"
          />

          <input
            type="text"
            placeholder="User wallet address"
            value={userAddress}
            onChange={(e) =>
              setUserAddress(
                e.target.value
              )
            }
            className="input-field"
          />

          <div className="access-buttons">

            <button
              className="upload-submit"
              onClick={
                handleGrantAccess
              }
            >
              Grant Access
            </button>

            <button
              className="upload-submit"
              onClick={
                handleCheckAccess
              }
            >
              Check Access
            </button>

            <button
              className="upload-submit"
              onClick={
                handleRevokeAccess
              }
            >
              Revoke Access
            </button>

          </div>

          {accessStatus && (

            <pre className="status-box">
              {accessStatus}
            </pre>

          )}

        </div>

        {/* SECURITY STATUS */}

        <div className="panel">

          <h2>
            Security Status
          </h2>

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
  );
}

export default Dashboard;