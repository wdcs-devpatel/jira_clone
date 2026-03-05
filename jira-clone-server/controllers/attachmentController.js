const Attachment = require("../models/Attachment");
const fs = require("fs");
const path = require("path");

/* =============================================================
   UPLOAD ATTACHMENT
   ============================================================= */
exports.uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ✅ NEW: Storing originalname for UI and filename for the physical disk
    const attachment = await Attachment.create({
      taskId,
      filename: req.file.originalname, // e.g., "my-image.png"
      storedName: req.file.filename,   // e.g., "17199933-my-image.png"
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user?._id || "unknown",
    });

    res.status(201).json(attachment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =============================================================
   GET ATTACHMENTS BY TASK
   ============================================================= */
exports.getAttachmentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const files = await Attachment.find({ taskId });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =============================================================
   DELETE ATTACHMENT
   ============================================================= */
// ✅ NEW: Deletes both the Database record and the physical file from /uploads
exports.deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the file record in MongoDB
    const file = await Attachment.findById(id);
    if (!file) return res.status(404).json({ message: "File not found" });

    // 2. Construct the absolute path to the physical file
    // We remove the "/uploads/" prefix from the stored URL to get the raw filename
    const filePath = path.join(__dirname, "../uploads", file.fileUrl.replace("/uploads/", ""));

    // 3. Delete from physical storage if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 4. Delete the record from MongoDB
    await file.deleteOne();

    res.json({ message: "Attachment deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};