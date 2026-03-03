const { Project, Task, User } = require("../models");
const { Op } = require("sequelize");

/* =============================================================
   PROJECT MANAGEMENT
   ============================================================= */

/**
 * CREATE PROJECT
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
 * Standardized Admin detection for global oversight.
 */
exports.getProjects = async (req, res, next) => {
  try {
    // ✅ Standardized Admin Check
    const isAdmin =
      req.user.role === "Admin" ||
      req.user.permissions?.includes("view_admin_panel");

    if (isAdmin) {
      const allProjects = await Project.findAll({
        order: [["createdAt", "DESC"]],
      });
      return res.json(allProjects);
    }

    // Normal User Logic
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
    console.error("Dashboard Load Error:", err);
    next(err);
  }
};

/**
 * GET SINGLE PROJECT
 */
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // ✅ Standardized Admin Check
    const isAdmin =
      req.user.role === "Admin" ||
      req.user.permissions?.includes("view_admin_panel");

    if (isAdmin) {
      return res.json(project);
    }

    // Allow if owner
    if (Number(project.userId) === Number(req.user.id)) {
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
      return res.status(403).json({ message: "Access denied: Not part of project" });
    }

    res.json(project);
  } catch (err) {
    next(err);
  }
};

/**
 * UPDATE PROJECT
 */
exports.updateProject = async (req, res, next) => {
  try {
    // ✅ Standardized Admin Check
    const isAdmin =
      req.user.role === "Admin" ||
      req.user.permissions?.includes("view_admin_panel");
    
    const queryCondition = isAdmin 
      ? { id: req.params.id } 
      : { id: req.params.id, userId: req.user.id };

    const project = await Project.findOne({ where: queryCondition });

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
    // ✅ Standardized Admin Check
    const isAdmin =
      req.user.role === "Admin" ||
      req.user.permissions?.includes("view_admin_panel");
    
    const queryCondition = isAdmin 
      ? { id: req.params.id } 
      : { id: req.params.id, userId: req.user.id };

    const project = await Project.findOne({ where: queryCondition });

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
 */
exports.addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findByPk(req.params.id);
    
    // ✅ Standardized Admin Check
    const isAdmin =
      req.user.role === "Admin" ||
      req.user.permissions?.includes("view_admin_panel");

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    if (!isAdmin && Number(project.userId) !== Number(req.user.id)) {
      return res.status(403).json({
        message: "Only the project owner or Admin can add members"
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
    
    // ✅ Standardized Admin Check
    const isAdmin =
      req.user.role === "Admin" ||
      req.user.permissions?.includes("view_admin_panel");

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!isAdmin && Number(project.userId) !== Number(req.user.id)) {
      return res.status(403).json({ message: "Only owner or Admin can remove members" });
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
 * 🔥 Standardized with Security Logic
 */
exports.getMembers = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // ✅ Standardized Admin Check
    const isAdmin =
      req.user.role === "Admin" ||
      req.user.permissions?.includes("view_admin_panel");

    const isOwner = Number(project.userId) === Number(req.user.id);

    const assigned = await Task.findOne({
      where: {
        projectId: project.id,
        assigneeId: req.user.id
      }
    });

    // 🛑 Block access if user is not Admin, Owner, or assigned to a task
    if (!isAdmin && !isOwner && !assigned) {
      return res.status(403).json({
        message: "Access denied: Not part of project"
      });
    }

    const members = project.members || [];
    const allMembers = [...new Set([project.userId, ...members])];

    res.json(allMembers);
  } catch (err) {
    next(err);
  }
};