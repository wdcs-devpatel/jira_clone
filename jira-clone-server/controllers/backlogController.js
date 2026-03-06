const Backlog = require("../models/Backlog");

/* =========================================================
   CREATE BACKLOG
   ========================================================= */
exports.createBacklog = async (req, res) => {
  try {
    const { title, description, projectId, createdBy, priority } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        message: "Title and projectId are required",
      });
    }

    const backlog = new Backlog({
      title,
      description,
      projectId,
      createdBy,
      priority,
    });

    await backlog.save();

    res.status(201).json(backlog);
  } catch (error) {
    console.error("Create Backlog Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* =========================================================
   GET ALL BACKLOGS
   ========================================================= */
exports.getBacklogs = async (req, res) => {
  try {
    const { projectId } = req.query;

    let filter = {};
    if (projectId) {
      filter.projectId = projectId;
    }

    const backlogs = await Backlog.find(filter).sort({ createdAt: -1 });

    res.json(backlogs);
  } catch (error) {
    console.error("Get Backlogs Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* =========================================================
   UPDATE BACKLOG
   ========================================================= */
exports.updateBacklog = async (req, res) => {
  try {
    const { id } = req.params;

    const backlog = await Backlog.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!backlog) {
      return res.status(404).json({
        message: "Backlog not found",
      });
    }

    res.json(backlog);
  } catch (error) {
    console.error("Update Backlog Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* =========================================================
   DELETE BACKLOG
   ========================================================= */
exports.deleteBacklog = async (req, res) => {
  try {
    const { id } = req.params;

    const backlog = await Backlog.findByIdAndDelete(id);

    if (!backlog) {
      return res.status(404).json({
        message: "Backlog not found",
      });
    }

    res.json({
      message: "Backlog deleted successfully",
    });
  } catch (error) {
    console.error("Delete Backlog Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};