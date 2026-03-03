const Task = require("../models/Task");

/**
 * Define the State Machine for Task Status
 */
const allowedTransitions = {
  Backlog: ["In Progress"],
  "In Progress": ["In Review", "Backlog"],
  "In Review": ["Done", "In Progress"],
  Done: ["In Progress"],
};

// @desc    Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    // Sorting by createdAt: -1 ensures newest tasks appear first (or top of the column)
    const tasks = await Task.find()
      .populate("assignee", "name email")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, project, assignee } = req.body;

    const task = await Task.create({
      title,
      description,
      project,
      assignee,
      priority: priority || "Medium",
      status: "Backlog",
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task status with validation and activity logging
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { newStatus } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const currentStatus = task.status;

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      return res.status(400).json({
        message: `Invalid status transition from ${currentStatus} to ${newStatus}`,
      });
    }

    task.status = newStatus;

    task.activityLogs.push({
      user: req.user?._id,
      action: "STATUS_CHANGED",
      field: "status",
      oldValue: currentStatus,
      newValue: newStatus,
    });

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a comment to a task
exports.addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.comments.push({
      user: req.user?._id,
      text,
    });

    task.activityLogs.push({
      user: req.user?._id,
      action: "COMMENT_ADDED",
      field: "comment",
      oldValue: "",
      newValue: text,
    });

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task priority level
exports.updatePriority = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { priority } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const oldPriority = task.priority;
    task.priority = priority;

    task.activityLogs.push({
      user: req.user?._id,
      action: "PRIORITY_CHANGED",
      field: "priority",
      oldValue: oldPriority,
      newValue: priority,
    });

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload file attachment and link to task
exports.uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.attachments.push({
      filename: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user?._id,
    });

    task.activityLogs.push({
      user: req.user?._id,
      action: "FILE_UPLOADED",
      field: "attachment",
      oldValue: "",
      newValue: req.file.filename,
    });

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get task by ID with populated references
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("assignee", "name email")
      .populate("comments.user", "name")
      .populate("activityLogs.user", "name")
      .populate("attachments.uploadedBy", "name");
      
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};