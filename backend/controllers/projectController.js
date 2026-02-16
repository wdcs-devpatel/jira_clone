const Project = require("../models/Project");

/* CREATE PROJECT */
exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create({
      ...req.body,
      userId: req.user.id // Ownership assigned here
    });
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

/* GET ALL PROJECTS (USER SPECIFIC) */
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      where: { userId: req.user.id }, 
      order: [["createdAt", "DESC"]],
    });
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

/* GET SINGLE PROJECT */
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!project)
      return res.status(404).json({ message: "Project not found or unauthorized" });
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

    if (!project)
      return res.status(404).json({ message: "Project not found or unauthorized" });

    await project.destroy();
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    next(err);
  }
};