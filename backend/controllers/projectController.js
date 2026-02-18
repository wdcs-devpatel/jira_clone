const Project = require("../models/Project");
const Task = require("../models/Task");
const { Op } = require("sequelize");

/* CREATE PROJECT */
exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create({
      ...req.body,
      userId: req.user.id // Security: Forced ownership from JWT token
    });
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

/* GET ALL PROJECTS (OWNED OR ASSIGNED) */
exports.getProjects = async (req, res, next) => {
  try {
    // 1. Fetch projects belonging to the logged-in user (Owner)
    const ownedProjects = await Project.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    // 2. Fetch tasks assigned to the logged-in user
    const assignedTasks = await Task.findAll({
      where: { assigneeId: req.user.id }
    });

    // 3. Extract unique project IDs from those tasks
    const assignedProjectIds = [...new Set(assignedTasks.map(t => t.projectId))];

    // 4. Fetch the projects associated with those IDs
    const assignedProjects = await Project.findAll({
      where: {
        id: { [Op.in]: assignedProjectIds }
      }
    });

    // 5. Combine and remove duplicates (if a user owns a project AND is assigned to a task in it)
    const combined = [...ownedProjects, ...assignedProjects];
    const uniqueProjects = Object.values(
      combined.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {})
    );

    res.json(uniqueProjects);
  } catch (err) {
    next(err);
  }
};

/* GET SINGLE PROJECT */
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is the owner
    if (project.userId === req.user.id) {
      return res.json(project);
    }

    // Check if user is assigned to any task in this project
    const assigned = await Task.findOne({
      where: {
        projectId: project.id,
        assigneeId: req.user.id
      }
    });

    if (!assigned) {
      return res.status(403).json({ message: "Access denied: Not owner or assignee" });
    }

    res.json(project);
  } catch (err) {
    next(err);
  }
};

/* UPDATE PROJECT */
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found or unauthorized" });
    }
    
    await project.update({
      name: req.body.name,
      description: req.body.description,
      priority: req.body.priority,
      teamLeader: req.body.teamLeader
    });

    res.json(project);
  } catch (err) {
    next(err);
  }
};

/* DELETE PROJECT */
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id // Only owner can delete
      }
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found or unauthorized" });
    }

    await project.destroy();
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    next(err);
  }
};