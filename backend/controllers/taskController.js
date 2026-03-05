const { Task, Project, User } = require("../models");
const { Op } = require("sequelize");

/* =============================================================
   SEARCH TASKS
   ============================================================= */
exports.searchTasks = async (req, res, next) => {
  try {
    const q = req.query.q || "";
    const isAdmin = req.user.role === "Admin"; 

    const whereCondition = {
      title: { [Op.iLike]: `%${q}%` }
    };

    if (!isAdmin) {
      whereCondition[Op.or] = [
        { assigneeId: req.user.id },
        { "$Project.userId$": req.user.id }
      ];
    }

    const tasks = await Task.findAll({
      where: whereCondition,
      include: [
        {
          model: Project,
          attributes: ["userId", "name"]
        },
        {
          model: User,
          as: "assignee",
          attributes: ["id", "username", "firstName", "lastName"]
        }
      ],
      order: [["createdAt", "DESC"]],
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
    const isAdmin = req.user.role === "Admin"; 

    if (!projectId || isNaN(projectId)) {
      return res.status(400).json({ message: "Valid Project ID is required" });
    }

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!isAdmin && Number(project.userId) !== Number(req.user.id)) {
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
      projectId: projectId, 
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

    const tasks = await Task.findAll({
      where: { projectId },
      include: [
        {
          model: User,
          as: "assignee",
          attributes: ["id", "username", "firstName", "lastName"]
        }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(tasks);
  } catch (err) {
    console.error("Get Project Tasks Error:", err);
    next(err);
  }
};

/* =============================================================
   GET SINGLE TASK (NEWLY ADDED)
============================================================= */
exports.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid Task ID" });
    }

    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: "assignee",
          attributes: ["id", "username", "firstName", "lastName"]
        },
        {
          model: Project,
          attributes: ["id", "name", "userId"]
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    console.error("Get Task Error:", err);
    next(err);
  }
};

/* =============================================================
   UPDATE TASK
   ============================================================= */
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === "Admin"; 

    if (!id || isNaN(id) || id === "NaN") {
      return res.status(400).json({ message: "Invalid Task ID provided" });
    }

    const task = await Task.findByPk(id, {
      include: [{ model: Project, attributes: ["userId"] }]
    });

    if (!task) return res.status(404).json({ message: "Task not found" });
    
    if (!isAdmin && 
        Number(task.assigneeId) !== Number(req.user.id) && 
        Number(task.Project?.userId) !== Number(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized to update this task" });
    }

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
    const isAdmin = req.user.role === "Admin"; 

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid Task ID" });
    }

    const task = await Task.findByPk(id, {
      include: [{ model: Project, attributes: ["userId"] }]
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!isAdmin && 
        Number(task.assigneeId) !== Number(req.user.id) && 
        Number(task.Project?.userId) !== Number(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized to change status" });
    }
    
    task.status = req.body.status;
    await task.save(); 
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
    const isAdmin = req.user.role === "Admin"; 

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid Task ID" });
    }

    const task = await Task.findByPk(id, {
      include: [{ model: Project, attributes: ["userId"] }]
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!isAdmin && Number(task.Project?.userId) !== Number(req.user.id)) {
      return res.status(403).json({ message: "Only Admins or Project Owners can delete tasks" });
    }
    
    await task.destroy(); 
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Delete Task Error:", err);
    next(err);
  }
};