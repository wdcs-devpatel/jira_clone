const Project = require("../models/Project");
const Task = require("../models/Task");
const { Op } = require("sequelize");

/* =============================================================
   PROJECT MANAGEMENT
   ============================================================= */

/**
 * CREATE PROJECT
 * Assigns the currently logged-in user as the project owner (userId).
 */
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

/**
 * GET ALL PROJECTS
 * Retrieves projects owned by the user OR projects where the user 
 * is assigned to at least one task.
 */
exports.getProjects = async (req, res, next) => {
  try {
    // 1. Projects owned by user
    const ownedProjects = await Project.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    // 2. Projects where user is a task assignee
    const assignedTasks = await Task.findAll({
      where: { assigneeId: req.user.id }
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
    next(err);
  }
};

/**
 * GET SINGLE PROJECT
 * Access allowed if user is the owner or assigned to a task within the project.
 */
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Allow if owner
    if (project.userId === req.user.id) {
      return res.json(project);
    }

    // Allow if assigned to a task
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

/**
 * UPDATE PROJECT
 * Only the owner can update project details.
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
 * Only the owner can delete the project.
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
 * Only owner can add members. Prevents adding the owner or duplicate members.
 */
exports.addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findByPk(req.params.id);

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    // Security: Strict numeric check for ownership
    if (Number(project.userId) !== Number(req.user.id)) {
      return res.status(403).json({
        message: "Only the project owner can add members"
      });
    }

    const currentMembers = project.members || [];

    // Prevent adding owner to the invited list
    if (Number(userId) === Number(project.userId)) {
      return res.status(400).json({
        message: "Owner is already the project leader"
      });
    }

    // Prevent duplicates
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
 * Only the owner can remove members from the project list.
 */
exports.removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const project = await Project.findByPk(id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Security check
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

/**
 * GET PROJECT MEMBERS
 * Returns a combined list of the project owner AND invited members.
 */
exports.getMembers = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const members = project.members || [];

    // Combine owner ID with member IDs and ensure uniqueness
    const allMembers = [...new Set([project.userId, ...members])];

    res.json(allMembers);
  } catch (err) {
    next(err);
  }
};