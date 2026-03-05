const Activity = require("../models/Activity");

/* Create Activity */
exports.createActivity = async (req, res) => {

  try {

    const { taskId, user, action, details } = req.body;

    const activity = await Activity.create({
      taskId,
      user,
      action,
      details
    });

    res.status(201).json(activity);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

};


/* Get Activity for Task */
exports.getTaskActivity = async (req, res) => {

  try {

    const activities = await Activity.find({
      taskId: req.params.taskId
    }).sort({ createdAt: -1 });

    res.json(activities);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

};