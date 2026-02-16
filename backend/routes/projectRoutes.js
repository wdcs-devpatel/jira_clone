const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

/* =========================
   CREATE PROJECT
========================= */
router.post("/", async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* =========================
   GET ALL PROJECTS
========================= */
router.get("/", async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   UPDATE PROJECT
========================= */
router.put("/:id", async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await project.update(req.body);

    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* =========================
   DELETE PROJECT
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await project.destroy();

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
