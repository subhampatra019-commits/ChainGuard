const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({

  fileName: {
    type: String,
    required: true
  },

  filePath: {
    type: String,
    required: true
  },

  fileHash: {
    type: String,
    required: true
  },

  fileSize: {
    type: Number,
    required: true
  },

  uploadedAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Asset", assetSchema);