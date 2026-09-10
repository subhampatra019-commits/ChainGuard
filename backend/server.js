const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
require("dotenv").config();

const { ethers } = require("ethers");
const contractABI = require("../blockchain/ChainGuardABI.json");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());

const PORT = 5000;

const mongoose = require("mongoose");

const provider = new ethers.JsonRpcProvider(
  process.env.SEPOLIA_RPC_URL
);

const wallet = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  provider
);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  wallet
);

const dns = require("dns");
dns.setServers(["1.1.1.1"]);

const Asset = require("./models/Asset");

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error.message);

    if (error.reason && error.reason.servers) {
      for (const [server, details] of error.reason.servers) {
        console.error("\nSERVER:", server);
        console.error("ERROR:", details.error);
      }
    }
  });

// Home route
app.get("/", (req, res) => {
  res.send("ChainGuard Backend is running!");
});

// File upload + SHA-256 + MongoDB + Blockchain
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const fileHash = crypto
      .createHash("sha256")
      .update(require("fs").readFileSync(req.file.path))
      .digest("hex");

    const asset = new Asset({
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileHash: fileHash
    });

    await asset.save();

    const tx = await contract.registerAsset(
      req.file.originalname,
      fileHash
    );

    const receipt = await tx.wait();

    console.log("Blockchain transaction successful!");
    console.log("Transaction hash:", receipt.hash);

    res.json({
      message: "File uploaded successfully!",
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileHash: fileHash,
      transactionHash: receipt.hash
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "File upload failed",
      error: error.message
    });
  }
});

// File verification
app.post("/api/verify", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const assetId = req.body.assetId;

    if (!assetId) {
      return res.status(400).json({
        message: "Asset ID is required"
      });
    }

    const fileHash = crypto
      .createHash("sha256")
      .update(require("fs").readFileSync(req.file.path))
      .digest("hex");

    const isVerified = await contract.verifyAsset(
      assetId,
      fileHash
    );

    res.json({
      message: isVerified
        ? "File verified successfully!"
        : "File has been tampered with!",
      fileHash: fileHash,
      verified: isVerified
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "File verification failed",
      error: error.message
    });
  }
});

// Test API
app.post("/api/test", (req, res) => {
  res.json({
    message: "Backend API is working!",
    data: req.body
  });
});

// Grant access to a user
app.post("/api/access/grant", async (req, res) => {
  try {
    const { assetId, userAddress } = req.body;

    if (!assetId || !userAddress) {
      return res.status(400).json({
        message: "Asset ID and user address are required"
      });
    }

    const tx = await contract.grantAccess(
      assetId,
      userAddress
    );

    const receipt = await tx.wait();

    console.log("Access grant transaction successful!");
    console.log("Transaction hash:", receipt.hash);

    res.json({
      message: "Access granted successfully!",
      assetId: assetId,
      userAddress: userAddress,
      transactionHash: receipt.hash
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to grant access",
      error: error.message
    });
  }
});

// Check access for a user
app.post("/api/access/check", async (req, res) => {
  try {
    const { assetId, userAddress } = req.body;

    if (!assetId || !userAddress) {
      return res.status(400).json({
        message: "Asset ID and user address are required"
      });
    }

    const hasAccess = await contract.checkAccess(
      assetId,
      userAddress
    );

    res.json({
      message: "Access check completed!",
      assetId: assetId,
      userAddress: userAddress,
      hasAccess: hasAccess
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to check access",
      error: error.message
    });
  }
});

// Revoke access from a user
app.post("/api/access/revoke", async (req, res) => {
  try {
    const { assetId, userAddress } = req.body;

    if (!assetId || !userAddress) {
      return res.status(400).json({
        message: "Asset ID and user address are required"
      });
    }

    const tx = await contract.revokeAccess(
      assetId,
      userAddress
    );

    const receipt = await tx.wait();

    console.log("Access revoke transaction successful!");
    console.log("Transaction hash:", receipt.hash);

    res.json({
      message: "Access revoked successfully!",
      assetId: assetId,
      userAddress: userAddress,
      transactionHash: receipt.hash
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to revoke access",
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`ChainGuard server running on http://localhost:${PORT}`);
});