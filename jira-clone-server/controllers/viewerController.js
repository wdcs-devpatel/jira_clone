const ViewerRole = require("../models/ViewerRole");
const ViewerUser = require("../models/ViewerUser");

/**
 * GET VIEWER ROLE
 * Retrieves the definition of the Viewer role from MongoDB.
 */
exports.getViewerRole = async (req, res) => {
  try {
    let viewer = await ViewerRole.findOne();

    if (!viewer) {
      viewer = await ViewerRole.create({
        name: "Viewer",
        permissions: ["view_dashboard", "view_task"]
      });
    }

    res.json(viewer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ASSIGN VIEWER ROLE
 * Flags a user ID as a 'Viewer' within the Mongo service.
 */
exports.assignViewer = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const existing = await ViewerUser.findOne({ userId });

    if (existing) {
      return res.json({
        message: "User is already assigned to Viewer role",
        data: existing
      });
    }

    const viewerUser = await ViewerUser.create({ userId });

    res.status(201).json({
      message: "Viewer role assigned successfully",
      data: viewerUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * CHECK VIEWER STATUS
 * Returns boolean true/false if a userId exists in the ViewerUser collection.
 */
exports.checkViewer = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId parameter is required" });
    }

    const viewer = await ViewerUser.findOne({ userId });

    res.json({ isViewer: !!viewer });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ✅ REMOVE VIEWER ROLE
 * Deletes the user record from the ViewerUser collection.
 * Used when a user is promoted or reassigned to a standard SQL role.
 */
exports.removeViewer = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    await ViewerUser.deleteOne({ userId });

    res.json({
      message: "Viewer role removed successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};