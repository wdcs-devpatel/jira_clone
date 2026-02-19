const { Task, Project } = require("../models");
const { Op } = require("sequelize");

/* =======================
   SEARCH TASKS
======================= */
exports.searchTasks = async (req, res, next) => {
  try {
    const q = req.query.q || "";

    // Security check: Only return tasks the user has access to
    // (They own the project OR they are the assignee)
    const tasks = await Task.findAll({
      where: {
        title: {
          [Op.iLike]: `%${q}%` // Case-insensitive search for Postgres
        },
        [Op.or]: [
          { assigneeId: req.user.id },
          { '$Project.userId$': req.user.id }
        ]
      },
      include: [{
        model: Project,
        attributes: ['userId', 'name']
      }],
      order: [["createdAt", "DESC"]],
    });

    res.json(tasks);
  } catch (err) {
    console.error("Search Error:", err);
    next(err);
  }
};

/* =======================
   CREATE TASK
======================= */
exports.createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Permission check
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

/* =======================
   GET TASKS FOR PROJECT
======================= */
exports.getTasksForProject = async (req, res, next) => {
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

/* =======================
   UPDATE TASK
======================= */
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

/* =======================
   UPDATE STATUS ONLY
======================= */
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

/* =======================
   DELETE TASK
======================= */
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