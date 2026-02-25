const { Task, Project } = require("../models");
const { Op } = require("sequelize");

/* =============================================================
   SEARCH TASKS
   ============================================================= */
exports.searchTasks = async (req, res, next) => {
  try {
    const q = req.query.q || "";

    // ✅ Security check: Only return tasks the user has access to
    const tasks = await Task.findAll({
      where: {
        title: {
          [Op.iLike]: `%${q}%` // Case-insensitive search for Postgres
        },
        [Op.or]: [
          { assigneeId: req.user.id }, // ✅ Matches Task model field 'assigneeId'
          { '$Project.userId$': req.user.id } // ✅ Matches Project model field 'userId'
        ]
      },
      include: [{
        model: Project,
        attributes: ['userId', 'name']
      }],
      order: [["createdAt", "DESC"]], // ✅ Matches pgAdmin camelCase 'createdAt'
    });

    res.json(tasks);
  } catch (err) {
    console.error("Search Error:", err);
    next(err);
  }
};

/* =============================================================
   CREATE TASK
   ============================================================= */
exports.createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // 🛑 Prevent NaN or invalid ID processing
    if (!projectId || isNaN(projectId)) {
      return res.status(400).json({ message: "Valid Project ID is required" });
    }

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // ✅ Permission check using camelCase 'userId'
    if (Number(project.userId) !== Number(req.user.id)) {
      const assigned = await Task.findOne({
        where: {
          projectId: projectId, 
          assigneeId: req.user.id 
        }
      });

      if (!assigned) {
        return res.status(403).json({ message: "Access denied: You are not part of this project" });
      }
    }

    const task = await Task.create({
      ...req.body,
      projectId: projectId, // ✅ Explicitly set to match model field
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("Create Task Error:", err);
    next(err);
  }
};

/* =============================================================
   GET TASKS FOR PROJECT
   ============================================================= */
exports.getTasksForProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId || isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid Project ID" });
    }

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // ✅ Check access based on ownership (userId) or assignment (assigneeId)
    if (Number(project.userId) !== Number(req.user.id)) {
      const assigned = await Task.findOne({
        where: {
          projectId: projectId,
          assigneeId: req.user.id
        }
      });

      if (!assigned) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const tasks = await Task.findAll({
      where: { projectId: projectId },
      order: [["createdAt", "DESC"]], // ✅ Matches pgAdmin camelCase
    });
    res.json(tasks);
  } catch (err) {
    console.error("Get Project Tasks Error:", err);
    next(err);
  }
};

/* =============================================================
   UPDATE TASK
   ============================================================= */
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 🛑 FIX: Prevents "PUT /api/tasks/NaN" crashing the server
    if (!id || isNaN(id) || id === "NaN") {
      return res.status(400).json({ message: "Invalid Task ID provided" });
    }

    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    // ✅ update() handles the JSON fields (subtasks, comments) and camelCase columns
    await task.update(req.body);
    res.json(task);
  } catch (err) {
    console.error("Update Task Error:", err);
    next(err);
  }
};

/* =============================================================
   UPDATE STATUS ONLY (For Kanban Drag & Drop)
   ============================================================= */
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid Task ID" });
    }

    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    task.status = req.body.status;
    await task.save(); // ✅ Saves to the 'status' column in 'Tasks' table
    res.json(task);
  } catch (err) {
    console.error("Status Update Error:", err);
    next(err);
  }
};

/* =============================================================
   DELETE TASK
   ============================================================= */
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid Task ID" });
    }

    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    await task.destroy(); // ✅ Removes record from 'Tasks' table
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Delete Task Error:", err);
    next(err);
  }
};