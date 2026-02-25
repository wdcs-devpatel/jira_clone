const { Project, Task, User } = require("../models");
const { Op } = require("sequelize");

/* =============================================================
   PROJECT MANAGEMENT
   ============================================================= */

/**
 * CREATE PROJECT
 * Maps the owner to the 'userId' field in the 'Projects' table.
 */
exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create({
      ...req.body,
      userId: req.user.id // ✅ Correct camelCase field mapping
    });
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

/**
 * GET ALL PROJECTS
 * Retrieves projects using the 'Projects' and 'Tasks' tables as seen in pgAdmin.
 */
exports.getProjects = async (req, res, next) => {
  try {
    // 1. Projects owned by user (ordering by the correct camelCase column)
    const ownedProjects = await Project.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]], // ✅ Matches pgAdmin 'createdAt' column
    });

    // 2. Projects where user is a task assignee
    const assignedTasks = await Task.findAll({
      where: { assigneeId: req.user.id } // ✅ Matches 'assigneeId' in Task table
    });

    const assignedProjectIds = [...new Set(assignedTasks.map(t => t.projectId))];

    const assignedProjects = await Project.findAll({
      where: {
        id: { [Op.in]: assignedProjectIds }
      }
    });

    // 3. Combine and filter for unique entries
    const combined = [...ownedProjects, ...assignedProjects];
    const uniqueProjects = Object.values(
      combined.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {})
    );

    res.json(uniqueProjects);
  } catch (err) {
    console.error("Dashboard Load Error:", err);
    next(err);
  }
};

/**
 * GET SINGLE PROJECT
 * Access logic using direct ID comparisons for RBAC stability.
 */
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Allow if owner
    if (Number(project.userId) === Number(req.user.id)) {
      return res.json(project);
    }

    // Allow if assigned to a task within the 'Tasks' table
    const assigned = await Task.findOne({
      where: {
        projectId: project.id,
        assigneeId: req.user.id
      }
    });

    if (!assigned) {
      return res.status(403).json({ message: "Access denied: Not part of project" });
    }

    res.json(project);
  } catch (err) {
    next(err);
  }
};

/**
 * UPDATE PROJECT
 * Validates ownership against the 'userId' column before updating.
 */
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

/**
 * DELETE PROJECT
 */
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

/* =============================================================
   TEAM MEMBER MANAGEMENT
   ============================================================= */

/**
 * ADD TEAM MEMBER
 * Updates the 'members' JSON column in the 'Projects' table.
 */
exports.addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findByPk(req.params.id);

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    // Security: Explicit ownership check
    if (Number(project.userId) !== Number(req.user.id)) {
      return res.status(403).json({
        message: "Only the project owner can add members"
      });
    }

    const currentMembers = project.members || [];

    if (Number(userId) === Number(project.userId)) {
      return res.status(400).json({
        message: "Owner is already the project leader"
      });
    }

    if (currentMembers.includes(userId)) {
      return res.status(400).json({
        message: "User is already a member"
      });
    }

    project.members = [...currentMembers, userId];
    await project.save();

    res.json(project.members);

  } catch (err) {
    next(err);
  }
};

/**
 * REMOVE TEAM MEMBER
 */
exports.removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const project = await Project.findByPk(id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (Number(project.userId) !== Number(req.user.id)) {
      return res.status(403).json({ message: "Only owner can remove members" });
    }

    const currentMembers = project.members || [];
    const updatedMembers = currentMembers.filter(mId => String(mId) !== String(userId));
    
    project.members = updatedMembers;
    await project.save();

    res.json(project.members);
  } catch (err) {
    next(err);
  }
};

/**
 * GET PROJECT MEMBERS
 * Merges 'userId' (owner) and 'members' (invited) array.
 */
exports.getMembers = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const members = project.members || [];
    const allMembers = [...new Set([project.userId, ...members])];

    res.json(allMembers);
  } catch (err) {
    next(err);
  }
};