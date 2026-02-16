const express = require("express");
const router = express.Router();
const { Task } = require("../models");

/* GET TASKS BY PROJECT */
router.get("/project/:projectId", async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { projectId: req.params.projectId },
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* CREATE TASK */
router.post("/project/:projectId", async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      projectId: req.params.projectId,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* UPDATE TASK */
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task)
      return res.status(404).json({ message: "Task not found" });

    await task.update(req.body);
    res.json(task);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* UPDATE STATUS ONLY */
router.patch("/:id/status", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task)
      return res.status(404).json({ message: "Task not found" });

    task.status = req.body.status;
    await task.save();

    res.json(task);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* DELETE TASK */
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task)
      return res.status(404).json({ message: "Task not found" });

    await task.destroy();
    res.json({ message: "Task deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
