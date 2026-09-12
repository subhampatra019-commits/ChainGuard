const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

const { ethers } = require("ethers");

const contractABI = require("../blockchain/ChainGuardABI.json");
const Asset = require("./models/Asset");

const app = express();

const upload = multer({
  dest: "uploads/"
});

// =========================
// MIDDLEWARE
// =========================

app.use(express.json());

// =========================
// CORS
// =========================

app.use((req, res, next) => {

  res.header(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );

  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// =========================
// SERVER PORT
// =========================

const PORT = 5000;

// =========================
// DNS
// =========================

dns.setServers([
  "1.1.1.1"
]);

// =========================
// BLOCKCHAIN CONNECTION
// =========================

const provider =
  new ethers.JsonRpcProvider(
    process.env.SEPOLIA_RPC_URL
  );

const wallet =
  new ethers.Wallet(
    process.env.PRIVATE_KEY,
    provider
  );

const contract =
  new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractABI,
    wallet
  );

// =========================
// MONGODB CONNECTION
// =========================

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {

    console.log(
      "MongoDB connected successfully!"
    );

  })

  .catch((error) => {

    console.error(
      "MongoDB connection failed:"
    );

    console.error(
      error.message
    );

  });

// =========================
// HOME ROUTE
// =========================

app.get(
  "/",
  (req, res) => {

    res.json({

      message:
        "ChainGuard Backend is running!",

      status:
        "online",

      port:
        PORT

    });

  }
);

// =========================
// TEST API
// =========================

app.post(
  "/api/test",
  (req, res) => {

    console.log(
      "\n=============================="
    );

    console.log(
      "TEST API REQUEST"
    );

    console.log(
      "=============================="
    );

    res.json({

      message:
        "Backend API is working!",

      data:
        req.body

    });

  }
);

// =========================
// FILE UPLOAD
// SHA-256 + MONGODB + BLOCKCHAIN
// =========================

app.post(
  "/api/upload",

  upload.single("file"),

  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({

          message:
            "No file uploaded"

        });

      }

      // =========================
      // CREATE SHA-256 HASH
      // =========================

      const fileHash =
        crypto
          .createHash("sha256")
          .update(
            fs.readFileSync(
              req.file.path
            )
          )
          .digest("hex");

      console.log(
        "\n=============================="
      );

      console.log(
        "FILE UPLOAD"
      );

      console.log(
        "=============================="
      );

      console.log(
        "File:",
        req.file.originalname
      );

      console.log(
        "Size:",
        req.file.size
      );

      console.log(
        "SHA-256:",
        fileHash
      );

      // =========================
      // SAVE TO MONGODB
      // =========================

      const asset =
        new Asset({

          fileName:
            req.file.originalname,

          filePath:
            req.file.path,

          fileSize:
            req.file.size,

          fileHash:
            fileHash

        });

      await asset.save();

      console.log(
        "Asset saved to MongoDB."
      );

      // =========================
      // REGISTER ON BLOCKCHAIN
      // =========================

      const tx =
        await contract.registerAsset(
          req.file.originalname,
          fileHash
        );

      console.log(
        "Blockchain transaction sent!"
      );

      console.log(
        "Transaction hash:",
        tx.hash
      );

      const receipt =
        await tx.wait();

      console.log(
        "Blockchain transaction confirmed!"
      );

      // =========================
      // GET ACTUAL ASSET ID
      // =========================

      const blockchainAssetCount =
        await contract.assetCount();

      const assetId =
        Number(blockchainAssetCount);

      console.log(
        "Blockchain Asset ID:",
        assetId
      );

      // =========================
      // RESPONSE
      // =========================

      res.json({

        message:
          "File uploaded successfully!",

        assetId:
          assetId,

        fileName:
          req.file.originalname,

        filePath:
          req.file.path,

        fileSize:
          req.file.size,

        fileHash:
          fileHash,

        transactionHash:
          receipt.hash

      });

    }

    catch (error) {

      console.error(
        "UPLOAD ERROR:",
        error
      );

      res.status(500).json({

        message:
          "File upload failed",

        error:
          error.message

      });

    }

  }
);

// =========================
// GET ASSET FROM BLOCKCHAIN
// =========================

app.get(
  "/api/asset/:assetId",

  async (req, res) => {

    try {

      const assetId =
        req.params.assetId;

      if (!assetId) {

        return res.status(400).json({

          message:
            "Asset ID is required"

        });

      }

      const asset =
        await contract.assets(
          assetId
        );

      res.json({

        assetId:
          assetId,

        fileName:
          asset[0],

        fileHash:
          asset[1],

        owner:
          asset[2],

        timestamp:
          Number(asset[3])

      });

    }

    catch (error) {

      console.error(
        "GET ASSET ERROR:",
        error
      );

      res.status(500).json({

        message:
          "Failed to get asset",

        error:
          error.message

      });

    }

  }
);

// =========================
// FILE VERIFICATION
// =========================

app.post(
  "/api/verify",

  upload.single("file"),

  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({

          message:
            "No file uploaded"

        });

      }

      const assetId =
        req.body.assetId;

      if (!assetId) {

        return res.status(400).json({

          message:
            "Asset ID is required"

        });

      }

      // =========================
      // CREATE CURRENT HASH
      // =========================

      const fileHash =
        crypto
          .createHash("sha256")
          .update(
            fs.readFileSync(
              req.file.path
            )
          )
          .digest("hex");

      console.log(
        "\n=============================="
      );

      console.log(
        "FILE VERIFICATION"
      );

      console.log(
        "=============================="
      );

      console.log(
        "Asset ID:",
        assetId
      );

      console.log(
        "Current Hash:",
        fileHash
      );

      // =========================
      // GET BLOCKCHAIN ASSET
      // =========================

      const blockchainAsset =
        await contract.assets(
          assetId
        );

      const blockchainFileHash =
        blockchainAsset[1];

      console.log(
        "Blockchain Hash:",
        blockchainFileHash
      );

      // =========================
      // COMPARE HASHES
      // =========================

      const isVerified =
        blockchainFileHash === fileHash;

      console.log(
        "Verification result:",
        isVerified
      );

      // =========================
      // RESPONSE
      // =========================

      res.json({

        message:
          isVerified
            ? "File verified successfully!"
            : "File has been tampered with!",

        assetId:
          Number(assetId),

        fileHash:
          fileHash,

        blockchainHash:
          blockchainFileHash,

        verified:
          isVerified

      });

    }

    catch (error) {

      console.error(
        "VERIFICATION ERROR:",
        error
      );

      res.status(500).json({

        message:
          "File verification failed",

        error:
          error.message

      });

    }

  }
);

// =========================
// GRANT ACCESS
// =========================

app.post(
  "/api/access/grant",

  async (req, res) => {

    try {

      const {
        assetId,
        userAddress
      } = req.body;

      if (
        !assetId ||
        !userAddress
      ) {

        return res.status(400).json({

          message:
            "Asset ID and user address are required"

        });

      }

      console.log(
        "\n=============================="
      );

      console.log(
        "GRANT ACCESS"
      );

      console.log(
        "=============================="
      );

      console.log(
        "Asset ID:",
        assetId
      );

      console.log(
        "User:",
        userAddress
      );

      const tx =
        await contract.grantAccess(
          assetId,
          userAddress
        );

      console.log(
        "Access grant transaction sent!"
      );

      console.log(
        "Transaction hash:",
        tx.hash
      );

      const receipt =
        await tx.wait();

      console.log(
        "Access grant confirmed!"
      );

      res.json({

        message:
          "Access granted successfully!",

        assetId:
          assetId,

        userAddress:
          userAddress,

        transactionHash:
          receipt.hash

      });

    }

    catch (error) {

      console.error(
        "GRANT ACCESS ERROR:",
        error
      );

      res.status(500).json({

        message:
          "Failed to grant access",

        error:
          error.message

      });

    }

  }
);

// =========================
// CHECK ACCESS
// =========================

app.post(
  "/api/access/check",

  async (req, res) => {

    try {

      const {
        assetId,
        userAddress
      } = req.body;

      if (
        !assetId ||
        !userAddress
      ) {

        return res.status(400).json({

          message:
            "Asset ID and user address are required"

        });

      }

      console.log(
        "\n=============================="
      );

      console.log(
        "CHECK ACCESS"
      );

      console.log(
        "=============================="
      );

      console.log(
        "Asset ID:",
        assetId
      );

      console.log(
        "User:",
        userAddress
      );

      const hasAccess =
        await contract.checkAccess(
          assetId,
          userAddress
        );

      console.log(
        "Access:",
        hasAccess
      );

      res.json({

        message:
          "Access check completed!",

        assetId:
          assetId,

        userAddress:
          userAddress,

        hasAccess:
          hasAccess

      });

    }

    catch (error) {

      console.error(
        "CHECK ACCESS ERROR:",
        error
      );

      res.status(500).json({

        message:
          "Failed to check access",

        error:
          error.message

      });

    }

  }
);

// =========================
// REVOKE ACCESS
// =========================

app.post(
  "/api/access/revoke",

  async (req, res) => {

    try {

      const {
        assetId,
        userAddress
      } = req.body;

      if (
        !assetId ||
        !userAddress
      ) {

        return res.status(400).json({

          message:
            "Asset ID and user address are required"

        });

      }

      console.log(
        "\n=============================="
      );

      console.log(
        "REVOKE ACCESS"
      );

      console.log(
        "=============================="
      );

      console.log(
        "Asset ID:",
        assetId
      );

      console.log(
        "User:",
        userAddress
      );

      const tx =
        await contract.revokeAccess(
          assetId,
          userAddress
        );

      console.log(
        "Revoke transaction sent!"
      );

      console.log(
        "Transaction hash:",
        tx.hash
      );

      const receipt =
        await tx.wait();

      console.log(
        "Access revoke confirmed!"
      );

      res.json({

        message:
          "Access revoked successfully!",

        assetId:
          assetId,

        userAddress:
          userAddress,

        transactionHash:
          receipt.hash

      });

    }

    catch (error) {

      console.error(
        "REVOKE ACCESS ERROR:",
        error
      );

      res.status(500).json({

        message:
          "Failed to revoke access",

        error:
          error.message

      });

    }

  }
);

// =========================
// START SERVER
// =========================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log("");

    console.log(
      "================================="
    );

    console.log(
      "      CHAINGUARD BACKEND"
    );

    console.log(
      "================================="
    );

    console.log("");

    console.log(
      `Local: http://localhost:${PORT}`
    );

    console.log(
      `Port: ${PORT}`
    );

    console.log("");

    console.log(
      "Backend server is running!"
    );

    console.log(
      "================================="
    );

  }
);