
const { Task, Project } = require("../models");

exports.createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.userId !== req.user.id) {
      const assigned = await Task.findOne({
        where: {
          projectId,
          assigneeId: req.user.id
        }
      });

      if (!assigned) {
        return res.status(403).json({ message: "Access denied: You are not part of this project" });
      }
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

exports.getTasksForProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Permission check: Must be owner or have at least one assigned task
    if (project.userId !== req.user.id) {
      const assigned = await Task.findOne({
        where: {
          projectId,
          assigneeId: req.user.id
        }
      });

      if (!assigned) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const tasks = await Task.findAll({
      where: { projectId: projectId },
      order: [["createdAt", "DESC"]],
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    // Optional: Add logic here to ensure only the owner or the assignee can update the task
    await task.update(req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

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
