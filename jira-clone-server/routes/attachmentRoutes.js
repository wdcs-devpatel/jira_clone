const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  uploadAttachment,
  getAttachmentsByTask,
  deleteAttachment // ✅ Confirmed: Imported delete function
} = require("../controllers/attachmentController");

/* =============================================================
   ATTACHMENT MICROSERVICE ROUTES
   ============================================================= */

/**
 * CREATE: Upload a new file for a specific task
 * Expects: Multipart/form-data with key "file"
 */
router.post("/:taskId", upload.single("file"), uploadAttachment);

/**
 * READ: Get all files associated with a specific task
 * Returns: Array of attachment metadata
 */
router.get("/:taskId", getAttachmentsByTask);

/**
 * DELETE: Remove a specific file and its metadata
 * Action: Deletes physical file from /uploads and record from MongoDB
 */
router.delete("/:id", deleteAttachment);

module.exports = router;