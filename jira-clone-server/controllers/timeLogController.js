const TimeLog = require("../models/TimeLog");

/* CREATE TIME LOG */

exports.createTimeLog = async (req, res) => {

  try {

    const { taskId, user, timeSpent, dateStarted, description } = req.body;

    const log = await TimeLog.create({
      taskId,
      user,
      timeSpent,
      dateStarted,
      description
    });

    res.status(201).json(log);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

};

exports.getTimeLogs = async (req, res) => {

  try {

    const logs = await TimeLog.find({
      taskId: req.params.taskId
    }).sort({ createdAt: -1 });

    res.json(logs);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

};