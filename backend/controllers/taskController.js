const { Task, Project } = require("../models");

/* CREATE TASK */
exports.createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    // Security: Check if user owns the project
    const project = await Project.findOne({
      where: { id: projectId, userId: req.user.id }
    });

    if (!project) {
      return res.status(403).json({ message: "Unauthorized: You don't own this project" });
    }

    const task = await Task.create({
      ...req.body,
      projectId: projectId,
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

/* GET TASKS BY PROJECT */
exports.getTasksByProject = async (req, res, next) => {
  try {
    // Security: Verify project ownership first
    const project = await Project.findOne({
      where: { id: req.params.projectId, userId: req.user.id }
    });

    if (!project) {
      return res.status(403).json({ message: "Unauthorized: Access denied" });
    }

    const tasks = await Task.findAll({
      where: { projectId: req.params.projectId },
      order: [["createdAt", "DESC"]],
    });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

/* UPDATE TASK */
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.update(req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

/* UPDATE STATUS ONLY */
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = req.body.status;
    await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
};

/* DELETE TASK */
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.destroy();
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
};