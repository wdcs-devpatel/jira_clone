const express = require("express");
const router = express.Router();
const viewerController = require("../controllers/viewerController");

/**
 * VIEWER ROLE ROUTES
 * Handles management of the Viewer role and user assignments in MongoDB.
 */

// GET: Fetch the Viewer role definition (and seed if necessary)
router.get("/", viewerController.getViewerRole);

// POST: Assign a user to the Viewer role
router.post("/assign", viewerController.assignViewer);

// ✅ POST: Remove a user from the Viewer role (Cleanup for SQL reassignments)
router.post("/remove", viewerController.removeViewer);

// GET: Check if a specific user is currently a Viewer
router.get("/check/:userId", viewerController.checkViewer);

module.exports = router;