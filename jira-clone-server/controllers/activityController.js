const Activity = require("../models/Activity");
const publishActivity = require("../rabbitmq/activityProducer");
/* Create Activity */
exports.createActivity = async (req, res) => {
  try {
    const { taskId, user, action, details } = req.body;

    const data = {
      taskId,
      user,
      action,
      details
    };

    // send to RabbitMQ queue
    await publishActivity(data);

    res.status(201).json({
      message: "Activity sent to queue"
    });

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