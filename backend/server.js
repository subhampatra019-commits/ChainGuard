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

// File upload + SHA-256 hash
app.post("/api/upload", upload.single("file"), async (req, res) =>  {
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
  res.json({
    message: "File uploaded successfully!",
    fileName: req.file.originalname,
    filePath: req.file.path,
    fileSize: req.file.size,
    fileHash: fileHash
  });
});

// Test API
app.post("/api/test", (req, res) => {
  res.json({
    message: "Backend API is working!",
    data: req.body
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`ChainGuard server running on http://localhost:${PORT}`);
});
