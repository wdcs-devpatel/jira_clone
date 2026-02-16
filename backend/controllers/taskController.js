const Task = require("../models/Task");

/* CREATE TASK */
exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

/* GET TASKS BY PROJECT */
exports.getTasksByProject = async (req, res, next) => {
  try {
    const tasks = await Task.findAll({
      where: { projectId: req.params.projectId },
      order: [["createdAt", "DESC"]],
    });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

/* UPDATE TASK */
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task)
      return res.status(404).json({ message: "Task not found" });

    await task.update(req.body);

    res.json(task);
  } catch (err) {
    next(err);
  }
};

/* DELETE TASK */
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task)
      return res.status(404).json({ message: "Task not found" });

    await task.destroy();

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
};
