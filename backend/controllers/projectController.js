const Project = require("../models/Project");
const Task = require("../models/Task");
const { Op } = require("sequelize");

/* CREATE PROJECT */
exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create({
      ...req.body,
      userId: req.user.id 
    });
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

/* GET ALL PROJECTS (OWNED OR ASSIGNED) */
exports.getProjects = async (req, res, next) => {
  try {
    const ownedProjects = await Project.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    const assignedTasks = await Task.findAll({
      where: { assigneeId: req.user.id }
    });

    const assignedProjectIds = [...new Set(assignedTasks.map(t => t.projectId))];

    const assignedProjects = await Project.findAll({
      where: {
        id: { [Op.in]: assignedProjectIds }
      }
    });

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

    if (project.userId === req.user.id) {
      return res.json(project);
    }

    const assigned = await Task.findOne({
      where: {
        projectId: project.id,
        assigneeId: req.user.id
      }
    });

    if (!assigned) {
      return res.status(403).json({ message: "Access denied" });
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
      where: { id: req.params.id, userId: req.user.id }
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
      where: { id: req.params.id, userId: req.user.id }
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

/* --- ADD TEAM MEMBER --- */
exports.addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findByPk(req.params.id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Security check: Compare logged in user ID with Project owner ID
    if (project.userId !== req.user.id) {
      return res.status(403).json({ message: "Only the project owner can add members" });
    }

    const currentMembers = project.members || [];
    
    if (currentMembers.includes(userId)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    const updatedMembers = [...currentMembers, userId];
    project.members = updatedMembers;
    await project.save();

    res.json(project.members);
  } catch (err) {
    next(err);
  }
};

/* --- REMOVE TEAM MEMBER --- */
exports.removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const project = await Project.findByPk(id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Security check: Only owner can remove members
    if (project.userId !== req.user.id) {
      return res.status(403).json({ message: "Only the project owner can remove members" });
    }

    const currentMembers = project.members || [];
    
    // Filter out the specific user
    const updatedMembers = currentMembers.filter(mId => String(mId) !== String(userId));
    
    project.members = updatedMembers;
    await project.save();

    res.json(project.members);
  } catch (err) {
    next(err);
  }
};

/* --- GET PROJECT MEMBERS --- */
exports.getMembers = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project.members || []);
  } catch (err) {
    next(err);
  }
};