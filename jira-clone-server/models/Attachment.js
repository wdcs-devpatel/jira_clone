const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
  taskId: {
    type: String, // Postgres task ID
    required: true,
  },
  filename: String,
  fileUrl: String,
  uploadedBy: String,
}, { timestamps: true });

module.exports = mongoose.model("Attachment", attachmentSchema);