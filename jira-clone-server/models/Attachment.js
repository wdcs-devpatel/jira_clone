const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
  taskId: {
    type: String, 
    required: true,
  },
  filename: {
    type: String, // Original user filename (e.g., "design_v1.png")
  },
  storedName: {
    type  : String, // Unique filename on disk (e.g., "17199933-design_v1.png")
  },
  fileUrl: {
    type: String, // Accessible URL path
  },
  uploadedBy: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("Attachment", attachmentSchema);