const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  uploadAttachment,
  getAttachmentsByTask,
  deleteAttachment // ✅ NEW: Imported delete function
} = require("../controllers/attachmentController");

/* ==============================
   ATTACHMENT ROUTES
============================== */

// Create: Upload a new file for a specific task
router.post("/:taskId", upload.single("file"), uploadAttachment);

// Read: Get all files associated with a specific task
router.get("/:taskId", getAttachmentsByTask);

// ✅ NEW: Delete: Remove a specific file by its MongoDB _id
router.delete("/:id", deleteAttachment);

module.exports = router;